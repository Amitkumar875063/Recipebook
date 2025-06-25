import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Clock, Users, ArrowLeft, Heart, Share2, ChefHat } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { recipeAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import RatingSystem from '../components/RatingSystem';
import TranslatedText from '../components/TranslatedText';
import { formatTime, getPlaceholderImage } from '../utils/helpers';

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, toggleFavorite } = useAuth();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [similarRecipes, setSimilarRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'instructions' | 'ingredients' | 'nutrition'>('instructions');
  const [userRating, setUserRating] = useState(0);

  useEffect(() => {
    const fetchRecipeData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const recipeId = parseInt(id);
        const [recipeData, similarData] = await Promise.all([
          recipeAPI.getRecipeById(recipeId),
          recipeAPI.getSimilarRecipes(recipeId),
        ]);
        
        setRecipe(recipeData);
        setSimilarRecipes(similarData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recipe details';
        setError(errorMessage);
        console.error('Error fetching recipe:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeData();
  }, [id]);

  const handleFavoriteClick = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (recipe) {
      toggleFavorite(recipe.id);
    }
  };

  const handleRating = (rating: number) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUserRating(rating);
  };

  const handleShare = async () => {
    if (navigator.share && recipe) {
      try {
        await navigator.share({
          title: recipe.title,
          text: `Check out this amazing recipe: ${recipe.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Recipe link copied to clipboard!');
    }
  };

  if (loading) return <LoadingSpinner text="Loading recipe details..." />;
  if (error) return <ErrorMessage message={error} onRetry={() => window.location.reload()} />;
  if (!recipe) return <ErrorMessage message="Recipe not found" />;

  const isFavorite = currentUser?.favorites.includes(recipe.id) || false;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to recipes</span>
        </Link>

        {/* Main Recipe Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="relative">
            <img
              src={recipe.image || getPlaceholderImage(800, 400)}
              alt={recipe.title}
              className="w-full h-64 md:h-96 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getPlaceholderImage(800, 400);
              }}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
              <div className="p-6 text-white w-full">
                <TranslatedText 
                  text={recipe.title} 
                  as="h1" 
                  className="text-3xl md:text-5xl font-bold mb-4"
                />
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(recipe.readyInMinutes)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ChefHat className="h-4 w-4" />
                    <span>Difficulty: Medium</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleFavoriteClick}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isFavorite
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                  <span>{isFavorite ? 'Saved' : 'Save'}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Rate this recipe:</span>
                <RatingSystem currentRating={userRating} onRate={handleRating} />
              </div>
            </div>
          </div>

          {/* Summary */}
          {recipe.summary && (
            <div className="p-6 border-b border-gray-200">
              <TranslatedText
                text={recipe.summary}
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={true}
              />
            </div>
          )}

          {/* Diet Tags */}
          {recipe.diets && recipe.diets.length > 0 && (
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-2">
                {recipe.diets.map((diet, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    <TranslatedText text={diet} />
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'instructions', label: 'Instructions' },
                { id: 'ingredients', label: 'Ingredients' },
                { id: 'nutrition', label: 'Nutrition' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <TranslatedText text={tab.label} />
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'instructions' && (
              <div>
                <TranslatedText 
                  text="Cooking Instructions" 
                  as="h3" 
                  className="text-xl font-semibold mb-4"
                />
                {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 ? (
                  <ol className="space-y-4">
                    {recipe.analyzedInstructions[0].steps.map((step) => (
                      <li key={step.number} className="flex">
                        <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                          {step.number}
                        </span>
                        <TranslatedText 
                          text={step.step} 
                          as="p" 
                          className="text-gray-700 leading-relaxed"
                        />
                      </li>
                    ))}
                  </ol>
                ) : (
                  <TranslatedText 
                    text="No detailed instructions available for this recipe." 
                    as="p" 
                    className="text-gray-500"
                  />
                )}
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div>
                <TranslatedText 
                  text="Ingredients" 
                  as="h3" 
                  className="text-xl font-semibold mb-4"
                />
                <ul className="space-y-2">
                  {recipe.extendedIngredients.map((ingredient) => (
                    <li key={ingredient.id} className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <TranslatedText 
                        text={ingredient.original} 
                        as="span" 
                        className="text-gray-700"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div>
                <TranslatedText 
                  text="Nutrition Information" 
                  as="h3" 
                  className="text-xl font-semibold mb-4"
                />
                {recipe.nutrition && recipe.nutrition.nutrients.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {recipe.nutrition.nutrients.slice(0, 8).map((nutrient, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {Math.round(nutrient.amount)}
                        </p>
                        <p className="text-sm text-gray-600">{nutrient.unit}</p>
                        <TranslatedText 
                          text={nutrient.name} 
                          as="p" 
                          className="text-sm font-medium text-gray-800"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <TranslatedText 
                    text="Nutrition information not available for this recipe." 
                    as="p" 
                    className="text-gray-500"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Similar Recipes */}
        {similarRecipes.length > 0 && (
          <div className="mt-12">
            <TranslatedText 
              text="You might also like" 
              as="h2" 
              className="text-2xl font-bold text-gray-800 mb-6"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {similarRecipes.map((similarRecipe) => (
                <Link
                  key={similarRecipe.id}
                  to={`/recipe/${similarRecipe.id}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <img
                    src={`https://spoonacular.com/recipeImages/${similarRecipe.id}-312x231.jpg`}
                    alt={similarRecipe.title}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = getPlaceholderImage(312, 231);
                    }}
                  />
                  <div className="p-3">
                    <TranslatedText 
                      text={similarRecipe.title} 
                      as="h4" 
                      className="font-medium text-gray-800 text-sm line-clamp-2"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeDetail;