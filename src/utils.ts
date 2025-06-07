import { LocalData, ApiData, ComparisonResult, UnderpricedResult, Settings, LocalItem } from './types';

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
          subCategory.forEach(item => addShopItem(item));        } else if (typeof subCategory === 'object' && subCategory !== null) {
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

  if (localData.Shop) {
    Object.keys(localData.Shop).forEach(categoryKey => {
      const categoryData = localData.Shop![categoryKey];
      processShopCategory(categoryData);
    });
  }

  return shopItemIds;
};

export const extractAllItems = (localData: LocalData): LocalItem[] => {
  const allItems: LocalItem[] = [];
  const addedIds = new Set<number>();
  const processItem = (item: any, category: string) => {
    if (item && typeof item === 'object' && item.id !== null && item.id !== undefined) {
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
      Object.keys(categoryData).forEach(subCatKey => {
        const subCategory = categoryData[subCatKey];
        if (Array.isArray(subCategory)) {
          subCategory.forEach(item => processItem(item, `${categoryName}_${subCatKey}`));
        } else if (typeof subCategory === 'object' && subCategory !== null) {
          Object.keys(subCategory).forEach(deepKey => {
            const deepCategory = subCategory[deepKey];
            if (Array.isArray(deepCategory)) {
              deepCategory.forEach(item => processItem(item, `${categoryName}_${subCatKey}_${deepKey}`));
            }
          });
        }      });
    }
  };

  if (localData.Items) {
    Object.keys(localData.Items).forEach(categoryKey => {
      const categoryData = localData.Items[categoryKey];
      processCategory(categoryData, categoryKey);
    });
  }

  return allItems;
};

export const calculateSellValue = (baseValue: number, settings: Settings): number => {
  let finalValue = baseValue;
  
  if (settings.gameSaleBonus) {
    finalValue *= 1.10;
  }
  
  if (settings.potionBonus) {
    finalValue *= 1.05;
  }
  
  return Math.floor(finalValue);
};

export const calculateNetProfit = (grossProfit: number, settings: Settings): number => {
  let netProfit = grossProfit;
  
  if (settings.potionBonus) {
    netProfit -= settings.potionCost;
  }
  
  return netProfit;
};

export const compareData = (localData: LocalData, apiData: ApiData, settings: Settings): ComparisonResult[] => {
  const localItems = extractAllItems(localData);
  const shopItemIds = extractShopItemIds(localData);
  const results: ComparisonResult[] = [];

  const apiItemMap = new Map();
  apiData.items.forEach(apiItem => {
    apiItemMap.set(apiItem.id, apiItem);
  });

  localItems.forEach(localItem => {
    const apiItem = apiItemMap.get(localItem.id);
    
    if (shopItemIds.has(localItem.id)) {
      return;
    }
    
    if (apiItem && apiItem.sellPrice > 0 && localItem.value > 0 && apiItem.sellVolume > 0) {
      const sellValue = calculateSellValue(localItem.value, settings);
      const profitPerItem = sellValue - apiItem.sellPrice;
      const totalProfit = calculateNetProfit(profitPerItem * apiItem.sellVolume, settings);
      const profitPercentage = ((sellValue - apiItem.sellPrice) / apiItem.sellPrice) * 100;

      if (settings.hideNonProfitable && totalProfit <= 0) {
        return;
      }
      
      if (settings.hideSubProfitable && totalProfit < settings.minProfit) {
        return;
      }      results.push({
        id: localItem.id,
        name: localItem.name,
        category: localItem.category || 'unknown',
        gameValue: sellValue,
        marketSellPrice: apiItem.sellPrice,
        profit: profitPerItem,
        profitPercentage: profitPercentage,
        itemQuantity: apiItem.sellVolume || 0,
        totalProfit: totalProfit
      });    }
  });

  return results.sort((a, b) => b.totalProfit - a.totalProfit);
};

export const findUnderpricedItems = (apiData: ApiData, localData: LocalData, settings: Settings): UnderpricedResult[] => {
  const localItems = extractAllItems(localData);
  const shopItemIds = extractShopItemIds(localData);  const results: UnderpricedResult[] = [];

  const localItemMap = new Map();
  localItems.forEach(localItem => {
    localItemMap.set(localItem.id, localItem);
  });
  
  apiData.items.forEach(apiItem => {
    const localItem = localItemMap.get(apiItem.id);
    
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
  return results.sort((a, b) => a.priceRatio - b.priceRatio);
};

export const getCategoryName = (categoryId: string, localData: LocalData): string => {
  if (localData.References?.categories?.[categoryId]) {
    return localData.References.categories[categoryId];
  }
  return categoryId;
};

export const formatNumber = (num: number, decimals: number = 0): string => {
  return num.toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
};

export const validateApiData = (data: any): boolean => {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && 
    typeof item.itemId === 'number'
  );
};

export const validateLocalData = (data: any): boolean => {
  return typeof data === 'object' && 
         data !== null && 
         typeof data.Items === 'object';
};
