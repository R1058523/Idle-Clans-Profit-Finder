// Quick test to verify shop item filtering logic
const fs = require('fs');

// Load the simplified game data
const gameData = JSON.parse(fs.readFileSync('./src/data/simplified_game_data.json', 'utf8'));

// Extract shop item IDs using similar logic to our utility function
const extractShopItemIds = (data) => {
  const shopItemIds = new Set();

  const addShopItem = (item) => {
    if (item && typeof item === 'object' && item.id !== null && item.id !== undefined) {
      shopItemIds.add(item.id);
    }
  };

  const processShopCategory = (categoryData) => {
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
  if (data.Shop) {
    Object.keys(data.Shop).forEach(categoryKey => {
      const categoryData = data.Shop[categoryKey];
      processShopCategory(categoryData);
    });
  }

  return shopItemIds;
};

// Test the function
const shopIds = extractShopItemIds(gameData);
console.log('Total shop items found:', shopIds.size);
console.log('Shop item IDs:', Array.from(shopIds).sort((a, b) => a - b));

// Check specific items we know should be filtered
const testItems = [
  { id: 51, name: 'bronze_helmet' },
  { id: 49, name: 'bronze_platebody' },
  { id: 260, name: 'bronze_arrow' },
  { id: 149, name: 'normal_longsword' },
  { id: 34, name: 'bronze_bar' }
];

console.log('\nTest items:');
testItems.forEach(item => {
  const isShopItem = shopIds.has(item.id);
  console.log(`${item.name} (ID: ${item.id}): ${isShopItem ? 'SHOP ITEM - FILTERED' : 'Non-shop item - INCLUDED'}`);
});
