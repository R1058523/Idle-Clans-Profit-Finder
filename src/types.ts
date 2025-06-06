// Types for the Idle Clans Profit Finder application

export interface ApiItem {
  id: number;
  name: string;
  marketValue: number;
  buyPrice: number;
  sellPrice: number;
  sellVolume: number;
  buyVolume: number;
  dailyAveragePrice: number;
}

export interface ApiData {
  items: ApiItem[];
  timestamp?: string;
}

export interface LocalItem {
  id: number;
  name: string;
  value: number;
  skill?: number;
  slot?: number;
  category?: string;
  skillBoost?: {
    skill: number;
    percentage: number;
  };
}

export interface LocalData {
  Items: {
    [category: string]: LocalItem[] | any;
  };
  Shop?: {
    [category: string]: any;
  };
  References?: {
    categories: {
      [id: string]: string;
    };
  };
}

export interface ComparisonResult {
  id: number;
  name: string;
  category: string;
  gameValue: number;
  marketSellPrice: number; // Changed from marketBuyPrice
  profit: number;
  profitPercentage: number;
  itemQuantity: number;
  totalProfit: number;
}

export interface UnderpricedResult {
  id: number;
  name: string;
  category: string;
  dailyAveragePrice: number;
  marketBuyPrice: number;
  priceRatio: number;
  priceDifference: number;
  sellVolume: number;
  comprehensiveData?: {
    averagePrice1Day?: number;
    averagePrice7Days?: number;
    averagePrice30Days?: number;
    tradeVolume1Day?: number;
    tradeVolume7Days?: number;
    tradeVolume30Days?: number;
  };
}

export interface Settings {
  gameSaleBonus: boolean;
  potionBonus: boolean;
  potionCost: number;
  overridePotionCost: boolean;
  minProfit: number;
  hideNonProfitable: boolean;
  hideSubProfitable: boolean;
  underpricedThreshold: number;
}
