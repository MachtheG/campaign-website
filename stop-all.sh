#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🛑 Stopping all servers...${NC}"

# Stop WebSocket server
if [ -f logs/websocket.pid ]; then
    WS_PID=$(cat logs/websocket.pid)
    if command -v pm2 >/dev/null 2>&1 && [ "$(pm2 pid campaign-qa | head -n1)" != "0" ]; then
        pm2 stop campaign-qa >/dev/null 2>&1
        pm2 delete campaign-qa >/dev/null 2>&1
        echo -e "${GREEN}✅ WebSocket server stopped (PM2 process: campaign-qa)${NC}"
    elif ps -p $WS_PID > /dev/null 2>&1; then
        kill $WS_PID
        echo -e "${GREEN}✅ WebSocket server stopped (PID: $WS_PID)${NC}"
    fi
    rm logs/websocket.pid
fi

# Stop main website
if [ -f logs/website.pid ]; then
    WEBSITE_PID=$(cat logs/website.pid)
    if ps -p $WEBSITE_PID > /dev/null 2>&1; then
        kill $WEBSITE_PID
        echo -e "${GREEN}✅ Main website stopped (PID: $WEBSITE_PID)${NC}"
    fi
    rm logs/website.pid
fi

# Kill any remaining processes on ports
echo -e "${YELLOW}🔍 Cleaning up remaining processes...${NC}"
pkill -f "python3 -m http.server" 2>/dev/null
pkill -f "node server.js" 2>/dev/null

echo -e "${GREEN}✅ All servers stopped${NC}"
