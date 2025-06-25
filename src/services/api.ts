import axios from 'axios';
import { Recipe, SearchFilters } from '../types/recipe';

const API_KEY = import.meta.env.VITE_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes';

if (!API_KEY) {
  throw new Error('Spoonacular API key is required. Please check your .env file.');
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  config.params = {
    ...config.params,
    apiKey: API_KEY,
  };
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    if (error.response?.status === 401) {
      throw new Error('Invalid API key. Please check your Spoonacular API key.');
    }
    if (error.response?.status === 402) {
      throw new Error('API quota exceeded. Please upgrade your Spoonacular plan.');
    }
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    throw new Error('Failed to fetch data. Please try again.');
  }
);

export const recipeAPI = {
  searchRecipes: async (filters: SearchFilters, limit = 12): Promise<Recipe[]> => {
    try {
      const params: any = {
        addRecipeInformation: true,
        number: limit,
        sort: filters.sort || 'popularity',
        sortDirection: 'desc',
      };

      if (filters.query) params.query = filters.query;
      if (filters.diet) params.diet = filters.diet;
      if (filters.cuisine) params.cuisine = filters.cuisine;

      const response = await api.get('/complexSearch', { params });
      return response.data.results || [];
    } catch (error) {
      console.error('Error searching recipes:', error);
      throw error;
    }
  },

  getRecipeById: async (id: number): Promise<Recipe> => {
    try {
      const response = await api.get(`/${id}/information`, {
        params: {
          includeNutrition: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recipe details:', error);
      throw error;
    }
  },

  getSimilarRecipes: async (id: number): Promise<Recipe[]> => {
    try {
      const response = await api.get(`/${id}/similar`, {
        params: {
          number: 4,
        },
      });
      return response.data || [];
    } catch (error) {
      console.error('Error fetching similar recipes:', error);
      return [];
    }
  },

  getRandomRecipes: async (limit = 12): Promise<Recipe[]> => {
    try {
      const response = await api.get('/random', {
        params: {
          number: limit,
        },
      });
      return response.data.recipes || [];
    } catch (error) {
      console.error('Error fetching random recipes:', error);
      throw error;
    }
  },
};