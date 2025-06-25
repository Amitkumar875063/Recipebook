export interface Recipe {
  id: number;
  title: string;
  image: string;
  summary: string;
  readyInMinutes: number;
  servings: number;
  dishTypes: string[];
  diets: string[];
  extendedIngredients: Ingredient[];
  analyzedInstructions: InstructionSet[];
  nutrition?: Nutrition;
}

export interface Ingredient {
  id: number;
  name: string;
  original: string;
  measures: {
    metric: {
      amount: number;
      unitShort: string;
    };
  };
}

export interface InstructionSet {
  name: string;
  steps: Step[];
}

export interface Step {
  number: number;
  step: string;
}

export interface Nutrition {
  nutrients: Nutrient[];
}

export interface Nutrient {
  name: string;
  amount: number;
  unit: string;
}

export interface SearchFilters {
  query: string;
  diet: string;
  cuisine: string;
  sort: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  favorites: number[];
}