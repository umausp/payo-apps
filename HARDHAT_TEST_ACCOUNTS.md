# Hardhat Test Accounts for Payment Testing

These are the 20 default accounts provided by Hardhat node. Each account is pre-funded with **10,000 ETH** (test tokens).

## Test Accounts (Addresses)

### Account #0 (Default/Main)
```
0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### Account #1
```
0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

### Account #2
```
0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

### Account #3
```
0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

### Account #4
```
0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
```

### Account #5
```
0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
```

### Account #6
```
0x976EA74026E726554dB657fA54763abd0C3a0aa9
```

### Account #7
```
0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
```

### Account #8
```
0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f
```

### Account #9
```
0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
```

### Account #10
```
0xBcd4042DE499D14e55001CcbB24a551F3b954096
```

### Account #11
```
0x71bE63f3384f5fb98995898A86B02Fb2426c5788
```

### Account #12
```
0xFABB0ac9d68B0B445fB7357272Ff202C5651694a
```

### Account #13
```
0x1CBd3b2770909D4e10f157cABC84C7264073C9Ec
```

### Account #14
```
0xdF3e18d64BC6A983f673Ab319CCaE4f1a57C7097
```

### Account #15
```
0xcd3B766CCDd6AE721141F452C550Ca635964ce71
```

### Account #16
```
0x2546BcD3c84621e976D8185a91A922aE77ECEc30
```

### Account #17
```
0xbDA5747bFD65F08deb54cb465eB87D40e51B197E
```

### Account #18
```
0xdD2FD4581271e230360230F9337D5c0430Bf44C0
```

### Account #19
```
0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199
```

---

## Default Private Keys (DO NOT USE IN PRODUCTION)

These are Hardhat's default test private keys. **NEVER use these on mainnet or with real funds!**

### Account #0
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

### Account #1
```
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

### Account #2
```
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

### Account #3
```
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

### Account #4
```
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
Address: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
```

### Account #5
```
Private Key: 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba
Address: 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
```

### Account #6
```
Private Key: 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e
Address: 0x976EA74026E726554dB657fA54763abd0C3a0aa9
```

### Account #7
```
Private Key: 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356
Address: 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955
```

### Account #8
```
Private Key: 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97
Address: 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f
```

### Account #9
```
Private Key: 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6
Address: 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720
```

---

## Quick Test Setup

### 1. Use These Addresses for QR Codes

Generate test QR codes with any of these recipient addresses:

**Simple Payment QR:**
```json
{
  "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "amount": "10"
}
```

**With Merchant Info:**
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

### 2. Generate QR Code Online

Use: https://www.qr-code-generator.com/

Paste the JSON and scan with the app.

### 3. Check Transaction on Hardhat

After sending a payment, check the transaction:

```bash
# Get transaction receipt
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getTransactionReceipt",
    "params": ["YOUR_TX_HASH_HERE"],
    "id": 1
  }' | jq
```

### 4. Check Account Balance

```bash
# Check balance of recipient
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "eth_getBalance",
    "params": ["0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "latest"],
    "id": 1
  }' | jq
```

---

## Recommended Test Recipients

Use these specific addresses for testing different scenarios:

**Recipient 1 (Small payments):**
```
0x70997970C51812dc3A010C7d01b50e0d17dc79C8
```

**Recipient 2 (Large payments):**
```
0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

**Recipient 3 (Multiple payments):**
```
0x90F79bf6EB2c4f870365E785982E1f101E93b906
```

---

## Update App to Use Hardhat

Edit: `/Users/umashankar.pathak/Documents/Learn_Node/project/payo-apps/src/constants/index.ts`

Change the blockchain RPC URL:

```typescript
export const BLOCKCHAIN = {
  RPC_URL: 'http://10.0.2.2:8545',  // For Android Emulator
  // RPC_URL: 'http://localhost:8545',  // For iOS Simulator
  CHAIN_ID: 31337, // Hardhat default chain ID
  // ... rest of config
};
```

**Important:**
- Android Emulator: Use `http://10.0.2.2:8545` (maps to host's localhost)
- iOS Simulator: Use `http://localhost:8545`
- Physical Device: Use `http://YOUR_COMPUTER_IP:8545`

---

## Verify Hardhat is Running

```bash
# Check if node is running
lsof -i :8545

# Get chain ID
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'

# Get all accounts
curl -X POST http://localhost:8545 \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_accounts","params":[],"id":1}' | jq
```

---

## Important Notes

1. **Hardhat resets on restart** - All transactions are lost when you restart the node
2. **Each account has 10,000 ETH** - Plenty for testing
3. **Instant transactions** - No waiting for block confirmations
4. **No gas costs** - Testing is free
5. **These are TEST keys only** - Never use on mainnet!

---

## Testing Workflow

1. **Start Hardhat node** (if not running):
   ```bash
   cd /Users/umashankar.pathak/Documents/Learn_Node/project/payo-contracts
   npx hardhat node
   ```

2. **Update app RPC URL** to point to Hardhat (see above)

3. **Generate QR code** with any recipient address from this list

4. **Scan and send payment** from the app

5. **Check logs** to see transaction hash

6. **Verify on Hardhat** using curl commands above

---

## Quick Copy-Paste Recipients

For easy testing, here are the first 5 addresses:

```
0x70997970C51812dc3A010C7d01b50e0d17dc79C8
0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
0x90F79bf6EB2c4f870365E785982E1f101E93b906
0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc
```

Pick any address, create a QR code, and test the payment flow!
