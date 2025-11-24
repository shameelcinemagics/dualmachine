#!/bin/bash

# Start backend
echo "🚀 Starting backend..."
cd /d/dual/vendIT-FulllApp/vendIT-FulllApp/backend
npm install
pm2 start server.js &


# Start frontend
echo "🚀 Starting frontend..."
cd /d/dual/vendIT-FulllApp/vendIT-FulllApp/frontend
npm install
pm2 start ./node_modules/serve/build/main.js --name frontend -- -s dist -l 8080 &


# Wait for backend and frontend to initialize
echo "⏳ Waiting for servers to start..."
sleep 5

# Launch MAIN Chrome window on primary monitor
echo "🖥️ Launching MAIN Chrome window..."
# start "" chrome --new-window --kiosk --disable-features=OverscrollHistoryNavigation http://localhost:8080
start "" chrome --new-window --kiosk --disable-pinch --disable-gesture-requirements-for-pinch --disable-features=OverscrollHistoryNavigation http://localhost:8080



cd /d/vendIT-FulllApp/signage
node watcher.js
# Wait for Chrome windows to fully open
sleep 5



# wait


# pm2 start ecosystem.config.js
# pm2 logs