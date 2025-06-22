const axios = require('axios');
const logger = require('../../utils/logger');

class DrugService {
  constructor() {
    this.rxNormBaseUrl = 'https://rxnav.nlm.nih.gov/REST';
    this.openFdaBaseUrl = 'https://api.fda.gov/drug';
    
    // Common Indian medicine name mappings
    this.indianMedicineMap = {
      'crocin': 'paracetamol',
      'dolo': 'paracetamol',
      'metacin': 'paracetamol',
      'calpol': 'paracetamol',
      'combiflam': 'ibuprofen paracetamol',
      'brufen': 'ibuprofen',
      'aspirin': 'acetylsalicylic acid',
      'disprin': 'aspirin',
      'voveran': 'diclofenac',
      'zerodol': 'aceclofenac',
      'pan': 'pantoprazole',
      'pan-d': 'pantoprazole domperidone',
      'omez': 'omeprazole',
      'rantac': 'ranitidine',
      'zinetac': 'ranitidine',
      'azithral': 'azithromycin',
      'augmentin': 'amoxicillin clavulanic acid',
      'mox': 'amoxicillin',
      'cifran': 'ciprofloxacin',
      'norflox': 'norfloxacin',
      'oflox': 'ofloxacin',
      'levocet': 'levocetirizine',
      'cetrizine': 'cetirizine',
      'allegra': 'fexofenadine',
      'avil': 'pheniramine',
      'betnesol': 'betamethasone',
      'wysolone': 'prednisolone',
      'asthalin': 'salbutamol',
      'deriphyllin': 'theophylline etophylline',
      'glycomet': 'metformin',
      'janumet': 'sitagliptin metformin',
      'telma': 'telmisartan',
      'amlokind': 'amlodipine',
      'ecosprin': 'aspirin',
      'clopitab': 'clopidogrel',
      'atorva': 'atorvastatin',
      'rosuva': 'rosuvastatin',
      'thyronorm': 'levothyroxine',
      'eltroxin': 'levothyroxine'
    };
  }

  // Normalize drug name (handle Indian brand names)
  normalizeDrugName(input) {
    const normalized = input.toLowerCase().trim();
    
    // Check if it's a known Indian brand name
    if (this.indianMedicineMap[normalized]) {
      return this.indianMedicineMap[normalized];
    }
    
    // Check partial matches
    for (const [brand, generic] of Object.entries(this.indianMedicineMap)) {
      if (normalized.includes(brand) || brand.includes(normalized)) {
        return generic;
      }
    }
    
    return normalized;
  }

  // Search for drug with fuzzy matching
  async searchDrug(searchTerm) {
    try {
      logger.info('Searching for drug:', searchTerm);
      
      // First normalize the search term
      const normalizedTerm = this.normalizeDrugName(searchTerm);
      
      // Try RxNorm fuzzy search
      const suggestions = await this.getRxNormSuggestions(normalizedTerm);
      
      if (suggestions.length === 0) {
        // Fallback to original term if normalization didn't help
        const fallbackSuggestions = await this.getRxNormSuggestions(searchTerm);
        if (fallbackSuggestions.length > 0) {
          suggestions.push(...fallbackSuggestions);
        }
      }
      
      // Get detailed info for the best match
      if (suggestions.length > 0) {
        const bestMatch = suggestions[0];
        const drugInfo = await this.getDrugInfo(bestMatch.name);
        
        return {
          success: true,
          searchTerm,
          normalizedTerm,
          suggestions: suggestions.slice(0, 5),
          drugInfo
        };
      }
      
      // If no results, try OpenFDA directly
      const fdaInfo = await this.searchOpenFDA(searchTerm);
      if (fdaInfo) {
        return {
          success: true,
          searchTerm,
          normalizedTerm,
          suggestions: [],
          drugInfo: fdaInfo
        };
      }
      
      return {
        success: false,
        searchTerm,
        message: 'No drug information found',
        suggestions: []
      };
      
    } catch (error) {
      logger.error('Drug search error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get suggestions from RxNorm (handles misspellings)
  async getRxNormSuggestions(term) {
    try {
      const response = await axios.get(`${this.rxNormBaseUrl}/approximateTerm.json`, {
        params: {
          term,
          maxEntries: 10
        }
      });
      
      if (response.data.approximateGroup?.candidate) {
        return response.data.approximateGroup.candidate.map(c => ({
          rxcui: c.rxcui,
          name: c.name,
          score: c.score
        }));
      }
      
      return [];
    } catch (error) {
      logger.error('RxNorm API error:', error);
      return [];
    }
  }

  // Get comprehensive drug information
  async getDrugInfo(drugName) {
    const info = {
      name: drugName,
      genericName: null,
      brandNames: [],
      purpose: null,
      uses: null,
      dosage: null,
      sideEffects: null,
      warnings: null,
      interactions: null,
      pregnancy: null,
      storage: null
    };
    
    // Try OpenFDA first
    const fdaData = await this.searchOpenFDA(drugName);
    if (fdaData) {
      Object.assign(info, fdaData);
    }
    
    // Get RxNorm properties
    const rxNormData = await this.getRxNormProperties(drugName);
    if (rxNormData) {
      info.brandNames = rxNormData.brandNames || info.brandNames;
      info.genericName = rxNormData.genericName || info.genericName;
    }
    
    // Add common Indian brand names if applicable
    const indianBrands = this.getIndianBrandNames(drugName);
    if (indianBrands.length > 0) {
      info.brandNames = [...new Set([...info.brandNames, ...indianBrands])];
    }
    
    return info;
  }

  // Search OpenFDA
  async searchOpenFDA(drugName) {
    try {
      // Try multiple search strategies
      const searchQueries = [
        `openfda.generic_name:"${drugName}"`,
        `openfda.brand_name:"${drugName}"`,
        `openfda.substance_name:"${drugName}"`,
        `active_ingredient:"${drugName}"`
      ];
      
      for (const query of searchQueries) {
        const response = await axios.get(`${this.openFdaBaseUrl}/label.json`, {
          params: {
            search: query,
            limit: 1
          }
        });
        
        if (response.data.results && response.data.results.length > 0) {
          const data = response.data.results[0];
          
          return {
            purpose: this.cleanText(data.purpose?.[0]),
            uses: this.cleanText(data.indications_and_usage?.[0]),
            dosage: this.cleanText(data.dosage_and_administration?.[0]),
            sideEffects: this.cleanText(data.adverse_reactions?.[0]),
            warnings: this.cleanText(data.warnings?.[0] || data.boxed_warning?.[0]),
            interactions: this.cleanText(data.drug_interactions?.[0]),
            pregnancy: this.cleanText(data.pregnancy?.[0]),
            storage: this.cleanText(data.storage_and_handling?.[0]),
            brandNames: data.openfda?.brand_name || [],
            genericName: data.openfda?.generic_name?.[0]
          };
        }
      }
      
      return null;
    } catch (error) {
      if (error.response?.status !== 404) {
        logger.error('OpenFDA API error:', error);
      }
      return null;
    }
  }

  // Get RxNorm properties
  async getRxNormProperties(drugName) {
    try {
      // First get RxCUI
      const rxcuiResponse = await axios.get(`${this.rxNormBaseUrl}/rxcui.json`, {
        params: { name: drugName }
      });
      
      if (rxcuiResponse.data.idGroup?.rxnormId) {
        const rxcui = rxcuiResponse.data.idGroup.rxnormId[0];
        
        // Get properties
        const propsResponse = await axios.get(`${this.rxNormBaseUrl}/rxcui/${rxcui}/allrelated.json`);
        
        const conceptGroup = propsResponse.data.allRelatedGroup?.conceptGroup || [];
        const brandNames = [];
        let genericName = null;
        
        conceptGroup.forEach(group => {
          if (group.tty === 'BN') { // Brand names
            group.conceptProperties?.forEach(prop => {
              brandNames.push(prop.name);
            });
          }
          if (group.tty === 'IN') { // Ingredient
            genericName = group.conceptProperties?.[0]?.name;
          }
        });
        
        return { brandNames, genericName };
      }
      
      return null;
    } catch (error) {
      logger.error('RxNorm properties error:', error);
      return null;
    }
  }

  // Get Indian brand names for a generic drug
  getIndianBrandNames(genericName) {
    const brands = [];
    const normalized = genericName.toLowerCase();
    
    for (const [brand, generic] of Object.entries(this.indianMedicineMap)) {
      if (generic.includes(normalized) || normalized.includes(generic)) {
        brands.push(brand.charAt(0).toUpperCase() + brand.slice(1));
      }
    }
    
    return brands;
  }

  // Clean up text from FDA labels
  cleanText(text) {
    if (!text) return null;
    
    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, '');
    
    // Remove excessive whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    // Remove special characters
    text = text.replace(/[•·]/g, '- ');
    
    // Limit length for display
    if (text.length > 500) {
      text = text.substring(0, 497) + '...';
    }
    
    return text;
  }

  // Get drug interactions
  async getDrugInteractions(drugName) {
    try {
      // This would require a more sophisticated API
      // For now, return a placeholder
      return {
        success: true,
        message: 'For detailed drug interactions, please consult your healthcare provider.'
      };
    } catch (error) {
      logger.error('Drug interactions error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = new DrugService();