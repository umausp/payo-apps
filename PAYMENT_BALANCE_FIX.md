# Payment Balance Fix - March 6, 2026

## Problem

Mobile app was showing **"Insufficient balance for this transaction"** error even though the wallet had:
- ✅ 1000 PAYO tokens
- ✅ 0.052 ETH (for gas)

## Root Cause

**Location:** `src/domain/entities/Wallet.entity.ts` (line 25-27)

```typescript
// WRONG CODE:
hasSufficientBalance(amount: string, gasFee: string): boolean {
  const totalRequired = parseFloat(amount) + parseFloat(gasFee);
  return parseFloat(this.balance) >= totalRequired;
}
```

**The Problem:**
- `this.balance` = PAYO tokens (e.g., 1000 PAYO)
- `amount` = payment amount in PAYO (e.g., 10 PAYO)
- `gasFee` = gas fee in **ETH** (e.g., 0.001 ETH)
- **Adding PAYO + ETH together!** Like adding $100 + 5 Euros

The logic was checking if:
```
1000 PAYO >= (10 PAYO + 0.001 ETH)  // Makes no sense!
```

## Solution

### Changes Made

#### 1. **Wallet Entity** (`src/domain/entities/Wallet.entity.ts`)
- Added `nativeBalance` property to store ETH balance separately
- Fixed `hasSufficientBalance()` to check both balances separately:

```typescript
// NEW CODE:
hasSufficientBalance(amount: string, gasFee: string): boolean {
  // Check PAYO token balance
  const hasEnoughTokens = parseFloat(this.balance) >= parseFloat(amount);

  // Check ETH balance for gas
  const hasEnoughGas = parseFloat(this.nativeBalance) >= parseFloat(gasFee);

  return hasEnoughTokens && hasEnoughGas;
}
```

#### 2. **Wallet Repository** (`src/data/repositories/WalletRepository.ts`)
- Added `getNativeBalance()` method to fetch ETH balance
- Updated `getWallet()` to load native balance from storage
- Updated `createWallet()` and `importWallet()` to initialize native balance

#### 3. **Get Balance Use Case** (`src/domain/useCases/GetWalletBalanceUseCase.ts`)
- Now fetches **both** PAYO and ETH balances:

```typescript
// Fetch PAYO token balance
const balance = await this.walletRepository.getBalance(wallet.address);

// Fetch native ETH balance for gas
const nativeBalance = await this.walletRepository.getNativeBalance(wallet.address);

// Update wallet with both balances
wallet.updateBalance(balance, fiatBalance, nativeBalance);
```

#### 4. **Repository Interface** (`src/domain/repositories/IWalletRepository.ts`)
- Added `getNativeBalance(address: string): Promise<string>` method

## How It Works Now

### Before Payment:
1. ✅ Check PAYO balance >= payment amount
2. ✅ Check ETH balance >= gas fee
3. ✅ Both must be sufficient

### Example:
```
Payment: 10 PAYO
Gas Fee: 0.001 ETH

Check 1: 1000 PAYO >= 10 PAYO ✅
Check 2: 0.052 ETH >= 0.001 ETH ✅

Result: Payment allowed!
```

## Files Modified

1. `src/domain/entities/Wallet.entity.ts`
2. `src/data/repositories/WalletRepository.ts`
3. `src/domain/useCases/GetWalletBalanceUseCase.ts`
4. `src/domain/repositories/IWalletRepository.ts`

## Testing

After rebuilding the app:
1. Open app on Android emulator
2. Navigate to payment screen
3. Try sending PAYO tokens
4. Should now work correctly if you have both:
   - PAYO tokens for payment amount
   - ETH for gas fees

## Notes

- PAYO balance: For actual payment amount
- ETH balance: For blockchain gas fees
- Both are required for PAYO token transfers
- Native ETH transfers would only need ETH balance

## Current Wallet Status

**Address:** `0x674e2b5AFc697632AB86ca5F07F52b52ca23D4b0`
- PAYO: 1000 PAYO ✅
- ETH: 0.052 ETH ✅
- Ready for payments!
