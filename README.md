# Idle Clans Profit Finder

A powerful React + Ant Design web application for finding profitable trading opportunities in Idle Clans. Maximize your gold earnings with real-time market analysis and intuitive profit calculations.

🌐 **Live App**: [Visit the app here](https://idle-clans-profit-finder.vercel.app/)

## ✨ Features

### 📈 Profitable Items Analysis
- **Buy Low, Sell High**: Find items where you can buy from players and sell directly to the game for instant profit
- **Clan Bonuses**: Toggle +10% clan upgrade bonus for accurate profit calculations
- **Potion Integration**: Factor in Potion of Negotiation (+5% bonus) with automatic cost deduction
- **Smart Override**: Manual potion cost override when you want to set your own price

### 💰 Underpriced Items Detection  
- **Market Opportunities**: Discover items being sold below their historical average price
- **Extended Analytics**: Fetch detailed 1d, 7d, and 30d price averages for better context
- **Volume Insights**: See trading volumes to gauge market activity
- **Price Ratio Analysis**: Color-coded indicators for excellent, good, and fair deals

### 🎛️ Advanced Interface
- **Collapsible Tables**: Clean up your workspace by collapsing tables with one click
- **Drag-to-Resize**: Intuitive table height adjustment by dragging the bottom edge
- **Real-time Search**: Instant filtering across all item properties
- **Smart Sorting**: Multi-column sorting with visual profit indicators
- **Responsive Design**: Seamless experience on desktop, tablet, and mobile

### 🎨 OLED-Optimized Design
- **True Black Theme**: Battery-saving pure black background for OLED displays
- **High Contrast**: Excellent readability with carefully chosen color schemes
- **Profit Color Coding**: Green/orange/red visual indicators for profit levels
- **Smooth Animations**: Polished interactions and transitions

## 🚀 How to Use

1. **Get Started**: Visit the live application or run it locally
2. **Fetch Data**: Click "Fetch Data" to get the latest market prices from the Idle Clans API
3. **Find Profits**: Browse the **Profitable Items** table for buy-from-players, sell-to-game opportunities
4. **Discover Deals**: Check **Underpriced Items** for items selling below market value
5. **Customize Settings**: 
   - Toggle clan bonuses and potion effects
   - Set your Potion of Negotiation cost
   - Choose between stacked or side-by-side layout
6. **Optimize View**: 
   - Collapse tables you're not using
   - Drag table edges to resize for better viewing
   - Search and sort to find exactly what you need

## ⚙️ Settings & Configuration

### Bonus Toggles
- **Clan +10%**: Enable if you have the clan upgrade for +10% gold from game sales
- **Potion +5%**: Enable when using Potion of Negotiation for +5% gold bonus

### Potion Cost Management
- **Auto-Update**: Automatically fetches current market price for Potion of Negotiation
- **Manual Override**: Lock the cost to your preferred price
- **Smart Calculation**: Potion cost is automatically deducted from profits when enabled

### Layout Options
- **Side-by-Side**: View both tables simultaneously (desktop)
- **Stacked**: Stack tables vertically for easier mobile viewing

## 🛠️ For Developers

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Local Development
```bash
git clone https://github.com/yourusername/idle-clans-profit-finder.git
cd idle-clans-profit-finder
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production
```bash
npm run build
npm run preview  # Preview the production build locally
```

### Project Structure
```
src/
├── components/          # React components
│   ├── DataFetcher.tsx     # Main data fetching logic
│   ├── ProfitableItemsTable.tsx
│   ├── UnderpricedItemsTable.tsx
│   └── SettingsDrawer.tsx
├── data/               # Static game data
├── types.ts           # TypeScript interfaces
├── utils.ts           # Utility functions
└── App.tsx           # Main application component
```

## 🌐 API Integration

This app integrates with the official Idle Clans API:
- **Base URL**: `https://query.idleclans.com/api`
- **Endpoints Used**:
  - `/PlayerMarket/items/prices/latest/all` - Current market prices
  - `/PlayerMarket/items/prices/latest/comprehensive/{id}` - Detailed price history
- **No Authentication Required**: Public API access

## 📱 Technologies Used

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Ant Design 5.x
- **Build Tool**: Vite
- **Styling**: CSS with OLED-optimized dark theme
- **API**: Native fetch with error handling
- **State Management**: React hooks (useState)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎮 About Idle Clans

Idle Clans is an incremental/idle game where players can trade items on a player-driven market. This tool helps optimize your trading strategies by analyzing real market data.

**Disclaimer**: This is an unofficial tool created by the community. It is not affiliated with or endorsed by the creators of Idle Clans.
