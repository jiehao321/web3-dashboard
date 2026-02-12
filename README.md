# Web3 实时监控仪表板

一个专业、美观、实用的 Web3 实时监控仪表板，展示持仓状态、热点代币、预测市场和风险指标。

![Dashboard Preview](preview.png)

## ✨ 功能特性

### 📊 仪表板首页
- 总资产价值（ETH/USD 双显示）
- 总盈亏百分比
- 24h 变化趋势
- 实时风险指标

### 💼 持仓管理
- 代币列表（名称、数量、PnL）
- 可排序（盈亏/价值/名称）
- 可筛选搜索
- 止盈/止损状态标识

### 🔥 热点扫描
- DexScreener Top 10 代币
- 24h 涨跌幅度
- 流动性指标
- 买入/观察/卖出信号

### 🎯 预测市场
- Polymarket 热门预测
- 当前赔率显示
- 模拟仓位建议

### ⚡ 价格警报
- 止盈/止损提醒
- 接近目标通知
- 下一步行动建议

### ⚙ 设置
- 自动刷新间隔
- 货币显示偏好
- 风险阈值设置

## 🚀 快速开始

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/yourusername/web3-dashboard.git
cd web3-dashboard

# 使用 Python 启动本地服务器
python3 -m http.server 8080

# 或使用 Node.js
npx serve .
```

访问 `http://localhost:8080`

### 数据源配置

项目从以下位置读取数据文件：
- `/root/.openclaw/workspace/web3-master/data/portfolio.json`
- `/root/.openclaw/workspace/web3-master/data/hot-tokens.json`
- `/root/.openclaw/workspace/web3-master/data/price-alerts.json`

## 📁 项目结构

```
web3-dashboard/
├── public/
│   ├── index.html      # 主 HTML 文件
│   ├── styles.css      # 样式文件
│   └── app.js          # 主应用逻辑
├── .github/
│   └── workflows/
│       └── deploy.yml  # CI/CD 部署配置
├── README.md           # 项目文档
├── package.json        # 项目配置
└── .gitignore         # Git 忽略配置
```

## 🛠 技术栈

- **前端**: 纯 HTML/CSS/JavaScript
- **样式**: CSS3 (CSS Variables, Flexbox, Grid)
- **部署**: GitHub Pages / Vercel / Cloudflare Pages
- **实时更新**: JavaScript setInterval

## 📦 部署

### GitHub Pages

1. 在 GitHub 创建仓库
2. 推送代码
3. Settings → Pages → Source: main branch
4. 访问 `https://yourusername.github.io/web3-dashboard`

### Vercel

```bash
npm i -g vercel
vercel
```

### Cloudflare Pages

1. 连接 GitHub 仓库
2. 构建命令: (空)
3. 输出目录: public
4. 部署

## 🔧 自定义

### 修改 ETH 价格

在 `app.js` 中修改：
```javascript
DataStore.ethPrice = 3200; // 修改为当前 ETH 价格
```

### 添加新的代币

修改 `portfolio.json` 数据文件：
```json
{
  "token": "YOUR_TOKEN",
  "amount": 1000,
  "entryPrice": 0.001,
  "currentPrice": 0.0015,
  "pnl": 50.0,
  "signal": "BUY"
}
```

### 修改刷新间隔

在设置页面或修改代码：
```javascript
// 默认 1 分钟
const refreshInterval = 60000; // 毫秒
```

## 🎨 主题

支持深色/浅色主题，自动适应系统设置。

## 📱 响应式设计

完美支持桌面端和移动端设备。

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your@email.com
