#!/bin/bash
# Web3 Dashboard - GitHub 部署脚本

# 设置 Git 用户信息
git config user.email "your-email@example.com"
git config user.name "Your Name"

# 添加远程仓库（请替换为你的仓库地址）
# 使用方式：./deploy.sh your-github-username
USERNAME=${1:-"yourusername"}
echo "🚀 部署到 https://github.com/$USERNAME/web3-dashboard"

# 重命名分支为 main
git branch -M main

# 添加远程仓库
git remote add origin https://github.com/$USERNAME/web3-dashboard.git

# 推送代码
echo "📤 推送代码..."
git push -u origin main

echo "✅ 代码已推送！"
echo ""
echo "📋 启用 GitHub Pages:"
echo "1. 访问 https://github.com/$USERNAME/web3-dashboard/settings/pages"
echo "2. Source 选择: 'main' branch"
echo "3. 点击 Save"
echo ""
echo "🌐 网站将在几分钟后可访问: https://$USERNAME.github.io/web3-dashboard"
