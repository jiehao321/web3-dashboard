/**
 * Web3 Dashboard - Real-time Data Fetch
 * 
 * Fetches latest data from GitHub Pages JSON files
 * Auto-refreshes every 30 seconds
 */

// Configuration
const CONFIG = {
  repoOwner: 'jiehao321',
  repoName: 'web3-dashboard',
  refreshInterval: 30000, // 30 seconds
  baseUrl: 'https://jiehao321.github.io/web3-dashboard/'
};

// Data URLs
const DATA_URLS = {
  portfolio: 'public/portfolio.json',
  hotTokens: 'public/hot-tokens.json',
  priceAlerts: 'public/price-alerts.json',
  autoTrades: 'public/auto-trades.json'
};

// Cache for data
let dataCache = {
  portfolio: null,
  hotTokens: null,
  priceAlerts: null,
  autoTrades: null
};

// Fetch data from GitHub Pages
async function fetchData(url) {
  try {
    const response = await fetch(url + '?t=' + Date.now());
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

// Fetch all data
async function fetchAllData() {
  console.log('🔄 Fetching latest data...');
  
  const results = await Promise.all([
    fetchData(DATA_URLS.portfolio),
    fetchData(DATA_URLS.hotTokens),
    fetchData(DATA_URLS.priceAlerts),
    fetchData(DATA_URLS.autoTrades)
  ]);
  
  dataCache = {
    portfolio: results[0],
    hotTokens: results[1],
    priceAlerts: results[2],
    autoTrades: results[3]
  };
  
  console.log('✅ Data updated:', new Date().toLocaleString());
  
  // Trigger UI update if callback exists
  if (typeof onDataUpdate === 'function') {
    onDataUpdate(dataCache);
  }
  
  return dataCache;
}

// Get data by key
function getData(key) {
  return dataCache[key];
}

// Initialize auto-refresh
function initAutoRefresh() {
  // Fetch immediately
  fetchAllData();
  
  // Set interval
  setInterval(fetchAllData, CONFIG.refreshInterval);
  
  console.log(`🔄 Auto-refresh enabled: every ${CONFIG.refreshInterval/1000} seconds`);
}

// Export functions
window.Web3Dashboard = {
  fetchAllData,
  getData,
  initAutoRefresh,
  config: CONFIG
};

console.log('📊 Web3 Dashboard Data Module loaded');
