// Data processing utilities for the Idle Clans Profit Finder
import { LocalData, ApiData, ComparisonResult, UnderpricedResult, Settings, LocalItem } from './types';

// Extract all item IDs that appear in the Shop section
export const extractShopItemIds = (localData: LocalData): Set<number> => {
  const shopItemIds = new Set<number>();

  const addShopItem = (item: any) => {
    if (item && typeof item === 'object' && item.id !== null && item.id !== undefined) {
      shopItemIds.add(item.id);
    }
  };

  const processShopCategory = (categoryData: any) => {
    if (Array.isArray(categoryData)) {
      categoryData.forEach(item => addShopItem(item));
    } else if (typeof categoryData === 'object' && categoryData !== null) {
      Object.keys(categoryData).forEach(subKey => {
        const subCategory = categoryData[subKey];
        if (Array.isArray(subCategory)) {
          subCategory.forEach(item => addShopItem(item));
        } else if (typeof subCategory === 'object' && subCategory !== null) {
          Object.keys(subCategory).forEach(deepKey => {
            const deepCategory = subCategory[deepKey];
            if (Array.isArray(deepCategory)) {
              deepCategory.forEach(item => addShopItem(item));
            }
          });
        }
      });
    }
  };
  // Process all categories in the Shop object
  if (localData.Shop) {
    Object.keys(localData.Shop).forEach(categoryKey => {
      const categoryData = localData.Shop![categoryKey];
      processShopCategory(categoryData);
    });
  }

  return shopItemIds;
};

// Extract all items from the complex nested structure of the local JSON data
export const extractAllItems = (localData: LocalData): LocalItem[] => {
  const allItems: LocalItem[] = [];
  const addedIds = new Set<number>();

  const processItem = (item: any, category: string) => {
    if (item && typeof item === 'object' && item.id !== null && item.id !== undefined) {
      // Avoid duplicates
      if (!addedIds.has(item.id)) {
        addedIds.add(item.id);
        allItems.push({
          id: item.id,
          name: item.name || `item_${item.id}`,
          value: item.value || 0,
          skill: item.skill,
          slot: item.slot,
          category: category,
          skillBoost: item.skillBoost
        });
      }
    }
  };

  const processCategory = (categoryData: any, categoryName: string) => {
    if (Array.isArray(categoryData)) {
      categoryData.forEach(item => processItem(item, categoryName));
    } else if (typeof categoryData === 'object' && categoryData !== null) {
      // Handle nested categories (like weapons, armor, etc.)
      Object.keys(categoryData).forEach(subCatKey => {
        const subCategory = categoryData[subCatKey];
        if (Array.isArray(subCategory)) {
          subCategory.forEach(item => processItem(item, `${categoryName}_${subCatKey}`));
        } else if (typeof subCategory === 'object' && subCategory !== null) {
          // Handle deeper nesting (like melee.longswords, etc.)
          Object.keys(subCategory).forEach(deepKey => {
            const deepCategory = subCategory[deepKey];
            if (Array.isArray(deepCategory)) {
              deepCategory.forEach(item => processItem(item, `${categoryName}_${subCatKey}_${deepKey}`));
            }
          });
        }
      });
    }
  };

  // Process all top-level categories in the Items object
  if (localData.Items) {
    Object.keys(localData.Items).forEach(categoryKey => {
      const categoryData = localData.Items[categoryKey];
      processCategory(categoryData, categoryKey);
    });
  }

  return allItems;
};

// Calculate the final sell value with bonuses
export const calculateSellValue = (baseValue: number, settings: Settings): number => {
  let finalValue = baseValue;
  
  // Apply game sale bonus (+10%)
  if (settings.gameSaleBonus) {
    finalValue *= 1.10;
  }
  
  // Apply negotiation potion bonus (+5%)
  if (settings.potionBonus) {
    finalValue *= 1.05;
  }
  
  return Math.floor(finalValue);
};

// Calculate profit including potion cost
export const calculateNetProfit = (grossProfit: number, settings: Settings): number => {
  let netProfit = grossProfit;
  
  // Subtract potion cost if potion bonus is enabled
  if (settings.potionBonus) {
    netProfit -= settings.potionCost;
  }
  
  return netProfit;
};

// Compare local and API data to find profitable items
export const compareData = (localData: LocalData, apiData: ApiData, settings: Settings): ComparisonResult[] => {
  const localItems = extractAllItems(localData);
  const shopItemIds = extractShopItemIds(localData);
  const results: ComparisonResult[] = [];

  // Create a map of API items by ID for faster lookup
  const apiItemMap = new Map();
  apiData.items.forEach(apiItem => {
    apiItemMap.set(apiItem.id, apiItem);
  });

  localItems.forEach(localItem => {
    const apiItem = apiItemMap.get(localItem.id);
    
    // Skip items that exist in the shop
    if (shopItemIds.has(localItem.id)) {
      return;
    }
    
    // Use apiItem.sellPrice (lowest market offer) and apiItem.sellVolume
    if (apiItem && apiItem.sellPrice > 0 && localItem.value > 0 && apiItem.sellVolume > 0) {
      const sellValue = calculateSellValue(localItem.value, settings);
      const profitPerItem = sellValue - apiItem.sellPrice;
      // Use sellVolume for total profit calculation
      const totalProfit = calculateNetProfit(profitPerItem * apiItem.sellVolume, settings);
      const profitPercentage = ((sellValue - apiItem.sellPrice) / apiItem.sellPrice) * 100;

      // Apply filters
      if (settings.hideNonProfitable && totalProfit <= 0) {
        return;
      }
      
      if (settings.hideSubProfitable && totalProfit < settings.minProfit) {
        return;
      }

      results.push({
        id: localItem.id,
        name: localItem.name,
        category: localItem.category || 'unknown',
        gameValue: sellValue,
        marketSellPrice: apiItem.sellPrice, // Changed from marketBuyPrice
        profit: profitPerItem,
        profitPercentage: profitPercentage,
        itemQuantity: apiItem.sellVolume || 0, // Changed from buyVolume
        totalProfit: totalProfit
      });
    }
  });

  // Sort by total profit descending
  return results.sort((a, b) => b.totalProfit - a.totalProfit);
};

// Find underpriced items based on the threshold
export const findUnderpricedItems = (apiData: ApiData, localData: LocalData, settings: Settings): UnderpricedResult[] => {
  const localItems = extractAllItems(localData);
  const shopItemIds = extractShopItemIds(localData);
  const results: UnderpricedResult[] = [];

  // Create a map of local items by ID for faster lookup
  const localItemMap = new Map();
  localItems.forEach(localItem => {
    localItemMap.set(localItem.id, localItem);
  });
  
  apiData.items.forEach(apiItem => {
    const localItem = localItemMap.get(apiItem.id);
    
    // Skip items that exist in the shop
    if (shopItemIds.has(apiItem.id)) {
      return;
    }
    
    if (localItem && apiItem.dailyAveragePrice > 0 && apiItem.sellPrice > 0) {
      const priceRatio = (apiItem.sellPrice / apiItem.dailyAveragePrice) * 100;
      
      // Only include items that are below the underpriced threshold
      if (priceRatio < settings.underpricedThreshold) {
        const priceDifference = apiItem.dailyAveragePrice - apiItem.sellPrice;
        
        results.push({
          id: apiItem.id,
          name: localItem.name || `item_${apiItem.id}`,
          category: localItem.category || 'unknown',
          dailyAveragePrice: apiItem.dailyAveragePrice,
          marketBuyPrice: apiItem.sellPrice,
          priceRatio: priceRatio,
          priceDifference: priceDifference,
          sellVolume: apiItem.sellVolume || 0
        });
      }
    }
  });

  // Sort by price ratio ascending (most underpriced first)
  return results.sort((a, b) => a.priceRatio - b.priceRatio);
};

// Get category name from category ID if available in references
export const getCategoryName = (categoryId: string, localData: LocalData): string => {
  if (localData.References?.categories?.[categoryId]) {
    return localData.References.categories[categoryId];
  }
  return categoryId;
};

// Format numbers for display
export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
};

// Validate API data structure
export const validateApiData = (data: any): boolean => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && 
    typeof item.itemId === 'number'
  );
};

// Validate local data structure
export const validateLocalData = (data: any): boolean => {
  return typeof data === 'object' && 
         data !== null && 
         typeof data.Items === 'object';
};
