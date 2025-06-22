const express = require('express');
const { protect } = require('../middleware/auth');
const drugService = require('../services/external/drugService');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const router = express.Router();

// @route   GET /api/drugs/search
// @desc    Search for drug information
// @access  Public (no auth required for drug info)
router.get('/search', async (req, res, next) => {
  try {
    const { q, term } = req.query;
    const searchTerm = q || term;
    
    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search term must be at least 2 characters'
      });
    }
    
    logger.info('Drug search request', { searchTerm });
    
    const result = await drugService.searchDrug(searchTerm);
    
    res.json(result);
    
  } catch (error) {
    logger.error('Drug search error:', error);
    next(error);
  }
});

// @route   GET /api/drugs/:drugName
// @desc    Get detailed drug information
// @access  Public
router.get('/:drugName', async (req, res, next) => {
  try {
    const { drugName } = req.params;
    
    logger.info('Drug info request', { drugName });
    
    const drugInfo = await drugService.getDrugInfo(drugName);
    
    res.json({
      success: true,
      data: drugInfo
    });
    
  } catch (error) {
    logger.error('Drug info error:', error);
    next(error);
  }
});

// @route   POST /api/drugs/interactions
// @desc    Check drug interactions (requires auth)
// @access  Private
router.post('/interactions', protect, async (req, res, next) => {
  try {
    const { drugs } = req.body;
    
    if (!drugs || !Array.isArray(drugs) || drugs.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide at least 2 drugs to check interactions'
      });
    }
    
    logger.info('Drug interaction check', { 
      userId: req.user._id,
      drugs 
    });
    
    // For now, return a message to consult healthcare provider
    // In future, integrate with a proper drug interaction API
    res.json({
      success: true,
      message: 'For detailed drug interaction information, please consult your healthcare provider or pharmacist.',
      disclaimer: 'Drug interactions can be complex and depend on various factors including dosage, timing, and individual health conditions.'
    });
    
  } catch (error) {
    logger.error('Drug interaction error:', error);
    next(error);
  }
});

// @route   GET /api/drugs/common/india
// @desc    Get common Indian medicines
// @access  Public
router.get('/common/india', (req, res) => {
  const commonMedicines = [
    { brand: 'Crocin', generic: 'Paracetamol', use: 'Pain & Fever' },
    { brand: 'Dolo 650', generic: 'Paracetamol', use: 'Pain & Fever' },
    { brand: 'Combiflam', generic: 'Ibuprofen + Paracetamol', use: 'Pain & Inflammation' },
    { brand: 'Voveran', generic: 'Diclofenac', use: 'Pain & Inflammation' },
    { brand: 'Pan 40', generic: 'Pantoprazole', use: 'Acidity' },
    { brand: 'Omez', generic: 'Omeprazole', use: 'Acidity' },
    { brand: 'Azithral 500', generic: 'Azithromycin', use: 'Antibiotic' },
    { brand: 'Augmentin', generic: 'Amoxicillin + Clavulanic Acid', use: 'Antibiotic' },
    { brand: 'Cetirizine', generic: 'Cetirizine', use: 'Allergy' },
    { brand: 'Allegra', generic: 'Fexofenadine', use: 'Allergy' },
    { brand: 'Asthalin', generic: 'Salbutamol', use: 'Asthma' },
    { brand: 'Glycomet', generic: 'Metformin', use: 'Diabetes' },
    { brand: 'Ecosprin', generic: 'Aspirin', use: 'Blood Thinner' },
    { brand: 'Thyronorm', generic: 'Levothyroxine', use: 'Thyroid' }
  ];
  
  res.json({
    success: true,
    data: commonMedicines
  });
});

module.exports = router;