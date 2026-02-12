/**
 * Real-Time Wallet Data Fetcher
 * 
 * Fetches live data from Base blockchain and displays on dashboard
 * Auto-refreshes every 30 seconds
 */

// Configuration
const CONFIG = {
  baseUrl: 'https://jiehao321.github.io/web3-dashboard/',
  refreshInterval: 30000, // 30 seconds
  walletAddress: '0x7854C27577d6d6A1b487db32e0e10E87E9f52183'
};

// Data cache
let walletData = null;
let lastFetch = null;

// Fetch wallet data from JSON file
async function fetchWalletData() {
  try {
    const response = await fetch(
      CONFIG.baseUrl + 'wallet-data.json?t=' + Date.now()
    );
    
    if (response.ok) {
      walletData = await response.json();
      lastFetch = new Date();
      console.log('✅ Wallet data updated:', lastFetch.toLocaleString());
      return walletData;
    }
    return null;
  } catch (error) {
    console.error('❌ Error fetching wallet data:', error.message);
    return null;
  }
}

// Format address for display
function formatAddress(address) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

// Format balance
function formatBalance(balance, decimals = 4) {
  if (!balance) return '--';
  const num = parseFloat(balance);
  if (num === 0) return '0';
  if (num < 0.0001) return num.toExponential(2);
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// Update wallet info section
function updateWalletInfo(data) {
  const walletInfo = document.getElementById('wallet-info');
  if (!walletInfo) return;
  
  walletInfo.innerHTML = `
    <div class="wallet-header">
      <div class="wallet-icon">👛</div>
      <div class="wallet-details">
        <div class="wallet-label">Wallet</div>
        <div class="wallet-address">
          <a href="https://basescan.org/address/${CONFIG.walletAddress}" target="_blank">
            ${formatAddress(CONFIG.walletAddress)}
          </a>
        </div>
      </div>
    </div>
    <div class="wallet-balance">
      <div class="balance-eth">${formatBalance(data.ethBalance?.balance)} ETH</div>
      <div class="balance-usd">~ $${(parseFloat(data.ethBalance?.balance || 0) * 3200).toLocaleString()}</div>
    </div>
    <div class="wallet-meta">
      <span>📡 ${data.network}</span>
      <span>🕐 Updated: ${new Date(data.timestamp).toLocaleTimeString()}</span>
    </div>
  `;
}

// Update tokens list
function updateTokensList(data) {
  const tokensList = document.getElementById('tokens-list');
  if (!tokensList) return;
  
  let html = '';
  
  // ETH
  if (data.ethBalance) {
    html += `
      <div class="token-item">
        <div class="token-icon eth">Ξ</div>
        <div class="token-info">
          <div class="token-name">Ethereum</div>
          <div class="token-address">${formatAddress(data.ethBalance.balanceWei)}</div>
        </div>
        <div class="token-balance">${formatBalance(data.ethBalance.balance)} ETH</div>
      </div>
    `;
  }
  
  // ERC-20 Tokens
  data.tokens.forEach(token => {
    html += `
      <div class="token-item">
        <div class="token-icon">${token.symbol[0]}</div>
        <div class="token-info">
          <div class="token-name">${token.name}</div>
          <div class="token-address">${formatAddress(token.address)}</div>
        </div>
        <div class="token-balance">${formatBalance(token.balance)} ${token.symbol}</div>
      </div>
    `;
  });
  
  // MBC-20 Inscriptions
  data.mbc20.forEach(token => {
    html += `
      <div class="token-item mbc20">
        <div class="token-icon inscription">🔷</div>
        <div class="token-info">
          <div class="token-name">${token.symbol} (MBC-20)</div>
          <div class="token-type">Base Inscription</div>
        </div>
        <div class="token-balance">${token.balance}</div>
      </div>
    `;
  });
  
  tokensList.innerHTML = html;
}

// Update recent transactions
function updateTransactions(data) {
  const txList = document.getElementById('transactions-list');
  if (!txList) return;
  
  if (!data.transactions || data.transactions.length === 0) {
    txList.innerHTML = '<div class="no-data">No recent transactions</div>';
    return;
  }
  
  let html = '';
  
  data.transactions.slice(0, 5).forEach(tx => {
    const isIncoming = tx.to.toLowerCase() === CONFIG.walletAddress.toLowerCase();
    html += `
      <div class="transaction-item ${isIncoming ? 'incoming' : 'outgoing'}">
        <div class="tx-icon">${isIncoming ? '⬇️' : '⬆️'}</div>
        <div class="tx-info">
          <div class="tx-hash">
            <a href="https://basescan.org/tx/${tx.hash}" target="_blank">
              ${tx.hash.slice(0, 10)}...
            </a>
          </div>
          <div class="tx-time">${new Date(tx.timestamp).toLocaleString()}</div>
        </div>
        <div class="tx-value ${isIncoming ? 'positive' : 'negative'}">
          ${isIncoming ? '+' : '-'}${parseFloat(tx.value).toFixed(4)} ETH
        </div>
      </div>
    `;
  });
  
  txList.innerHTML = html;
}

// Update dashboard
function updateDashboard() {
  if (!walletData) return;
  
  updateWalletInfo(walletData);
  updateTokensList(walletData);
  updateTransactions(walletData);
}

// Initialize
async function init() {
  console.log('🚀 Initializing real-time wallet fetcher...');
  
  // Fetch initial data
  await fetchWalletData();
  
  if (walletData) {
    updateDashboard();
    
    // Set up auto-refresh
    setInterval(fetchWalletData, CONFIG.refreshInterval);
    
    console.log('✅ Real-time wallet tracking enabled!');
    console.log(`   Refresh interval: ${CONFIG.refreshInterval / 1000} seconds`);
    console.log(`   Wallet: ${CONFIG.walletAddress}`);
  } else {
    console.log('⚠️ Failed to fetch initial data');
  }
}

// Export functions
window.WalletTracker = {
  fetch: fetchWalletData,
  update: updateDashboard,
  init: init,
  config: CONFIG
};

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

console.log('👛 Wallet Tracker loaded');
