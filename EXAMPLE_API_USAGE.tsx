// Example API Usage - Reference Implementation
// This file shows how to integrate ApiService into React Native screens

import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, Alert } from 'react-native';
import ApiService from './src/infrastructure/api/ApiService';
import { ethers } from 'ethers';

// ============================================================================
// Example 1: Authentication Flow
// ============================================================================

export const AuthenticationExample = ({ wallet }: { wallet: ethers.Wallet }) => {
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      // Step 1: Get challenge message from backend
      const challengeResponse = await ApiService.getChallenge(wallet.address);

      if (!challengeResponse.success) {
        Alert.alert('Error', challengeResponse.error?.message || 'Failed to get challenge');
        return;
      }

      const { message, nonce } = challengeResponse.data!;
      console.log('Challenge received:', { message, nonce });

      // Step 2: Sign the challenge message
      const signature = await wallet.signMessage(message);
      console.log('Message signed:', signature);

      // Step 3: Verify signature and get JWT tokens
      const verifyResponse = await ApiService.verifySignature(
        wallet.address,
        signature,
        message
      );

      if (!verifyResponse.success) {
        Alert.alert('Error', verifyResponse.error?.message || 'Authentication failed');
        return;
      }

      const { accessToken, refreshToken, user } = verifyResponse.data!;
      console.log('Authenticated:', { userId: user.userId, accessToken });

      // Tokens are automatically stored by ApiService
      setAuthenticated(true);
      Alert.alert('Success', 'Logged in successfully!');

    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await ApiService.logout();
      setAuthenticated(false);
      Alert.alert('Success', 'Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : authenticated ? (
        <Button title="Logout" onPress={handleLogout} />
      ) : (
        <Button title="Login with Wallet" onPress={handleLogin} />
      )}
    </View>
  );
};

// ============================================================================
// Example 2: Balance Display
// ============================================================================

export const BalanceExample = ({ walletAddress }: { walletAddress: string }) => {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    try {
      setLoading(true);

      const response = await ApiService.getBalance(walletAddress, 'payo');

      if (!response.success) {
        Alert.alert('Error', response.error?.message || 'Failed to fetch balance');
        return;
      }

      const { balanceWei, decimals, symbol } = response.data!;

      // Convert wei to human-readable format
      const balanceInTokens = ethers.formatUnits(balanceWei, decimals);
      setBalance(`${balanceInTokens} ${symbol}`);

    } catch (error) {
      console.error('Balance fetch error:', error);
      Alert.alert('Error', 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();

    // Refresh balance every 30 seconds
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [walletAddress]);

  return (
    <View>
      <Text>Balance: {loading ? 'Loading...' : balance}</Text>
      <Button title="Refresh" onPress={fetchBalance} disabled={loading} />
    </View>
  );
};

// ============================================================================
// Example 3: Payment Submission (Meta-Transaction)
// ============================================================================

export const PaymentExample = ({
  wallet,
  recipientAddress,
  amount,
}: {
  wallet: ethers.Wallet;
  recipientAddress: string;
  amount: string;
}) => {
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<string>('');

  const submitPayment = async () => {
    try {
      setLoading(true);
      setTxStatus('Preparing transaction...');

      // Contract addresses (should be from config/constants)
      const PAYMENT_PROCESSOR_ADDRESS = '0x...'; // From backend config
      const FORWARDER_ADDRESS = '0x...'; // From backend config

      // Step 1: Get current gas price
      const gasResponse = await ApiService.getGasPrice();
      if (!gasResponse.success) {
        throw new Error('Failed to get gas price');
      }
      const { gasPriceWei } = gasResponse.data!;

      // Step 2: Get nonce from forwarder contract
      const forwarderABI = ['function getNonce(address from) view returns (uint256)'];
      const forwarder = new ethers.Contract(FORWARDER_ADDRESS, forwarderABI, wallet);
      const nonce = await forwarder.getNonce(wallet.address);

      // Step 3: Encode function call (processPayment)
      const paymentProcessorABI = [
        'function processPayment(address token, address recipient, uint256 amount)',
      ];
      const iface = new ethers.Interface(paymentProcessorABI);
      const encodedData = iface.encodeFunctionData('processPayment', [
        '0x...', // USDC token address
        recipientAddress,
        ethers.parseUnits(amount, 6), // USDC has 6 decimals
      ]);

      // Step 4: Build ForwardRequest
      const forwardRequest = {
        from: wallet.address,
        to: PAYMENT_PROCESSOR_ADDRESS,
        value: '0',
        gas: '200000',
        nonce: nonce.toString(),
        data: encodedData,
      };

      setTxStatus('Signing transaction...');

      // Step 5: Sign ForwardRequest (EIP-712)
      const domain = {
        name: 'Forwarder',
        version: '1',
        chainId: 137, // Polygon
        verifyingContract: FORWARDER_ADDRESS,
      };

      const types = {
        ForwardRequest: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'value', type: 'uint256' },
          { name: 'gas', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'data', type: 'bytes' },
        ],
      };

      const signature = await wallet.signTypedData(domain, types, forwardRequest);

      setTxStatus('Submitting to backend...');

      // Step 6: Submit to backend
      const idempotencyKey = `payment-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      const response = await ApiService.submitPayment(
        forwardRequest,
        signature,
        idempotencyKey
      );

      if (!response.success) {
        throw new Error(response.error?.message || 'Payment submission failed');
      }

      const { transactionId, status, txHash } = response.data!;
      console.log('Payment submitted:', { transactionId, status, txHash });

      setTxStatus(`Status: ${status}`);

      // Step 7: Poll for status updates
      await pollPaymentStatus(idempotencyKey);

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Payment failed');
      setTxStatus('Failed');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (idempotencyKey: string) => {
    const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max
    let attempts = 0;

    const poll = async (): Promise<void> => {
      attempts++;

      const response = await ApiService.getPaymentStatus(idempotencyKey);

      if (!response.success) {
        setTxStatus('Error checking status');
        return;
      }

      const { status, txHash, confirmedAt } = response.data!;
      setTxStatus(`Status: ${status}${txHash ? ` (${txHash.substring(0, 10)}...)` : ''}`);

      if (status === 'confirmed') {
        Alert.alert('Success', `Payment confirmed!\nTxHash: ${txHash}`);
        return;
      }

      if (status === 'failed') {
        Alert.alert('Failed', 'Payment failed. Please try again.');
        return;
      }

      if (attempts < maxAttempts && (status === 'submitted' || status === 'pending')) {
        // Continue polling
        setTimeout(() => poll(), 2000);
      } else if (attempts >= maxAttempts) {
        setTxStatus('Status check timeout');
      }
    };

    await poll();
  };

  return (
    <View>
      <Text>Recipient: {recipientAddress}</Text>
      <Text>Amount: {amount} USDC</Text>
      <Text>Status: {txStatus}</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Send Payment" onPress={submitPayment} />
      )}
    </View>
  );
};

// ============================================================================
// Example 4: Transaction History
// ============================================================================

export const TransactionHistoryExample = ({ walletAddress }: { walletAddress: string }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactions = async (pageNum: number) => {
    try {
      setLoading(true);

      const response = await ApiService.getTransactions({
        walletAddress,
        limit: 20,
        offset: (pageNum - 1) * 20,
      });

      if (!response.success) {
        Alert.alert('Error', response.error?.message || 'Failed to fetch transactions');
        return;
      }

      const { transactions: txs, total } = response.data!;

      if (pageNum === 1) {
        setTransactions(txs);
      } else {
        setTransactions(prev => [...prev, ...txs]);
      }

      setHasMore(transactions.length + txs.length < total);

    } catch (error) {
      console.error('Transaction fetch error:', error);
      Alert.alert('Error', 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, [walletAddress]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchTransactions(nextPage);
    }
  };

  return (
    <View>
      {transactions.map((tx) => (
        <View key={tx._id}>
          <Text>To: {tx.to}</Text>
          <Text>Amount: {tx.amount}</Text>
          <Text>Status: {tx.status}</Text>
          <Text>Date: {new Date(tx.createdAt).toLocaleString()}</Text>
        </View>
      ))}
      {loading && <ActivityIndicator />}
      {hasMore && !loading && (
        <Button title="Load More" onPress={loadMore} />
      )}
    </View>
  );
};

// ============================================================================
// Example 5: Merchant QR Code Generation
// ============================================================================

export const MerchantQRExample = () => {
  const [qrData, setQrData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateDynamicQR = async () => {
    try {
      setLoading(true);

      const response = await ApiService.generateDynamicQR({
        amount: '10000000', // 10 USDC (6 decimals)
        currency: 'USDC',
        invoiceId: `INV-${Date.now()}`,
        expiresIn: 15, // 15 minutes
      });

      if (!response.success) {
        Alert.alert('Error', response.error?.message || 'Failed to generate QR');
        return;
      }

      const { qrCode } = response.data!;
      setQrData(qrCode.qrData);

      Alert.alert(
        'Success',
        `QR Code generated!\nExpires: ${new Date(qrCode.expiryTime!).toLocaleString()}`
      );

    } catch (error) {
      console.error('QR generation error:', error);
      Alert.alert('Error', 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      {qrData && <Text>QR Data: {qrData}</Text>}
      {/* In real app, use react-native-qrcode-svg to display QR */}
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Button title="Generate Payment QR" onPress={generateDynamicQR} />
      )}
    </View>
  );
};

// ============================================================================
// Example 6: Error Handling Pattern
// ============================================================================

export const ErrorHandlingExample = () => {
  const [status, setStatus] = useState<string>('');

  const handleAPICall = async () => {
    const response = await ApiService.getBalance('0x...', 'payo');

    if (response.success) {
      // Success - use response.data
      const { balanceWei, decimals, symbol } = response.data!;
      setStatus(`Balance: ${balanceWei}`);
    } else {
      // Error - handle response.error
      const { code, message, details } = response.error!;

      switch (code) {
        case 'INVALID_ADDRESS':
          Alert.alert('Invalid Address', 'Please enter a valid Ethereum address');
          break;
        case 'NETWORK_ERROR':
          Alert.alert('Network Error', 'Please check your internet connection');
          break;
        case 'UNAUTHORIZED':
          Alert.alert('Authentication Required', 'Please login again');
          // Navigate to login screen
          break;
        case 'RPC_ERROR':
          Alert.alert('Blockchain Error', message);
          break;
        default:
          Alert.alert('Error', message || 'Something went wrong');
      }

      setStatus(`Error: ${code}`);
    }
  };

  return (
    <View>
      <Text>{status}</Text>
      <Button title="Make API Call" onPress={handleAPICall} />
    </View>
  );
};

// ============================================================================
// Notes:
// ============================================================================

/*
1. Always check response.success before accessing response.data
2. Handle errors gracefully with user-friendly messages
3. Show loading states during API calls
4. Use proper TypeScript types from src/infrastructure/api/types.ts
5. Store JWT tokens securely (handled automatically by ApiService)
6. Poll for transaction status updates (2-3 second intervals)
7. Add retry logic for failed requests
8. Implement offline mode with cached data
9. Use idempotency keys for payment submissions
10. Test with backend services running locally first
*/
