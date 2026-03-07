#!/bin/bash

# Web3 Integration Installation Script for PAYO
# Run this script to install all required dependencies

echo "🚀 Installing Web3 dependencies for PAYO..."

# Core Web3 libraries
echo "📦 Installing Wagmi, Viem, and Web3Modal..."
npm install wagmi viem @web3modal/wagmi-react-native @walletconnect/react-native-compat

# React Query (required by Wagmi)
echo "📦 Installing React Query..."
npm install @tanstack/react-query

# Polyfills and utilities
echo "📦 Installing polyfills..."
npm install react-native-get-random-values react-native-mmkv

# React Native SVG (for Web3Modal UI)
echo "📦 Installing React Native SVG..."
npm install react-native-svg

# React Native Reanimated (if not already installed)
echo "📦 Checking React Native Reanimated..."
npm list react-native-reanimated || npm install react-native-reanimated

echo "✅ All dependencies installed!"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "1. Get your WalletConnect Project ID from https://cloud.walletconnect.com/"
echo "2. Add to .env: EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id"
echo "3. Update index.js to import polyfills at the very top:"
echo "   import './polyfills';"
echo "4. Rebuild native apps: npx expo prebuild --clean (if using Expo)"
echo "   OR: cd ios && pod install && cd .. (if bare React Native)"
echo ""
echo "📖 See WEB3_INTEGRATION_GUIDE.md for complete setup instructions"
echo ""
echo "Happy building! 🎉"
