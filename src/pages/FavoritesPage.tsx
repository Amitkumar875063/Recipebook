import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { recipeAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const FavoritesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavoriteRecipes = async () => {
      if (!currentUser || currentUser.favorites.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const recipePromises = currentUser.favorites.map(id => 
          recipeAPI.getRecipeById(id)
        );
        
        const recipes = await Promise.all(recipePromises);
        setFavoriteRecipes(recipes);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch favorite recipes';
        setError(errorMessage);
        console.error('Error fetching favorites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteRecipes();
  }, [currentUser]);

  if (loading) {
    return <LoadingSpinner text="Loading your favorite recipes..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to recipes</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-800">Your Favorite Recipes</h1>
          </div>
          
          {currentUser && (
            <p className="text-gray-600 mt-2">
              Welcome back, {currentUser.name}! Here are your saved recipes.
            </p>
          )}
        </div>

        {/* Content */}
        {favoriteRecipes.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No favorite recipes yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start exploring recipes and save your favorites to see them here!
            </p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <span>Discover Recipes</span>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                {favoriteRecipes.length} recipe{favoriteRecipes.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;