import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchFilters as SearchFiltersType } from '../types/recipe';
import { Recipe } from '../types/recipe';
import { recipeAPI } from '../services/api';
import RecipeCard from '../components/RecipeCard';
import SearchFilters from '../components/SearchFilters';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { debounce } from '../utils/helpers';

const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFiltersType>({
    query: searchParams.get('search') || '',
    diet: '',
    cuisine: '',
    sort: 'popularity',
  });

  const fetchRecipes = debounce(async (currentFilters: SearchFiltersType) => {
    try {
      setLoading(true);
      setError(null);
      
      let fetchedRecipes: Recipe[];
      
      if (currentFilters.query || currentFilters.diet || currentFilters.cuisine) {
        fetchedRecipes = await recipeAPI.searchRecipes(currentFilters);
      } else {
        fetchedRecipes = await recipeAPI.getRandomRecipes(12);
      }
      
      setRecipes(fetchedRecipes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recipes';
      setError(errorMessage);
      console.error('Error fetching recipes:', err);
    } finally {
      setLoading(false);
    }
  }, 500);

  useEffect(() => {
    fetchRecipes(filters);
  }, [filters]);

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  const handleRetry = () => {
    fetchRecipes(filters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Discover Amazing Recipes
          </h1>
          <p className="text-xl md:text-2xl opacity-90">
            Explore thousands of delicious recipes from around the world
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <SearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          className="mb-8"
        />

        {/* Content */}
        {loading ? (
          <LoadingSpinner text="Fetching delicious recipes..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={handleRetry} />
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl mb-4">No recipes found</div>
            <p className="text-gray-400">
              Try adjusting your search criteria or filters
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {filters.query ? `Results for "${filters.query}"` : 'Featured Recipes'}
              </h2>
              <span className="text-gray-600">
                {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;