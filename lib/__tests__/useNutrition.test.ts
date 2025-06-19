import { suggestionToIngredientData } from '../hooks/useNutrition';

describe('useNutrition utilities', () => {
  const suggestion = {
    id: '1',
    name: 'tomate',
    calories: 20,
    proteins: 1,
    carbs: 4,
    fat: 0,
    fiber: 1,
    commonUnits: [],
    source: 'openfoodfacts' as const
  };

  it('converts suggestion with default quantity', () => {
    const data = suggestionToIngredientData(suggestion);
    expect(data).toEqual({
      name: 'tomate',
      quantityPerServing: 100,
      unit: 'g',
      calories: 20,
      proteins: 1,
      carbs: 4,
      fat: 0,
      fiber: 1
    });
  });

  it('uses provided quantity and unit', () => {
    const data = suggestionToIngredientData(suggestion, 50, 'ml');
    expect(data.quantityPerServing).toBe(50);
    expect(data.unit).toBe('ml');
  });
});
