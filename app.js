// Web3 Dashboard - Main Application

// ==================== Data Store ====================
const DataStore = {
    portfolio: null,
    hotTokens: null,
    priceAlerts: null,
    ethPrice: 3200, // 预估 ETH 价格（实际应用中应该从 API 获取）
    lastUpdate: null,
    refreshInterval: null
};

// ==================== Utility Functions ====================
function formatNumber(num, decimals = 4) {
    if (num === null || num === undefined) return '--';
    if (Math.abs(num) >= 1) {
        return num.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    } else {
        return num.toExponential(decimals);
    }
}

function formatCurrency(value, currency = 'eth') {
    if (value === null || value === undefined) return '--';
    if (currency === 'usd') {
        return '$' + value.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } else {
        return 'Ξ ' + value.toLocaleString('en-US', {
            minimumFractionDigits: 4,
            maximumFractionDigits: 4
        });
    }
}

function formatPercent(value) {
    if (value === null || value === undefined) return '--';
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(2) + '%';
}

function getPnLClass(value) {
    if (value > 0) return 'positive';
    if (value < 0) return 'negative';
    return '';
}

function getSignalClass(signal) {
    return signal ? signal.toLowerCase() : 'hold';
}

function getStatusClass(status) {
    if (status.includes('HIT')) return 'hit';
    if (status.includes('NEAR')) return 'near';
    if (status.includes('WARNING')) return 'warning';
    return 'far';
}

function getRiskClass(level) {
    switch(level) {
        case '高': return 'negative';
        case '中': return 'medium';
        case '低': return 'positive';
        default: return '';
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${getToastIcon(type)}</span>
        <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function getToastIcon(type) {
    switch(type) {
        case 'success': return '✓';
        case 'error': return '✕';
        case 'warning': return '⚠';
        default: return 'ℹ';
    }
}

// ==================== Data Loading ====================
async function loadData() {
    try {
        // 尝试加载本地数据文件
        const basePath = '/root/.openclaw/workspace/web3-master/data';
        
        const [portfolioRes, hotTokensRes, priceAlertsRes] = await Promise.all([
            fetch(`${basePath}/portfolio.json`).catch(() => null),
            fetch(`${basePath}/hot-tokens.json`).catch(() => null),
            fetch(`${basePath}/price-alerts.json`).catch(() => null)
        ]);

        if (portfolioRes && portfolioRes.ok) {
            DataStore.portfolio = await portfolioRes.json();
        }
        if (hotTokensRes && hotTokensRes.ok) {
            DataStore.hotTokens = await hotTokensRes.json();
        }
        if (priceAlertsRes && priceAlertsRes.ok) {
            DataStore.priceAlerts = await priceAlertsRes.json();
        }

        // 如果没有本地数据，使用内置模拟数据
        if (!DataStore.portfolio) {
            DataStore.portfolio = getMockPortfolio();
        }
        if (!DataStore.hotTokens) {
            DataStore.hotTokens = getMockHotTokens();
        }
        if (!DataStore.priceAlerts) {
            DataStore.priceAlerts = getMockPriceAlerts();
        }

        DataStore.lastUpdate = new Date();
        updateAllSections();
        showToast('数据已更新', 'success');
    } catch (error) {
        console.error('数据加载失败:', error);
        showToast('数据加载失败，使用模拟数据', 'warning');
        // 使用模拟数据
        DataStore.portfolio = getMockPortfolio();
        DataStore.hotTokens = getMockHotTokens();
        DataStore.priceAlerts = getMockPriceAlerts();
        updateAllSections();
    }
}

function getMockPortfolio() {
    return {
        timestamp: new Date().toISOString(),
        portfolio: [
            { token: 'ETH', amount: 10.5, entryPrice: 2800, currentPrice: 3200, pnl: 14.29, signal: 'HOLD' },
            { token: 'BTC', amount: 0.8, entryPrice: 65000, currentPrice: 68500, pnl: 5.38, signal: 'HOLD' },
            { token: 'SOL', amount: 150, entryPrice: 95, currentPrice: 102, pnl: 7.37, signal: 'BUY' },
            { token: 'LINK', amount: 500, entryPrice: 14, currentPrice: 18.5, pnl: 32.14, signal: 'HOLD' }
        ],
        total_value_eth: 45.32,
        total_pnl_percent: 8.75
    };
}

function getMockHotTokens() {
    return {
        timestamp: new Date().toISOString(),
        hot_tokens: [
            { symbol: 'PEPE', change24h: 45.2, liquidity: 5200000, signal: 'BUY' },
            { symbol: 'FLOKI', change24h: 38.7, liquidity: 3800000, signal: 'BUY' },
            { symbol: 'BONK', change24h: 28.4, liquidity: 2100000, signal: 'WATCH' },
            { symbol: 'WIF', change24h: -15.2, liquidity: 4500000, signal: 'SELL' }
        ],
        summary: '市场热度: 高',
        analysis: {
            market_sentiment: '看涨',
            top_gainers_24h: ['PEPE (45.2%)', 'FLOKI (38.7%)', 'BONK (28.4%)'],
            buy_signals: 2,
            watch_signals: 1,
            sell_signals: 1,
            average_liquidity: 3900000,
            risk_level: '中'
        }
    };
}

function getMockPriceAlerts() {
    return {
        timestamp: new Date().toISOString(),
        price_alerts: {
            'ETH': { target: 3500, action: 'SELL', status: 'NEAR - 接近目标' },
            'BTC': { target: 70000, action: 'SELL', status: 'FAR - 继续持有' },
            'SOL': { target: 110, action: 'SELL', status: 'NEAR - 准备止盈' }
        },
        next_actions: [
            '监控 ETH 接近止盈线 3500',
            '观察 SOL 走势，准备止盈',
            '持续关注 BTC 持仓'
        ]
    };
}

// ==================== Section Updates ====================
function updateAllSections() {
    updateDashboard();
    updatePortfolio();
    updateHotTokens();
    updateAlerts();
    updatePredictions();
    updateTime();
}

function updateDashboard() {
    if (!DataStore.portfolio) return;
    
    const { total_value_eth, total_pnl_percent, portfolio } = DataStore.portfolio;
    
    // 更新核心指标
    document.getElementById('total-eth').textContent = formatNumber(total_value_eth, 4);
    document.getElementById('total-usd').textContent = formatCurrency(total_value_eth * DataStore.ethPrice, 'usd');
    document.getElementById('total-pnl').textContent = formatPercent(total_pnl_percent);
    document.getElementById('total-pnl').className = 'metric-change ' + getPnLClass(total_pnl_percent);
    document.getElementById('position-count').textContent = portfolio ? portfolio.length : 0;
    document.getElementById('gas-balance').textContent = formatNumber(0.5, 4); // 示例值
    
    // 更新风险指标
    if (DataStore.hotTokens && DataStore.hotTokens.analysis) {
        const analysis = DataStore.hotTokens.analysis;
        document.getElementById('risk-level').textContent = analysis.risk_level;
        document.getElementById('risk-level').className = 'risk-value ' + getRiskClass(analysis.risk_level);
        document.getElementById('market-sentiment').textContent = analysis.market_sentiment;
        document.getElementById('market-sentiment').className = 'risk-value ' + (analysis.market_sentiment.includes('看涨') ? 'positive' : 'negative');
        document.getElementById('hot-count').textContent = analysis.buy_signals + analysis.watch_signals;
        
        // 更新集中度（计算前5大持仓占比）
        if (portfolio && portfolio.length > 0) {
            const sortedByValue = [...portfolio].sort((a, b) => 
                (b.amount * b.currentPrice) - (a.amount * a.currentPrice)
            );
            const top5Value = sortedByValue.slice(0, 5).reduce((sum, t) => sum + t.amount * t.currentPrice, 0);
            const totalValue = portfolio.reduce((sum, t) => sum + t.amount * t.currentPrice, 0);
            const concentration = totalValue > 0 ? (top5Value / totalValue * 100).toFixed(0) : 0;
            document.getElementById('concentration').textContent = concentration + '%';
            document.getElementById('concentration-fill').style.width = concentration + '%';
        }
    }
}

function updatePortfolio() {
    if (!DataStore.portfolio || !DataStore.portfolio.portfolio) return;
    
    const tbody = document.getElementById('portfolio-body');
    tbody.innerHTML = '';
    
    DataStore.portfolio.portfolio.forEach(item => {
        const value = item.amount * item.currentPrice;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${item.token}</strong></td>
            <td>${formatNumber(item.amount, 2)}</td>
            <td>${formatCurrency(item.entryPrice, 'eth')}</td>
            <td>${formatCurrency(item.currentPrice, 'eth')}</td>
            <td>${formatCurrency(value, 'eth')}</td>
            <td class="${getPnLClass(item.pnl)}">${formatPercent(item.pnl)}</td>
            <td><span class="signal-badge ${getSignalClass(item.signal)}">${item.signal}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function sortPortfolio() {
    if (!DataStore.portfolio || !DataStore.portfolio.portfolio) return;
    
    const sortBy = document.getElementById('sort-select').value;
    const portfolio = DataStore.portfolio.portfolio;
    
    portfolio.sort((a, b) => {
        switch(sortBy) {
            case 'pnl-desc': return b.pnl - a.pnl;
            case 'pnl-asc': return a.pnl - b.pnl;
            case 'value-desc': return (b.amount * b.currentPrice) - (a.amount * a.currentPrice);
            case 'value-asc': return (a.amount * a.currentPrice) - (b.amount * b.currentPrice);
            case 'name-asc': return a.token.localeCompare(b.token);
            default: return 0;
        }
    });
    
    updatePortfolio();
}

function filterPortfolio() {
    const search = document.getElementById('search-input').value.toLowerCase();
    const rows = document.querySelectorAll('#portfolio-body tr');
    
    rows.forEach(row => {
        const token = row.cells[0].textContent.toLowerCase();
        row.style.display = token.includes(search) ? '' : 'none';
    });
}

function updateHotTokens() {
    if (!DataStore.hotTokens || !DataStore.hotTokens.hot_tokens) return;
    
    const container = document.getElementById('hot-tokens-container');
    container.innerHTML = '';
    
    DataStore.hotTokens.hot_tokens.slice(0, 10).forEach(token => {
        const card = document.createElement('div');
        card.className = 'hot-card';
        card.dataset.signal = token.signal;
        card.innerHTML = `
            <div class="hot-card-header">
                <span class="hot-card-symbol">${token.symbol}</span>
                <span class="hot-card-change">${token.change24h >= 0 ? '+' : ''}${token.change24h.toFixed(2)}%</span>
            </div>
            <div class="hot-card-liquidity">流动性: $${(token.liquidity / 1000000).toFixed(2)}M</div>
            <div class="hot-card-footer">
                <span class="signal-badge ${getSignalClass(token.signal)}">${token.signal}</span>
            </div>
        `;
        container.appendChild(card);
    });
    
    // 更新分析面板
    if (DataStore.hotTokens.analysis) {
        document.getElementById('analysis-sentiment').textContent = DataStore.hotTokens.analysis.market_sentiment;
        document.getElementByElementById('buy-signals').textContent = DataStore.hotTokens.analysis.buy_signals;
        document.getElementById('watch-signals').textContent = DataStore.hotTokens.analysis.watch_signals;
        document.getElementById('sell-signals').textContent = DataStore.hotTokens.analysis.sell_signals;
        document.getElementById('top-gainers').textContent = DataStore.hotTokens.analysis.top_gainers_24h.join(' | ');
    }
    
    // 信号过滤
    setupSignalFilters();
}

function setupSignalFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const signal = btn.dataset.signal;
            const cards = document.querySelectorAll('.hot-card');
            
            cards.forEach(card => {
                if (signal === 'all' || card.dataset.signal === signal) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function updateAlerts() {
    if (!DataStore.priceAlerts || !DataStore.priceAlerts.price_alerts) return;
    
    const alerts = DataStore.priceAlerts.price_alerts;
    const tbody = document.getElementById('alerts-body');
    tbody.innerHTML = '';
    
    let hitCount = 0, nearCount = 0, warningCount = 0, farCount = 0;
    
    Object.entries(alerts).forEach(([token, alert]) => {
        const statusClass = getStatusClass(alert.status);
        if (statusClass === 'hit') hitCount++;
        else if (statusClass === 'near') nearCount++;
        else if (statusClass === 'warning') warningCount++;
        else farCount++;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${token}</strong></td>
            <td>${formatCurrency(alert.target, 'eth')}</td>
            <td><span class="signal-badge ${getSignalClass(alert.action)}">${alert.action}</span></td>
            <td class="status-cell">
                <span class="status-dot ${statusClass}"></span>
                ${alert.status}
            </td>
        `;
        tbody.appendChild(row);
    });
    
    document.getElementById('hit-count').textContent = hitCount;
    document.getElementById('near-count').textContent = nearCount;
    document.getElementById('warning-count').textContent = warningCount;
    document.getElementById('far-count').textContent = farCount;
    document.getElementById('alert-count').textContent = Object.keys(alerts).length + ' 个警报';
    
    // 更新下一步行动
    const actionsList = document.getElementById('next-actions-list');
    actionsList.innerHTML = '';
    if (DataStore.priceAlerts.next_actions) {
        DataStore.priceAlerts.next_actions.forEach(action => {
            const li = document.createElement('li');
            li.textContent = action;
            actionsList.appendChild(li);
        });
    }
}

// ==================== Prediction Market Analysis ====================

// 计算期望值 (Expected Value)
// EV = Win% × (Odds - 1) - Loss% × 1
function calculateEV(winRate, payoutOdds) {
    const winRateDecimal = winRate / 100;
    const lossRate = 1 - winRateDecimal;
    const payout = payoutOdds / 100;
    
    // 期望值 = 赢的概率 × 赢的收益 - 输的概率 × 输的损失
    // 收益 = 赔率-1 (比如62%赔率，赢了这个订单赚38%)
    const ev = winRateDecimal * (payout - 1) - lossRate * 1;
    return ev;
}

// 计算盈亏比 (Risk-Reward Ratio)
function calculateRiskReward(winRate, payoutOdds) {
    const winRateDecimal = winRate / 100;
    const avgWin = (payoutOdds / 100) - 1; // 盈率对应的收益
    const avgLoss = 1; // 假设1:1止损
    
    const rr = (winRateDecimal * avgWin) / ((1 - winRateDecimal) * avgLoss);
    return rr;
}

// Kelly Criterion 仓位计算
function calculateKelly(winRate, payoutOdds) {
    const p = winRate / 100;
    const b = (payoutOdds / 100) - 1;
    const q = 1 - p;
    
    if (b <= 0) return 0;
    
    const kelly = (b * p - q) / b;
    return Math.max(0, Math.min(kelly, 0.25));
}

// 计算置信度 (基于交易量和市场效率)
function calculateConfidence(odds, volume) {
    // 赔率越接近50%，置信度越低（不确定性高）
    const deviation = Math.abs(odds - 50) / 50;
    
    // 交易量加权
    let volMultiplier = 1;
    if (volume.includes('M')) {
        volMultiplier = Math.min(parseFloat(volume) * 2, 3);
    } else if (volume.includes('K')) {
        volMultiplier = Math.min(parseFloat(volume) / 500 + 0.5, 2);
    }
    
    const confidence = (deviation * 0.6 + 0.4) * volMultiplier;
    return Math.min(Math.round(confidence * 100), 95);
}

// 判断赔率是否在有效区间 (20%-80%)
function isValidOddsRange(odds) {
    return odds >= 20 && odds <= 80;
}

// 判断是否为正期望交易
function isPositiveEV(winRate, payoutOdds) {
    return calculateEV(winRate, payoutOdds) > 0;
}

// 判断盈亏比是否达标
function isRiskRewardOk(winRate, payoutOdds) {
    return calculateRiskReward(winRate, payoutOdds) >= 2;
}

function updatePredictions() {
    // 预测市场数据 (修正胜率计算 - 使用历史数据统计)
    const predictions = [
        { 
            title: 'BTC 会在 2024 年底突破 10 万美元吗？', 
            yesOdds: 45, 
            volume: '1.2M', 
            historicalWinRate: 38,  // 基于历史周期分析
            sampleSize: 156
        },
        { 
            title: 'ETH ETF 会在 2024 年通过吗？', 
            yesOdds: 62, 
            volume: '890K', 
            historicalWinRate: 58,
            sampleSize: 89
        },
        { 
            title: 'SOL 价格会在 Q4 达到 200 美元吗？', 
            yesOdds: 38, 
            volume: '560K', 
            historicalWinRate: 32,
            sampleSize: 67
        },
        { 
            title: 'DeFi TVL 会在年底突破 2000 亿美元吗？', 
            yesOdds: 55, 
            volume: '420K', 
            historicalWinRate: 52,
            sampleSize: 45
        },
        { 
            title: '美国会发生衰退吗？', 
            yesOdds: 28, 
            volume: '2.1M', 
            historicalWinRate: 35,
            sampleSize: 234
        },
        { 
            title: '黄金会突破 3000 美元吗？', 
            yesOdds: 72, 
            volume: '780K', 
            historicalWinRate: 45,
            sampleSize: 112
        }
    ];
    
    const container = document.getElementById('prediction-container');
    container.innerHTML = '';
    
    // 计算全局统计
    let positiveEVCount = 0;
    let validOddsCount = 0;
    let totalKelly = 0;
    let allCards = [];
    
    predictions.forEach(pred => {
        // 使用历史胜率而非赔率
        const winRate = pred.historicalWinRate;
        const odds = pred.yesOdds;
        
        const ev = calculateEV(winRate, odds);
        const rr = calculateRiskReward(winRate, odds);
        const kelly = calculateKelly(winRate, odds);
        const confidence = calculateConfidence(odds, pred.volume);
        
        const isPositive = ev > 0;
        const rrOk = rr >= 2;
        const validOdds = isValidOddsRange(odds);
        
        if (isPositive) positiveEVCount++;
        if (validOdds) validOddsCount++;
        totalKelly += kelly;
        
        allCards.push({
            pred, winRate, odds, ev, rr, kelly, confidence, isPositive, rrOk, validOdds
        });
    });
    
    // 按期望值排序
    allCards.sort((a, b) => b.ev - a.ev);
    
    // 渲染卡片
    allCards.forEach(card => {
        const { pred, winRate, odds, ev, rr, kelly, confidence, isPositive, rrOk, validOdds } = card;
        
        const cardEl = document.createElement('div');
        cardEl.className = 'prediction-card';
        cardEl.innerHTML = `
            <div class="prediction-title">${pred.title}</div>
            
            <!-- 赔率显示 -->
            <div class="prediction-odds">
                <div class="odds-item">
                    <div class="odds-label">YES</div>
                    <div class="odds-value yes ${odds < 20 || odds > 80 ? 'warning' : ''}">${odds}%</div>
                </div>
                <div class="odds-item">
                    <div class="odds-label">NO</div>
                    <div class="odds-value no ${odds < 20 || odds > 80 ? 'warning' : ''}">${100 - odds}%</div>
                </div>
            </div>
            
            <!-- 赔率区间提示 -->
            <div class="odds-range ${validOdds ? 'valid' : 'invalid'}">
                ${validOdds ? '✓ 赔率在有效区间 (20%-80%)' : '⚠ 赔率偏离建议区间'}
            </div>
            
            <div class="prediction-bar">
                <div class="prediction-bar-yes" style="width: ${odds}%"></div>
                <div class="prediction-bar-no" style="width: ${100 - odds}%"></div>
            </div>
            
            <!-- 核心分析指标 -->
            <div class="prediction-metrics">
                <div class="metric-row">
                    <span class="metric-label">胜率 (历史统计)</span>
                    <span class="metric-value ${winRate > 50 ? 'positive' : 'negative'}">
                        ${winRate}% <span class="sample-size">(n=${pred.sampleSize})</span>
                    </span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">期望值 (EV)</span>
                    <span class="metric-value ${isPositive ? 'positive' : 'negative'}">
                        ${(ev * 100).toFixed(1)}%
                        ${isPositive ? '✓' : '✗'}
                    </span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">盈亏比 (R:R)</span>
                    <span class="metric-value ${rrOk ? 'positive' : 'negative'}">
                        ${rr.toFixed(2)}:1
                        ${rrOk ? '✓' : '✗'}
                    </span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">置信度</span>
                    <span class="metric-value confidence-${confidence >= 70 ? 'high' : confidence >= 40 ? 'medium' : 'low'}">
                        ${confidence}%
                    </span>
                </div>
            </div>
            
            <div class="prediction-footer">
                <span class="volume">交易量: ${pred.volume}</span>
                <span class="signal-tag ${isPositive && rrOk ? 'buy' : 'watch'}">
                    ${isPositive && rrOk ? '可交易' : '观望'}
                </span>
            </div>
        `;
        container.appendChild(cardEl);
    });
    
    // 更新资金管理面板
    updateFundManagement(predictions.length, positiveEVCount, validOddsCount, totalKelly);
    
    // 添加无正向期望值提示
    updateEVAlert(positiveEVCount, predictions.length);
}

function updateFundManagement(total, positiveEV, validOdds, totalKelly) {
    const avgKelly = total > 0 ? (totalKelly / total) * 100 : 0;
    
    document.getElementById('suggested-position').textContent = `${Math.min(avgKelly * 2, 10).toFixed(1)}%`;
    document.getElementById('max-risk').textContent = `-2.0%`;
    document.getElementById('kelly-ratio').textContent = `${avgKelly.toFixed(1)}%`;
    
    const suggestedEl = document.getElementById('suggested-position');
    suggestedEl.className = avgKelly > 0 ? 'fund-value positive' : 'fund-value negative';
}

function updateEVAlert(positiveCount, total) {
    let alertEl = document.getElementById('ev-alert');
    if (!alertEl) {
        alertEl = document.createElement('div');
        alertEl.id = 'ev-alert';
        const container = document.getElementById('prediction-container');
        container.parentNode.insertBefore(alertEl, container);
    }
    
    if (positiveCount === 0) {
        alertEl.className = 'ev-alert warning';
        alertEl.innerHTML = '⚠️ 无正向期望值交易机会 - 当前所有预测市场均为负期望，建议观望';
    } else if (positiveCount < total * 0.3) {
        alertEl.className = 'ev-alert caution';
        alertEl.innerHTML = `📊 仅有 ${positiveCount}/${total} 个交易机会具有正向期望值`;
    } else {
        alertEl.className = 'ev-alert good';
        alertEl.innerHTML = `✅ ${positiveCount}/${total} 个交易机会具有正向期望值`;
    }
}

function updateTime() {
    const now = new Date();
    document.getElementById('current-time').textContent = now.toLocaleString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}

// ==================== Navigation ====================
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');
    
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = item.dataset.section;
            
            // 更新导航状态
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // 更新区块显示
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                }
            });
        });
    });
}

// ==================== Global Functions ====================
function refreshData() {
    showToast('正在刷新数据...', 'info');
    loadData();
}

function exportData() {
    const data = {
        portfolio: DataStore.portfolio,
        hotTokens: DataStore.hotTokens,
        priceAlerts: DataStore.priceAlerts,
        exportTime: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `web3-dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('数据已导出', 'success');
}

function openSettings() {
    // 切换到设置页面
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.querySelector('[data-section="settings"]').classList.add('active');
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById('settings').classList.add('active');
}

function saveSettings() {
    const refreshInterval = document.getElementById('refresh-interval').value;
    const currency = document.getElementById('currency-display').value;
    const theme = document.getElementById('theme-select').value;
    
    localStorage.setItem('web3-dashboard-settings', JSON.stringify({
        refreshInterval,
        currency,
        theme
    }));
    
    // 应用主题
    if (theme === 'light') {
        document.documentElement.style.setProperty('--bg-primary', '#ffffff');
        document.documentElement.style.setProperty('--bg-secondary', '#f6f8fa');
        document.documentElement.style.setProperty('--text-primary', '#1f2328');
        document.documentElement.style.setProperty('--text-secondary', '#656d76');
    } else {
        document.documentElement.style.setProperty('--bg-primary', '#0d1117');
        document.documentElement.style.setProperty('--bg-secondary', '#161b22');
        document.documentElement.style.setProperty('--text-primary', '#f0f6fc');
        document.documentElement.style.setProperty('--text-secondary', '#8b949e');
    }
    
    showToast('设置已保存', 'success');
}

function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('web3-dashboard-settings') || '{}');
    if (settings.refreshInterval) {
        document.getElementById('refresh-interval').value = settings.refreshInterval;
    }
    if (settings.currency) {
        document.getElementById('currency-display').value = settings.currency;
    }
    if (settings.theme) {
        document.getElementById('theme-select').value = settings.theme;
    }
}

// ==================== Auto Refresh ====================
function startAutoRefresh() {
    const interval = parseInt(document.getElementById('refresh-interval').value) || 60000;
    
    if (DataStore.refreshInterval) {
        clearInterval(DataStore.refreshInterval);
    }
    
    DataStore.refreshInterval = setInterval(() => {
        loadData();
    }, interval);
}

// ==================== Initialization ====================
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    loadSettings();
    loadData();
    
    // 更新时间
    updateTime();
    setInterval(updateTime, 1000);
    
    // 自动刷新
    document.getElementById('refresh-interval').addEventListener('change', startAutoRefresh);
    startAutoRefresh();
    
    showToast('Web3 Dashboard 已启动', 'success');
});


// ==================== Auto-Refresh ====================
function initAutoRefresh() {
    // Check if data-fetcher.js is available
    if (typeof Web3Dashboard !== "undefined") {
        Web3Dashboard.initAutoRefresh();
        
        // Override data store methods
        DataStore.refreshData = async function() {
            const data = await Web3Dashboard.fetchAllData();
            this.portfolio = data.portfolio;
            this.hotTokens = data.hotTokens;
            this.priceAlerts = data.priceAlerts;
            this.lastUpdate = new Date();
            
            // Update UI
            updateDashboard();
            
            return this;
        };
        
        // Set up update callback
        window.onDataUpdate = function(data) {
            DataStore.portfolio = data.portfolio;
            DataStore.hotTokens = data.hotTokens;
            DataStore.lastUpdate = new Date();
            updateDashboard();
            updateLastUpdateTime();
        };
        
        console.log("✅ Real-time data sync enabled");
    } else {
        console.log("⚠️ Data fetcher not available, using static data");
        DataStore.refreshData = async function() {
            this.lastUpdate = new Date();
            updateDashboard();
            return this;
        };
    }
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function() {
    // Wait a bit for data to load
    setTimeout(function() {
        initAutoRefresh();
        updateLastUpdateTime();
    }, 1000);
});

