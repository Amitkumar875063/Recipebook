import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Heart } from 'lucide-react';
import { Recipe } from '../types/recipe';
import { useAuth } from '../contexts/AuthContext';
import { stripHtml, truncateText, formatTime, getPlaceholderImage } from '../utils/helpers';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const { currentUser, toggleFavorite } = useAuth();
  const isFavorite = currentUser?.favorites.includes(recipe.id) || false;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(recipe.id);
  };

  const cleanSummary = recipe.summary ? stripHtml(recipe.summary) : '';
  const shortSummary = truncateText(cleanSummary, 120);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <Link to={`/recipe/${recipe.id}`} className="block">
        <div className="relative">
          <img
            src={recipe.image || getPlaceholderImage()}
            alt={recipe.title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getPlaceholderImage();
            }}
          />
          {currentUser && (
            <button
              onClick={handleFavoriteClick}
              className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
                isFavorite
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
            {recipe.title}
          </h3>
          
          {shortSummary && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-3">
              {shortSummary}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(recipe.readyInMinutes)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{recipe.servings} servings</span>
            </div>
          </div>
          
          {recipe.diets && recipe.diets.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {recipe.diets.slice(0, 3).map((diet, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                >
                  {diet}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default RecipeCard;