import * as services from '../services/client/openFoodFactsServices';

describe('openFoodFactsServices', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('searchIngredients', () => {
    it('returns empty array when query is too short', async () => {
      const result = await services.searchIngredients('a');
      expect(result).toEqual([]);
    });

    it('transforms API results correctly', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [
            {
              code: '123',
              product_name: 'Tomato',
              product_name_fr: 'Tomate',
              nutriments: {
                'energy-kcal_100g': 18,
                'proteins_100g': 0.9,
                'carbohydrates_100g': 3.9,
                'fat_100g': 0.2,
                'fiber_100g': 1.2,
                'sugars_100g': 2.6,
                'salt_100g': 0.01
              },
              categories: 'Légume',
              brands: 'BrandA',
              image_url: 'img'
            }
          ]
        })
      }) as any;

      const result = await services.searchIngredients('tom');
      expect(global.fetch).toHaveBeenCalled();
      expect(result).toEqual([
        {
          id: 'off-123',
          name: 'tomate',
          calories: 18,
          proteins: 0.9,
          carbs: 3.9,
          fat: 0.2,
          fiber: 1.2,
          sugars: 2.6,
          salt: 0.01,
          commonUnits: ['g', 'kg', 'pièce', 'tranche'],
          category: 'Légume',
          brand: 'BrandA',
          imageUrl: 'img',
          source: 'openfoodfacts'
        }
      ]);
    });

    it('returns empty array on fetch error', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('fail')) as any;
      const result = await services.searchIngredients('tom');
      expect(result).toEqual([]);
    });
  });

  describe('createManualIngredient', () => {
    it('creates a basic ingredient', () => {
      const ing = services.createManualIngredient('Sucre');
      expect(ing.name).toBe('sucre');
      expect(ing.source).toBe('manual');
      expect(ing.commonUnits).toContain('g');
    });
  });

  describe('searchIngredientsHybrid', () => {
    it('combines local and OFF results', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          products: [
            {
              code: '234',
              product_name: 'Apple',
              product_name_fr: 'Pomme',
              nutriments: {
                'energy-kcal_100g': 52
              },
              categories: 'Fruit',
              brands: 'BrandB',
              image_url: 'img2'
            }
          ]
        })
      }) as any;

      const result = await services.searchIngredientsHybrid('pomme');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('pomme');
      expect(result[0].source).toBe('openfoodfacts');
    });
  });
});
