// Network Debugging Utilities
// Helps diagnose network connectivity issues

import { Platform, Alert } from 'react-native';
import { API } from '../constants';

/**
 * Log API configuration on app start
 */
export const logApiConfiguration = (): void => {
  console.log('\n========================================');
  console.log('🌐 API CONFIGURATION');
  console.log('========================================');
  console.log('Platform:', Platform.OS);
  console.log('Environment:', __DEV__ ? 'Development' : 'Production');
  console.log('');
  console.log('API URLs:');
  console.log('  Auth Service:    ', API.SERVICES.AUTH);
  console.log('  Wallet Service:  ', API.SERVICES.WALLET);
  console.log('  Payment Service: ', API.SERVICES.PAYMENT);
  console.log('  Merchant Service:', API.SERVICES.MERCHANT);
  console.log('  Gateway:         ', API.SERVICES.GATEWAY);
  console.log('');
  console.log('Settings:');
  console.log('  Timeout:         ', API.TIMEOUT, 'ms');
  console.log('  Retry Attempts:  ', API.RETRY_ATTEMPTS);
  console.log('========================================\n');
};

/**
 * Test backend connectivity
 */
export const testBackendConnection = async (): Promise<{
  success: boolean;
  results: Array<{ service: string; url: string; status: string; error?: string }>;
}> => {
  const services = [
    { name: 'Auth', url: `${API.SERVICES.AUTH}/health` },
    { name: 'Wallet', url: `${API.SERVICES.WALLET}/health` },
    { name: 'Payment', url: `${API.SERVICES.PAYMENT}/health` },
  ];

  const results = [];

  for (const service of services) {
    try {
      console.log(`Testing ${service.name} at ${service.url}...`);

      const response = await fetch(service.url, {
        method: 'GET',
        timeout: 5000,
      } as any);

      if (response.ok) {
        const data = await response.json();
        results.push({
          service: service.name,
          url: service.url,
          status: 'Online ✓',
        });
        console.log(`✓ ${service.name}: OK`);
      } else {
        results.push({
          service: service.name,
          url: service.url,
          status: `Error ${response.status}`,
          error: `HTTP ${response.status}`,
        });
        console.log(`✗ ${service.name}: HTTP ${response.status}`);
      }
    } catch (error) {
      results.push({
        service: service.name,
        url: service.url,
        status: 'Offline ✗',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      console.log(`✗ ${service.name}: ${error}`);
    }
  }

  const allOnline = results.every((r) => r.status === 'Online ✓');

  return {
    success: allOnline,
    results,
  };
};

/**
 * Show network diagnostic alert
 */
export const showNetworkDiagnostics = async (): Promise<void> => {
  console.log('Running network diagnostics...');

  const { success, results } = await testBackendConnection();

  let message = `Platform: ${Platform.OS}\n`;
  message += `Environment: ${__DEV__ ? 'Development' : 'Production'}\n\n`;
  message += 'Backend Services:\n';

  results.forEach((result) => {
    message += `\n${result.service}: ${result.status}`;
    if (result.error) {
      message += `\n  Error: ${result.error}`;
    }
  });

  if (!success) {
    message += '\n\n⚠️ Some services are offline!';
    message += '\n\nCheck that:';
    message += '\n1. Backend services are running (pm2 list)';

    if (Platform.OS === 'android') {
      message += '\n2. Using 10.0.2.2 instead of localhost';
    } else {
      message += '\n2. Using localhost (iOS Simulator)';
    }

    message += '\n3. Firewall not blocking connections';
  }

  Alert.alert(
    success ? 'Network Diagnostics - OK' : 'Network Diagnostics - Issues Found',
    message,
    [{ text: 'OK' }]
  );
};

/**
 * Get network troubleshooting tips
 */
export const getNetworkTroubleshootingTips = (): string[] => {
  const tips: string[] = [
    '1. Check backend services are running: pm2 list',
    '2. Test from terminal: curl http://localhost:3001/health',
  ];

  if (Platform.OS === 'android') {
    tips.push('3. Android Emulator: Use 10.0.2.2 instead of localhost');
    tips.push('4. Check AndroidManifest.xml has usesCleartextTraffic="true"');
  } else if (Platform.OS === 'ios') {
    tips.push('3. iOS Simulator: localhost should work');
    tips.push('4. Check Info.plist has NSAllowsLocalNetworking');
  }

  tips.push('5. Check firewall settings');
  tips.push('6. Restart Metro bundler with --reset-cache');

  return tips;
};

/**
 * Log network error details
 */
export const logNetworkError = (error: any, context: string): void => {
  console.error('\n========================================');
  console.error('❌ NETWORK ERROR');
  console.error('========================================');
  console.error('Context:', context);
  console.error('Error:', error);
  console.error('Message:', error?.message);
  console.error('Code:', error?.code);
  console.error('');
  console.error('Current API URLs:');
  console.error('  Auth:   ', API.SERVICES.AUTH);
  console.error('  Wallet: ', API.SERVICES.WALLET);
  console.error('  Payment:', API.SERVICES.PAYMENT);
  console.error('');
  console.error('Troubleshooting:');
  getNetworkTroubleshootingTips().forEach((tip) => console.error('  ' + tip));
  console.error('========================================\n');
};
