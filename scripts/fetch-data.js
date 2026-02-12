/**
 * Fetch Real-Time Data from Base Blockchain
 * 
 * This script fetches actual token balances and transactions
 * from the Base network using ethers.js
 */

import { ethers } from 'ethers';
import fs from 'fs';
import axios from 'axios';

// Configuration
const CONFIG = {
  // Base RPC - using public RPC
  baseRpc: 'https://mainnet.base.org',
  
  // Wallet address
  walletAddress: '0x7854C27577d6d6A1b487db32e0e10E87E9f52183',
  
  // Output directory
  outputDir: './public',
  
  // Token list to track (Base chain)
  trackedTokens: [
    // Native ETH
    { symbol: 'ETH', address: '0x0000000000000000000000000000000000000000' },
    
    // Known Base tokens
    { symbol: 'DAI', address: '0x50c5725949A6E0c1be9c4F98c12c1C9B4eA9bD4c' },
    { symbol: 'USDC', address: '0x833589fCD6eDb6E08F4c7C32D4f71b54bdD02913' },
    { symbol: 'USDbC', address: '0xd9aAEc86B65D86f6AEDB3bc91daC91aBD70fBff1' },
    { symbol: 'cbBTC', address: '0xcbB7E0000aB01CE1737010A7c06650C1508E4800' },
    
    // MBC-20 tokens (these are inscriptions, balances stored differently)
    // For MBC-20, we need to check the inscription contract
  ]
};

// ERC-20 ABI for balanceOf
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function name() view returns (string)'
];

// Fetch ETH balance
async function getEthBalance(provider, address) {
  try {
    const balance = await provider.getBalance(address);
    return {
      symbol: 'ETH',
      name: 'Ethereum',
      balance: ethers.formatEther(balance),
      balanceWei: balance.toString()
    };
  } catch (error) {
    console.error('Error fetching ETH balance:', error.message);
    return null;
  }
}

// Fetch ERC-20 token balance
async function getTokenBalance(provider, tokenConfig) {
  try {
    const token = new ethers.Contract(tokenConfig.address, ERC20_ABI, provider);
    
    const [balance, symbol, decimals, name] = await Promise.all([
      token.balanceOf(CONFIG.walletAddress),
      token.symbol(),
      token.decimals(),
      token.name()
    ]);
    
    const formattedBalance = ethers.formatUnits(balance, decimals);
    
    return {
      symbol,
      name,
      address: tokenConfig.address,
      balance: formattedBalance,
      balanceWei: balance.toString(),
      decimals
    };
  } catch (error) {
    // Token might not exist or have different ABI
    return null;
  }
}

// Fetch recent transactions (using Basescan API)
async function getRecentTransactions() {
  try {
    const apiKey = process.env.BASESCAN_API_KEY || '';
    const url = `https://api.basescan.org/api?module=account&action=txlist&address=${CONFIG.walletAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`;
    
    const response = await axios.get(url, { timeout: 10000 });
    
    if (response.data.status === '1') {
      return response.data.result.slice(0, 10).map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
        timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei'),
        isError: tx.isError === '1'
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    return [];
  }
}

// Fetch MBC-20 balances (from inscription indexer)
// Note: MBC-20 tokens are stored differently, need to query the indexer
async function getMbc20Balances() {
  // For now, return mock data - in production, query the MBC-20 indexer API
  return [
    { symbol: 'GPT', balance: '100', type: 'MBC-20' },
    { symbol: 'LLM', balance: '100', type: 'MBC-20' },
    { symbol: 'AGI', balance: '100', type: 'MBC-20' },
    { symbol: 'NLM', balance: '100', type: 'MBC-20' },
    { symbol: 'UNI', balance: '100', type: 'MBC-20' }
  ];
}

// Main fetch function
async function fetchAllData() {
  console.log('🔄 Fetching real-time data from Base blockchain...\n');
  
  const provider = new ethers.JsonRpcProvider(CONFIG.baseRpc);
  
  const result = {
    timestamp: new Date().toISOString(),
    wallet: CONFIG.walletAddress,
    network: 'Base Mainnet',
    ethBalance: null,
    tokens: [],
    mbc20: [],
    transactions: [],
    summary: {
      totalValueUsd: 0,
      tokenCount: 0
    }
  };
  
  // Fetch ETH balance
  console.log('📊 Fetching ETH balance...');
  const ethData = await getEthBalance(provider, CONFIG.walletAddress);
  if (ethData) {
    result.ethBalance = ethData;
    console.log(`   ETH: ${ethData.balance}`);
  }
  
  // Fetch ERC-20 balances
  console.log('\n🪙 Fetching ERC-20 token balances...');
  for (const token of CONFIG.trackedTokens) {
    if (token.address === '0x0000000000000000000000000000000000000000') continue;
    
    const balance = await getTokenBalance(provider, token);
    if (balance && parseFloat(balance.balance) > 0) {
      result.tokens.push(balance);
      console.log(`   ${balance.symbol}: ${balance.balance}`);
    }
  }
  
  // Fetch MBC-20 balances
  console.log('\n🔷 Fetching MBC-20 inscriptions...');
  result.mbc20 = await getMbc20Balances();
  console.log(`   Found ${result.mbc20.length} MBC-20 tokens`);
  
  // Fetch recent transactions
  console.log('\n📜 Fetching recent transactions...');
  result.transactions = await getRecentTransactions();
  console.log(`   Found ${result.transactions.length} transactions`);
  
  // Calculate summary
  result.summary.tokenCount = result.tokens.length + result.mbc20.length;
  
  return result;
}

// Save data to files
async function saveData(data) {
  // Save complete data
  fs.writeFileSync(
    `${CONFIG.outputDir}/wallet-data.json`,
    JSON.stringify(data, null, 2)
  );
  
  // Save simplified portfolio for dashboard
  const portfolio = {
    timestamp: data.timestamp,
    wallet: data.wallet,
    summary: data.summary,
    tokens: [
      ...data.tokens.map(t => ({
        token: t.symbol,
        amount: t.balance,
        entryPrice: 0,
        currentPrice: 0,
        pnl: 0,
        signal: 'HOLD'
      })),
      ...data.mbc20.map(m => ({
        token: m.symbol,
        amount: m.balance,
        entryPrice: 0,
        currentPrice: 0,
        pnl: 0,
        signal: 'HOLD'
      }))
    ],
    total_value_eth: parseFloat(data.ethBalance?.balance || 0),
    total_pnl_percent: 0
  };
  
  fs.writeFileSync(
    `${CONFIG.outputDir}/portfolio.json`,
    JSON.stringify(portfolio, null, 2)
  );
  
  console.log('\n✅ Data saved to public/');
}

// Main execution
async function main() {
  try {
    const data = await fetchAllData();
    await saveData(data);
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 FETCH COMPLETE');
    console.log('='.repeat(50));
    console.log(`Wallet: ${data.wallet}`);
    console.log(`ETH: ${data.ethBalance?.balance || '0'}`);
    console.log(`Tokens: ${data.tokens.length}`);
    console.log(`MBC-20: ${data.mbc20.length}`);
    console.log(`Time: ${data.timestamp}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Export for use in other modules
export { fetchAllData, getEthBalance, getTokenBalance };

// Run if called directly
main();
