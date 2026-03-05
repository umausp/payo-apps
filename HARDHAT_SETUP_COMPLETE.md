# ✅ Hardhat Test Environment Setup Complete

## Your Wallet is Ready for Testing!

### Wallet Address
```
0xC4c191704f75d92e573b31cbD34E6bd22e147f06
```

### Current Balances
- **ETH:** 2,100 ETH (for gas fees)
- **PAYO:** 100,000 PAYO tokens (for payments)

---

## Deployed Contracts (Hardhat Localhost)

### PAYO Token
```
0x0B306BF915C4d645ff596e518fAf3F9669b97016
```

### Payment Processor
```
0x9A9f2CCfdE556A7E9Ff0848998Aa4a0CFD8863AE
```

### Minimal Forwarder
```
0x959922bE3CAee4b8Cd9a407cc3ac1C251C2007B1
```

### Vesting Manager
```
0x68B1D87F95878fE05B998F19b66F4baba5De1aed
```

### Refund Manager
```
0x3Aa5ebB10DC797CAC828524e59A333d0A371443c
```

---

## Configure Your App

### Step 1: Update Constants

Edit: `/Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps/src/constants/index.ts`

```typescript
// Blockchain Configuration
export const BLOCKCHAIN = {
  RPC_URL: 'http://10.0.2.2:8545',  // Android Emulator
  // RPC_URL: 'http://localhost:8545',  // iOS Simulator
  CHAIN_ID: 31337, // Hardhat
  TOKEN_ADDRESS: '0x0B306BF915C4d645ff596e518fAf3F9669b97016', // PAYO Token
  ORACLE_ADDRESS: '0x...', // Not needed for Hardhat testing
  EXPLORER_URL: 'http://localhost:8545', // Local
  SYMBOL: 'PAYO',
  DECIMALS: 18,
  GAS_LIMIT: 100000,
  MAX_SUPPLY: 1000000000,
} as const;
```

### Step 2: Rebuild the App

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps

# Stop Metro (Ctrl+C)
npm start -- --reset-cache

# In another terminal
npm run android
```

---

## Test Payment Flow

### Your Wallet Must Match

**IMPORTANT:** The wallet address in your app must be `0xC4c191704f75d92e573b31cbD34E6bd22e147f06`

**Options:**

1. **If you have the private key for this address:**
   - Import it into the app

2. **If you don't have the private key:**
   - Create/import your wallet in the app first
   - Get the address from Settings
   - Run this to fund YOUR wallet:

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-contracts

# Edit scripts/fundPAYO.js
# Change targetAddress to YOUR_WALLET_ADDRESS

npx hardhat run scripts/fundPAYO.js --network localhost
```

---

## Test Recipients

Use these addresses as payment recipients (they're Hardhat's test accounts):

### Recipient 1
```
0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

### Recipient 2
```
0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

### Recipient 3
```
0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

---

## Generate Test QR Codes

### Option 1: Simple Payment
```json
{
  "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "amount": "10"
}
```

### Option 2: With Merchant Info
```json
{
  "address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
  "amount": "25.50",
  "merchantInfo": {
    "name": "Coffee Shop",
    "id": "merchant_123"
  }
}
```

Use: https://www.qr-code-generator.com/

---

## Testing Steps

### 1. Start Hardhat Node (if not running)
```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-contracts
npx hardhat node
```

### 2. Start Backend Services
```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-backend

# In separate terminals
npm run start:auth    # Port 3001
npm run start:wallet  # Port 3002
npm run start:payment # Port 3004
```

### 3. Watch Logs
```bash
# Android
adb logcat -c && adb logcat | grep -E "\[API|Payment|Blockchain"

# iOS
npx react-native log-ios
```

### 4. Test Payment
1. Open app → Login
2. Check balance (should show 100,000 PAYO)
3. Scan QR → Confirm payment
4. Watch logs for transaction

---

## Verify Balances Anytime

### Check ETH Balance
```bash
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "method":"eth_getBalance",
    "params":["0xC4c191704f75d92e573b31cbD34E6bd22e147f06","latest"],
    "id":1
  }' | jq -r '.result' | xargs printf "%d\n"
```

### Check PAYO Balance
```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-contracts

npx hardhat console --network localhost
```

Then in the console:
```javascript
const token = await ethers.getContractAt("PAYOToken", "0x0B306BF915C4d645ff596e518fAf3F9669b97016")
const balance = await token.balanceOf("0xC4c191704f75d92e573b31cbD34E6bd22e147f06")
ethers.formatEther(balance)
```

---

## Fund Additional Wallets

If you need to fund other addresses:

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-contracts

# Edit scripts/fundPAYO.js
# Change targetAddress to the new address

npx hardhat run scripts/fundPAYO.js --network localhost
```

---

## Troubleshooting

### "Insufficient balance" Error

**Check which address the app is using:**
1. Open app → Settings
2. Look at wallet address
3. Compare with `0xC4c191704f75d92e573b31cbD34E6bd22e147f06`
4. If different, fund the correct address

**Fund your actual app wallet:**
```bash
# Get your wallet address from the app
# Then run:
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-contracts

node -e "
const targetAddress = 'YOUR_APP_WALLET_ADDRESS_HERE';
console.log('npx hardhat run scripts/fundPAYO.js --network localhost');
console.log('(After editing targetAddress in the script)');
"
```

### Network Error

**Check Hardhat is running:**
```bash
lsof -i :8545
```

**Check app RPC URL:**
- Android: Must be `http://10.0.2.2:8545`
- iOS: Must be `http://localhost:8545`

### Balance Shows 0

**Backend might be caching:**
1. Pull down to refresh in app
2. Check logs for API calls
3. Verify token address in constants matches deployed address

---

## Quick Reference

| Item | Value |
|------|-------|
| Your Wallet | `0xC4c191704f75d92e573b31cbD34E6bd22e147f06` |
| ETH Balance | 2,100 ETH |
| PAYO Balance | 100,000 PAYO |
| PAYO Token | `0x0B306BF915C4d645ff596e518fAf3F9669b97016` |
| Chain ID | 31337 (Hardhat) |
| RPC URL (Android) | `http://10.0.2.2:8545` |
| RPC URL (iOS) | `http://localhost:8545` |

---

## Next Steps

1. ✅ Update app constants with contract addresses
2. ✅ Rebuild app with cache reset
3. ✅ Ensure wallet address matches or fund your app wallet
4. ✅ Generate test QR codes
5. ✅ Start payment testing!

**You're all set!** 🚀

The wallet `0xC4c191704f75d92e573b31cbD34E6bd22e147f06` has both ETH (for gas) and PAYO tokens (for payments), and is ready to test the complete payment flow on Hardhat.
