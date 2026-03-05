#!/bin/bash

# PAYO Wallet - iOS Run Script
# This script helps run the iOS app properly

echo "🚀 PAYO Wallet - Starting iOS App"
echo "=================================="
echo ""

# Change to project directory
cd "$(dirname "$0")"

echo "📁 Current directory: $(pwd)"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules not found. Running npm install..."
    npm install
fi

# Check if Pods exist
if [ ! -d "ios/Pods" ]; then
    echo "❌ iOS Pods not found. Installing pods..."
    cd ios
    bundle install
    bundle exec pod install
    cd ..
fi

echo "✅ Dependencies OK"
echo ""

# Kill any existing Metro bundler
echo "🧹 Cleaning up old Metro processes..."
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# Start Metro bundler in background
echo "📦 Starting Metro bundler..."
npm start --  --reset-cache > metro.log 2>&1 &
METRO_PID=$!

# Wait for Metro to start
echo "⏳ Waiting for Metro to initialize (10 seconds)..."
sleep 10

# Check if Metro is running
if ps -p $METRO_PID > /dev/null; then
    echo "✅ Metro bundler running (PID: $METRO_PID)"
else
    echo "❌ Metro bundler failed to start. Check metro.log"
    exit 1
fi

echo ""
echo "🏗️  Building iOS app..."
echo "This may take a few minutes on first run..."
echo ""

# Run iOS app
npx react-native run-ios --simulator="iPhone 16 Pro"

# Show Metro logs if build fails
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed. Showing Metro logs:"
    echo "====================================="
    tail -50 metro.log
    echo ""
    echo "💡 Try these troubleshooting steps:"
    echo "   1. Open Xcode: open ios/PayoApps.xcworkspace"
    echo "   2. Select a simulator in Xcode"
    echo "   3. Click the Play button in Xcode"
    echo "   4. Check TROUBLESHOOTING.md for more help"
fi
