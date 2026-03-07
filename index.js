/**
 * @format
 */

// ⚠️ IMPORTANT: Polyfills must be imported first for Web3 support
import './polyfills';

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
