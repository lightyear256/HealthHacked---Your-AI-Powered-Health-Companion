import React, { useState } from 'react';
import { Search, Pill, AlertCircle, Info } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { healthAPI } from '../services/api';
import toast from 'react-hot-toast';

interface DrugInfo {
  name: string;
  genericName: string | null;
  brandNames: string[];
  purpose: string | null;
  uses: string | null;
  dosage: string | null;
  sideEffects: string | null;
  warnings: string | null;
  interactions: string | null;
  pregnancy: string | null;
  storage: string | null;
}

interface DrugSuggestion {
  rxcui: string;
  name: string;
  score: number;
}

export function PillProfile() {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
  const [suggestions, setSuggestions] = useState<DrugSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const commonMedicines = [
    'Paracetamol', 'Crocin', 'Dolo 650', 'Combiflam', 
    'Aspirin', 'Ibuprofen', 'Amoxicillin', 'Azithromycin',
    'Cetirizine', 'Omeprazole', 'Pantoprazole', 'Metformin'
  ];

  const searchDrug = async (term: string) => {
    if (term.trim().length < 2) {
      toast.error('Please enter at least 2 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setShowSuggestions(false);

    try {
      const response = await healthAPI.searchDrug(term);
      
      if (response.success && response.drugInfo) {
        setDrugInfo(response.drugInfo);
        setSuggestions([]);
      } else if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
        setShowSuggestions(true);
        setDrugInfo(null);
      } else {
        setError('No drug information found. Try different spelling or brand name.');
        setDrugInfo(null);
        setSuggestions([]);
      }
    } catch (error: any) {
      console.error('Drug search error:', error);
      setError('Failed to search drug information. Please try again.');
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchDrug(searchTerm);
  };

  const selectSuggestion = (suggestion: DrugSuggestion) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    searchDrug(suggestion.name);
  };

  const InfoSection = ({ title, content, icon }: { title: string; content: string | null; icon?: React.ReactNode }) => {
    if (!content) return null;
    
    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h3>
        <p className="text-white whitespace-pre-line leading-relaxed">{content}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 mt-20">
          <div className="flex items-center mb-4">
            <Pill className="h-8 w-8 text-purple-600 mr-3" />
            <h1 className="text-3xl font-bold text-white">Pill Profile</h1>
          </div>
          <p className="text-white">
            Search for any medicine to get detailed information about uses, side effects, and more.
          </p>
        </div>

        {/* Search Bar */}
        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="relative">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter medicine name (e.g., Paracetamol, Crocin, Dolo)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    disabled={loading}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm('');
                        setDrugInfo(null);
                        setSuggestions([]);
                        setError(null);
                      }}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading || !searchTerm.trim()}
                  className="flex items-center"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-2">
                    <p className="text-sm text-gray-500 mb-2">Did you mean:</p>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => selectSuggestion(suggestion)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded flex items-center justify-between"
                      >
                        <span>{suggestion.name}</span>
                        <span className="text-xs text-gray-400">Match: {Math.round(suggestion.score)}%</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Quick Search Suggestions */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {commonMedicines.map((medicine) => (
                <button
                  key={medicine}
                  onClick={() => {
                    setSearchTerm(medicine);
                    searchDrug(medicine);
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-purple-600 hover:text-white rounded-full text-black transition-colors"
                >
                  {medicine}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="p-6 mb-8 bg-yellow-900/30 border border-yellow-600  rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-yellow-200">{error}</p>
                <p className="text-sm text-yellow-200 mt-1">
                  Tip: Try searching with different spellings or brand names
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Drug Information */}
        {drugInfo && (
          <Card className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                {drugInfo.name}
              </h2>
              {drugInfo.genericName && drugInfo.genericName !== drugInfo.name && (
                <p className="text-white">
                  Generic Name: <span className="font-medium">{drugInfo.genericName}</span>
                </p>
              )}
              {drugInfo.brandNames.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-white">Also known as: </span>
                  <span className="text-sm text-gray-400">
                    {drugInfo.brandNames.slice(0, 5).join(', ')}
                    {drugInfo.brandNames.length > 5 && ` and ${drugInfo.brandNames.length - 5} more`}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <InfoSection 
                title="Purpose" 
                content={drugInfo.purpose}
                icon={<Info className="h-5 w-5 text-blue-600" />}
              />
              
              <InfoSection 
                title="Uses" 
                content={drugInfo.uses}
                icon={<Pill className="h-5 w-5 text-green-600" />}
              />
              
              <InfoSection 
                title="Dosage & Administration" 
                content={drugInfo.dosage}
              />
              
              <InfoSection 
                title="Side Effects" 
                content={drugInfo.sideEffects}
                icon={<AlertCircle className="h-5 w-5 text-yellow-600" />}
              />
              
              <InfoSection 
                title="Warnings" 
                content={drugInfo.warnings}
                icon={<AlertCircle className="h-5 w-5 text-red-600" />}
              />
              
              <InfoSection 
                title="Drug Interactions" 
                content={drugInfo.interactions}
              />
              
              <InfoSection 
                title="Pregnancy & Breastfeeding" 
                content={drugInfo.pregnancy}
              />
              
              <InfoSection 
                title="Storage" 
                content={drugInfo.storage}
              />
            </div>

            {/* Disclaimer */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> This information is for educational purposes only. 
                Always consult your healthcare provider or pharmacist before taking any medication. 
                Individual responses to medications may vary.
              </p>
            </div>
          </Card>
        )}

        {/* No Results State */}
        {!loading && !drugInfo && !error && searchTerm && (
          <Card className="p-8 text-center">
            <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              Search for a medicine to see detailed information
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}