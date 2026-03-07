/**
 * Web3Provider Component
 * Wraps app with Reown AppKit provider
 */

import React from 'react';
import { AppKitProvider, AppKit } from '@reown/appkit-react-native';
import { appKit } from './Web3Config';

interface Web3ProviderProps {
  children: React.ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <AppKitProvider instance={appKit}>
      {children}
      <AppKit />
    </AppKitProvider>
  );
};

export default Web3Provider;
