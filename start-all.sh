#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Maureen Ndung'u Campaign Website    ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if a port is in use
check_port() {
    if ss -tulpn 2>/dev/null | grep -q ":$1 "; then
        return 1
    else
        return 0
    fi
}

# Function to kill process on a port
kill_port() {
    if check_port $1; then
        return 0
    else
        echo -e "${YELLOW}⚠️  Port $1 is in use. Attempting to free it...${NC}"
        sudo fuser -k $1/tcp 2>/dev/null
        sleep 1
        if check_port $1; then
            echo -e "${GREEN}✅ Port $1 freed${NC}"
            return 0
        else
            echo -e "${RED}❌ Could not free port $1${NC}"
            return 1
        fi
    fi
}

# Find available port for website (starting from 8000)
WEBSITE_PORT=8000
while ! check_port $WEBSITE_PORT; do
    WEBSITE_PORT=$((WEBSITE_PORT + 1))
    if [ $WEBSITE_PORT -gt 8010 ]; then
        echo -e "${RED}❌ No available ports found in range 8000-8010${NC}"
        exit 1
    fi
done

# Check WebSocket port (3001)
WS_PORT=3001
if ! check_port $WS_PORT; then
    echo -e "${YELLOW}⚠️  WebSocket port $WS_PORT is in use${NC}"
    if ! kill_port $WS_PORT; then
        echo -e "${RED}❌ Cannot start WebSocket server. Please free port $WS_PORT manually.${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Ports: Website=$WEBSITE_PORT, WebSocket=$WS_PORT${NC}"
echo ""

# Create log directories
mkdir -p logs

# Start WebSocket Server
echo -e "${BLUE}🚀 Starting WebSocket Server...${NC}"
cd ~/Desktop/campaign-website/qa-server
npm start > ../logs/websocket.log 2>&1 &
WS_PID=$!
echo $WS_PID > ../logs/websocket.pid
echo -e "${GREEN}✅ WebSocket server started (PID: $WS_PID)${NC}"
echo -e "   Logs: ~/Desktop/campaign-website/logs/websocket.log"

# Wait for WebSocket to initialize
sleep 2

# Check if WebSocket started successfully
if ps -p $WS_PID > /dev/null; then
    echo -e "${GREEN}✅ WebSocket server is running on port $WS_PORT${NC}"
else
    echo -e "${RED}❌ WebSocket server failed to start. Check logs.${NC}"
    cat ../logs/websocket.log
    exit 1
fi

echo ""

# Start Main Website
echo -e "${BLUE}🌐 Starting Main Website Server...${NC}"
cd ~/Desktop/campaign-website
python3 -m http.server $WEBSITE_PORT > logs/website.log 2>&1 &
WEBSITE_PID=$!
echo $WEBSITE_PID > logs/website.pid
echo -e "${GREEN}✅ Main website started (PID: $WEBSITE_PID)${NC}"
echo -e "   Logs: ~/Desktop/campaign-website/logs/website.log"

sleep 1

# Check if website started successfully
if ps -p $WEBSITE_PID > /dev/null; then
    echo -e "${GREEN}✅ Main website is running on port $WEBSITE_PORT${NC}"
else
    echo -e "${RED}❌ Main website failed to start. Check logs.${NC}"
    cat logs/website.log
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}🎉 All servers are running!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}📱 Access your campaign website:${NC}"
echo -e "   ${BLUE}http://localhost:$WEBSITE_PORT${NC}"
echo ""
echo -e "${YELLOW}🔧 Admin Panel:${NC}"
echo -e "   ${BLUE}http://localhost:$WS_PORT/admin.html${NC}"
echo ""
echo -e "${YELLOW}📊 Q&A API:${NC}"
echo -e "   ${BLUE}http://localhost:$WS_PORT/api/questions${NC}"
echo ""
echo -e "${YELLOW}📝 Logs:${NC}"
echo -e "   Website: ${BLUE}tail -f logs/website.log${NC}"
echo -e "   WebSocket: ${BLUE}tail -f logs/websocket.log${NC}"
echo ""
echo -e "${RED}⚠️  To stop all servers, run: ${NC}./stop-all.sh"
echo ""

# Keep script running and show live logs
echo -e "${BLUE}📡 Live logs (press Ctrl+C to stop servers):${NC}"
echo -e "${YELLOW}----------------------------------------${NC}"

# Show logs in real-time
tail -f logs/websocket.log logs/website.log &

# Wait for Ctrl+C
wait
