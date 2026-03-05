# Debug: "Insufficient Balance" Error - SOLVED

## The Problem

The app was showing "Insufficient balance" error even though the wallet was funded because:

### Root Cause
**The app was pointing to Polygon mainnet instead of Hardhat localhost!**

```typescript
// OLD (WRONG):
RPC_URL: 'https://polygon-rpc.com'  // Polygon mainnet
CHAIN_ID: 137                        // Polygon mainnet
TOKEN_ADDRESS: '0x...'               // Placeholder

// This was trying to check balance on Polygon mainnet where:
// 1. Your wallet has 0 PAYO tokens
// 2. The token address is invalid
// 3. No connection to your local funded wallet
```

### What Was Fixed

Updated: `/Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps/src/constants/index.ts`

```typescript
// NEW (CORRECT):
RPC_URL: Platform.OS === 'android' ? 'http://10.0.2.2:8545' : 'http://localhost:8545'
CHAIN_ID: 31337                                                    // Hardhat
TOKEN_ADDRESS: '0x0B306BF915C4d645ff596e518fAf3F9669b97016'      // Deployed PAYO token
```

Now the app will:
1. ✅ Connect to Hardhat localhost
2. ✅ Query the correct PAYO token contract
3. ✅ See your 100,000 PAYO balance
4. ✅ Allow payments to go through

---

## Rebuild and Test

### Step 1: Rebuild the App

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps

# Stop Metro (Ctrl+C)
npm start -- --reset-cache

# In another terminal, rebuild
npm run android
```

**Important:** Cache reset is required because blockchain configuration is cached!

### Step 2: Verify Wallet Address

1. Open app → Settings
2. Check your wallet address
3. It should be: `0xC4c191704f75d92e573b31cbD34E6bd22e147f06`

**If it's different:** You need to fund YOUR wallet address instead. See below.

### Step 3: Check Balance in App

1. Go to Dashboard
2. Pull down to refresh
3. You should now see: **100,000 PAYO**

**If you still see 0:**
- Check logcat for API calls
- Look for blockchain RPC calls
- See troubleshooting below

### Step 4: Try Payment Again

1. Generate QR code with recipient address
2. Scan → Preview → Confirm Payment
3. Watch logs: `adb logcat | grep -E "\[API|Payment|Blockchain"`

**You should now see:**
```
[Blockchain] Getting balance for 0xC4c191704f75d92e573b31cbD34E6bd22e147f06
[Blockchain] Balance: 100000.0 PAYO
[Blockchain] Estimating gas...
[Blockchain] Signing transaction...
[Blockchain] Sending transaction...
[API Request] POST http://10.0.2.2:3004/api/v1/payment/submit
[API Response] 200 http://10.0.2.2:3004/api/v1/payment/submit
```

---

## If Your App Wallet is Different

### Find Your Wallet Address

```bash
# Open app → Settings → Note your wallet address
# Example: 0xYOUR_ACTUAL_ADDRESS
```

### Check Your Wallet Balance

```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-contracts

npx hardhat run scripts/checkBalance.js --network localhost 0xYOUR_ACTUAL_ADDRESS
```

### Fund Your Actual Wallet

**Option 1: Edit the script**
```bash
# Edit scripts/fundPAYO.js
# Change line 8:
const targetAddress = "0xYOUR_ACTUAL_ADDRESS";

# Then run:
npx hardhat run scripts/fundPAYO.js --network localhost
```

**Option 2: Quick command**
```bash
# Create a one-time script
cat > /tmp/fundMyWallet.js << 'EOF'
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const targetAddress = process.argv[2];
  const payoAmount = hre.ethers.parseEther("100000");

  const addressesPath = path.join(__dirname, "../deployments/localhost/addresses.json");
  const addresses = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
  const tokenAddress = addresses.contracts.PAYOToken;

  const [signer] = await hre.ethers.getSigners();
  const PAYOToken = await hre.ethers.getContractFactory("PAYOToken");
  const token = PAYOToken.attach(tokenAddress);

  console.log(`Funding ${targetAddress} with ${hre.ethers.formatEther(payoAmount)} PAYO...`);

  const tx = await token.transfer(targetAddress, payoAmount);
  await tx.wait();

  const balance = await token.balanceOf(targetAddress);
  console.log(`✅ New balance: ${hre.ethers.formatEther(balance)} PAYO`);
}

main().catch(console.error);
EOF

# Run it
npx hardhat run /tmp/fundMyWallet.js --network localhost YOUR_WALLET_ADDRESS
```

---

## Troubleshooting

### Still Shows 0 Balance After Rebuild

**Check 1: Is Hardhat running?**
```bash
lsof -i :8545
```

If not running:
```bash
cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-contracts
npx hardhat node
```

**Check 2: Check balance directly**
```bash
curl -X POST http://localhost:8545 -H "Content-Type: application/json" -d '{
  "jsonrpc":"2.0",
  "method":"eth_call",
  "params":[{
    "to":"0x0B306BF915C4d645ff596e518fAf3F9669b97016",
    "data":"0x70a08231000000000000000000000000C4c191704f75d92e573b31cbD34E6bd22e147f06"
  },"latest"],
  "id":1
}' | jq
```

This calls `balanceOf(0xC4c191704f75d92e573b31cbD34E6bd22e147f06)` on the PAYO token.

**Check 3: Verify app is using correct network**

Watch logcat when you refresh dashboard:
```bash
adb logcat -c
adb logcat | grep -i "rpc\|blockchain\|balance"
```

You should see calls to `http://10.0.2.2:8545` (not `polygon-rpc.com`)

**Check 4: Backend wallet service**

The backend might be overriding the balance. Check if backend wallet service is running:
```bash
curl http://localhost:3002/api/v1/wallet/balance/0xC4c191704f75d92e573b31cbD34E6bd22e147f06?token=payo
```

If backend returns 0, it might be pointing to wrong network too.

---

## Payment Flow After Fix

Here's what should happen now:

### 1. Balance Check (Before Payment)
```
App → BlockchainService.getBalance()
    → Queries: 0x0B306BF915C4d645ff596e518fAf3F9669b97016 (PAYO Token)
    → On network: http://10.0.2.2:8545 (Hardhat)
    → Returns: 100000.0 PAYO ✅
```

### 2. Gas Estimation
```
App → BlockchainService.estimateGas()
    → Estimates gas for PAYO transfer
    → Returns: ~0.0001 ETH ✅
```

### 3. Sufficient Balance Check
```
SendPaymentUseCase.execute()
    → wallet.balance = 100000.0 PAYO
    → amount = 10 PAYO
    → gasFee = 0.0001 PAYO (converted)
    → totalRequired = 10.0001 PAYO
    → 100000 >= 10.0001 → TRUE ✅
```

### 4. Send Transaction
```
BlockchainService.sendTransaction()
    → Signs transaction with private key
    → Sends to RPC: http://10.0.2.2:8545
    → Returns transaction hash ✅
```

### 5. Submit to Backend
```
API: POST /api/v1/payment/submit
    → Submits transaction details
    → Backend records transaction
    → Returns 200 ✅
```

---

## Watch Logs for Success

### Terminal 1: App Logs
```bash
adb logcat | grep -E "\[API|Payment|Blockchain"
```

### Terminal 2: Backend Logs
```bash
# In payo-backend directory
npm run start:payment
```

### Expected Success Logs:
```
[Blockchain] Checking balance for 0xC4c191704f75d92e573b31cbD34E6bd22e147f06
[Blockchain] Balance: 100000.0 PAYO
[Payment] Validating payment: 10 PAYO to 0x7099...79C8
[Blockchain] Sufficient balance: true
[Blockchain] Estimating gas...
[Blockchain] Gas estimate: 0.0001 ETH
[Blockchain] Signing transaction...
[Blockchain] Transaction signed: 0xabc123...
[Blockchain] Sending to network: http://10.0.2.2:8545
[Blockchain] Transaction sent: 0xabc123...def456
[API Request] POST http://10.0.2.2:3004/api/v1/payment/submit
[API Request Body] { forwardRequest: {...}, signature: "0x...", idempotencyKey: "..." }
[API Response] 200 http://10.0.2.2:3004/api/v1/payment/submit
[API Response Data] { transactionId: "...", txHash: "0xabc123...def456", status: "submitted" }
[Navigation] PaymentPreview → PaymentProcessing
```

---

## Quick Verification Checklist

After rebuilding, verify each step:

- [ ] Hardhat node is running on port 8545
- [ ] App constants point to Hardhat (`http://10.0.2.2:8545`)
- [ ] Token address is correct (`0x0B306BF915C4d645ff596e518fAf3F9669b97016`)
- [ ] App rebuilt with cache cleared
- [ ] Dashboard shows 100,000 PAYO balance
- [ ] Payment preview shows gas estimate
- [ ] Payment confirm doesn't throw "insufficient balance"
- [ ] Transaction hash appears in logs
- [ ] Payment submit API (3004) is called
- [ ] Payment success screen shows

---

## Summary

**What was wrong:**
- App was configured for Polygon mainnet (production)
- Your funded wallet is on Hardhat (localhost)
- Balance check was querying wrong network → returned 0

**What was fixed:**
- Updated RPC_URL to point to Hardhat localhost
- Updated CHAIN_ID to 31337 (Hardhat)
- Updated TOKEN_ADDRESS to deployed contract

**What to do:**
1. Rebuild app with cache reset
2. Verify balance shows 100,000 PAYO
3. Try payment again
4. Check logs for success

**The payment should now work!** 🚀
