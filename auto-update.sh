#!/bin/bash
# Web3 Dashboard - 自动更新脚本
# 使用 cron 每5分钟执行

LOG_FILE="/root/.openclaw/workspace/web3-dashboard/auto-update.log"
DATA_SOURCE="/root/.openclaw/workspace/web3-master/data/"

echo "[$(date)] 开始更新数据..." >> $LOG_FILE

# 检查数据源是否存在
if [ -d "$DATA_SOURCE" ]; then
    # 复制最新的数据文件
    cp $DATA_SOURCE/portfolio.json /root/.openclaw/workspace/web3-dashboard/public/ 2>/dev/null
    cp $DATA_SOURCE/hot-tokens.json /root/.openclaw/workspace/web3-dashboard/public/ 2>/dev/null
    cp $DATA_SOURCE/price-alerts.json /root/.openclaw/workspace/web3-dashboard/public/ 2>/dev/null
    echo "[$(date)] 数据已更新" >> $LOG_FILE
else
    echo "[$(date)] 数据源不存在" >> $LOG_FILE
fi

echo "[$(date)] 更新完成" >> $LOG_FILE
