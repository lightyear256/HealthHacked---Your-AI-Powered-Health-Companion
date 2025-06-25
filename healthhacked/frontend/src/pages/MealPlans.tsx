import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { 
  ChefHat, 
  Search, 
  Clock, 
  Users, 
  Heart,
  Loader2,
  Plus,
  Calendar,
  Filter,
  Star,
  BookOpen,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

// Edamam API configuration
const EDAMAM_CONFIG = {
  APP_ID: '6184d652',
  APP_KEY: '7b6c4389e618475b5eccac44f0665eff',
  BASE_URL: 'https://api.edamam.com/api/recipes/v2'
};

interface Recipe {
  uri: string;
  label: string;
  image: string;
  source: string;
  url: string;
  yield: number;
  dietLabels: string[];
  healthLabels: string[];
  ingredientLines: string[];
  calories: number;
  totalTime: number;
  cuisineType: string[];
  mealType: string[];
  dishType: string[];
  nutrients: {
    ENERC_KCAL: { label: string; quantity: number; unit: string };
    PROCNT: { label: string; quantity: number; unit: string };
    FAT: { label: string; quantity: number; unit: string };
    CHOCDF: { label: string; quantity: number; unit: string };
  };
}

interface EdamamResponse {
  from: number;
  to: number;
  count: number;
  _links: {
    next?: {
      href: string;
      title: string;
    };
  };
  hits: Array<{
    recipe: Recipe;
    _links: {
      self: {
        href: string;
        title: string;
      };
    };
  }>;
}

export function MealPlans() {
  const { user } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [savedMealPlan, setSavedMealPlan] = useState<Recipe[]>([]);
  const [filters, setFilters] = useState({
    mealType: '',
    cuisineType: '',
    dietLabel: '',
    maxTime: ''
  });

  // Load saved meal plan from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('healthhacked_meal_plan');
    if (saved) {
      try {
        setSavedMealPlan(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved meal plan:', error);
      }
    }
  }, []);

  // Save meal plan to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('healthhacked_meal_plan', JSON.stringify(savedMealPlan));
  }, [savedMealPlan]);

  const searchRecipes = async (query: string = searchQuery, loadMore: boolean = false) => {
    setLoading(true);
    try {
      let url: string;
      
      if (loadMore && nextPageUrl) {
        url = nextPageUrl;
      } else {
        const params = new URLSearchParams({
          type: 'public',
          q: query || 'chicken',
          app_id: EDAMAM_CONFIG.APP_ID,
          app_key: EDAMAM_CONFIG.APP_KEY
        });

        // Add filters
        if (filters.mealType) params.append('mealType', filters.mealType);
        if (filters.cuisineType) params.append('cuisineType', filters.cuisineType);
        if (filters.dietLabel) params.append('diet', filters.dietLabel);
        if (filters.maxTime) params.append('time', `1-${filters.maxTime}`);

        url = `${EDAMAM_CONFIG.BASE_URL}?${params.toString()}`;
      }

      console.log('Making API request to:', url);
      
      // Generate a user ID for the API request
      const userId = user?.id || `healthhacked-user-${Date.now()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Edamam-Account-User': userId, // Required for this API plan
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: EdamamResponse = await response.json();
      console.log('API Response:', data);
      
      const newRecipes = data.hits.map(hit => hit.recipe);
      
      if (loadMore) {
        setRecipes(prev => [...prev, ...newRecipes]);
      } else {
        setRecipes(newRecipes);
      }
      
      setNextPageUrl(data._links?.next?.href || null);
      
      if (newRecipes.length === 0) {
        toast.error('No recipes found. Try different search terms.');
      } else {
        toast.success(`Found ${newRecipes.length} recipes!`);
      }
    } catch (error) {
      console.error('Detailed error:', error);
      if (error instanceof Error) {
        toast.error(`API Error: ${error.message}`);
      } else {
        toast.error('Failed to fetch recipes. Please check your API credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addToMealPlan = (recipe: Recipe) => {
    if (savedMealPlan.find(r => r.uri === recipe.uri)) {
      toast.error('Recipe already in your meal plan');
      return;
    }
    
    setSavedMealPlan(prev => [...prev, recipe]);
    toast.success('Recipe added to your meal plan!');
  };

  const removeFromMealPlan = (recipeUri: string) => {
    setSavedMealPlan(prev => prev.filter(r => r.uri !== recipeUri));
    toast.success('Recipe removed from meal plan');
  };

  const clearMealPlan = () => {
    setSavedMealPlan([]);
    toast.success('Meal plan cleared');
  };

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      mealType: '',
      cuisineType: '',
      dietLabel: '',
      maxTime: ''
    });
  };

  const RecipeCard = ({ recipe, showAddButton = true }: { recipe: Recipe; showAddButton?: boolean }) => (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div onClick={() => setSelectedRecipe(recipe)}>
        <img
          src={recipe.image}
          alt={recipe.label}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{recipe.label}</h3>
          <p className="text-sm text-gray-600 mb-2">by {recipe.source}</p>
          
          <div className="flex flex-wrap gap-2 mb-3">
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {recipe.totalTime ? `${recipe.totalTime} min` : 'Quick'}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Users className="h-4 w-4 mr-1" />
              {recipe.yield} servings
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Heart className="h-4 w-4 mr-1" />
              {Math.round(recipe.calories)} cal
            </div>
          </div>

          {recipe.dietLabels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {recipe.dietLabels.slice(0, 3).map((label, index) => (
                <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showAddButton && (
        <div className="px-4 pb-4">
          <Button 
            onClick={() => addToMealPlan(recipe)}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Meal Plan
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8 mt-20">
          <div className="flex justify-center items-center mb-4">
            <ChefHat className="h-12 w-12 text-purple-600 mr-3" />
            <h1 className="text-4xl font-bold text-white">Healthy Meal Plans</h1>
          </div>
          <p className="text-lg text-white max-w-2xl mx-auto">
            Discover nutritious recipes and create personalized meal plans to support your health goals
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search for recipes (e.g., 'chicken', 'vegetarian', 'low carb')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && searchRecipes()}
                  />
                </div>
              </div>
              <Button onClick={() => searchRecipes()} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                Search Recipes
              </Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <select
                value={filters.mealType}
                onChange={(e) => handleFilterChange('mealType', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="">All Meal Types</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>

              <select
                value={filters.cuisineType}
                onChange={(e) => handleFilterChange('cuisineType', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="">All Cuisines</option>
                <option value="american">American</option>
                <option value="asian">Asian</option>
                <option value="italian">Italian</option>
                <option value="mediterranean">Mediterranean</option>
                <option value="mexican">Mexican</option>
                <option value="indian">Indian</option>
              </select>

              <select
                value={filters.dietLabel}
                onChange={(e) => handleFilterChange('dietLabel', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="">All Diets</option>
                <option value="balanced">Balanced</option>
                <option value="high-protein">High-Protein</option>
                <option value="low-carb">Low-Carb</option>
                <option value="low-fat">Low-Fat</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
              </select>

              <select
                value={filters.maxTime}
                onChange={(e) => handleFilterChange('maxTime', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="">Any Time</option>
                <option value="30">Under 30 min</option>
                <option value="60">Under 1 hour</option>
                <option value="120">Under 2 hours</option>
              </select>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button variant="ghost" onClick={clearFilters} size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
              {savedMealPlan.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {savedMealPlan.length} recipes in meal plan
                  </span>
                  <Button variant="ghost" onClick={clearMealPlan} size="sm">
                    Clear Plan
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Current Meal Plan */}
        {savedMealPlan.length > 0 && (
          <Card className="mb-8">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold flex items-center">
                  <Calendar className="h-6 w-6 mr-2 text-purple-600" />
                  Your Meal Plan ({savedMealPlan.length} recipes)
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedMealPlan.map((recipe, index) => (
                  <div key={recipe.uri} className="relative">
                    <RecipeCard recipe={recipe} showAddButton={false} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromMealPlan(recipe.uri)}
                      className="absolute top-2 right-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Recipe Results */}
        {recipes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-6">Recipe Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe, index) => (
                <RecipeCard key={`${recipe.uri}-${index}`} recipe={recipe} />
              ))}
            </div>
            
            {nextPageUrl && (
              <div className="text-center mt-8">
                <Button 
                  onClick={() => searchRecipes('', true)} 
                  disabled={loading}
                  variant="ghost"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Load More Recipes
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Recipe Detail Modal */}
        {selectedRecipe && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <img
                  src={selectedRecipe.image}
                  alt={selectedRecipe.label}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <Button
                  variant="ghost"
                  onClick={() => setSelectedRecipe(null)}
                  className="absolute top-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">{selectedRecipe.label}</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <Clock className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                    <p className="text-sm text-gray-600">Cook Time</p>
                    <p className="font-semibold">{selectedRecipe.totalTime || 'Quick'} min</p>
                  </div>
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                    <p className="text-sm text-gray-600">Servings</p>
                    <p className="font-semibold">{selectedRecipe.yield}</p>
                  </div>
                  <div className="text-center">
                    <Heart className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                    <p className="text-sm text-gray-600">Calories</p>
                    <p className="font-semibold">{Math.round(selectedRecipe.calories)}</p>
                  </div>
                  <div className="text-center">
                    <Star className="h-6 w-6 mx-auto text-purple-600 mb-1" />
                    <p className="text-sm text-gray-600">Source</p>
                    <p className="font-semibold text-sm">{selectedRecipe.source}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {selectedRecipe.ingredientLines.map((ingredient, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span className="text-sm">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedRecipe.nutrients && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Nutrition (per serving)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Calories</p>
                        <p className="font-semibold">{Math.round(selectedRecipe.nutrients.ENERC_KCAL?.quantity / selectedRecipe.yield || 0)}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Protein</p>
                        <p className="font-semibold">{Math.round(selectedRecipe.nutrients.PROCNT?.quantity / selectedRecipe.yield || 0)}g</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Fat</p>
                        <p className="font-semibold">{Math.round(selectedRecipe.nutrients.FAT?.quantity / selectedRecipe.yield || 0)}g</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">Carbs</p>
                        <p className="font-semibold">{Math.round(selectedRecipe.nutrients.CHOCDF?.quantity / selectedRecipe.yield || 0)}g</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={() => addToMealPlan(selectedRecipe)}
                    className="flex-1"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Meal Plan
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={() => window.open(selectedRecipe.url, '_blank')}
                    className="flex-1"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    View Full Recipe
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Initial search prompt */}
        {recipes.length === 0 && !loading && (
          <Card className="text-center py-12">
            <ChefHat className="h-16 w-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">Ready to find healthy recipes?</h3>
            <p className="text-gray-600 mb-6">
              Search for recipes based on ingredients, cuisine, or dietary preferences
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-md mx-auto">
              <Button 
                variant="ghost" 
                onClick={() => { setSearchQuery('healthy breakfast'); searchRecipes('healthy breakfast'); }}
                className="text-sm"
              >
                Breakfast Ideas
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => { setSearchQuery('quick dinner'); searchRecipes('quick dinner'); }}
                className="text-sm"
              >
                Quick Dinners
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => { setSearchQuery('vegetarian'); searchRecipes('vegetarian'); }}
                className="text-sm"
              >
                Vegetarian
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => { setSearchQuery('low carb'); searchRecipes('low carb'); }}
                className="text-sm"
              >
                Low Carb
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}