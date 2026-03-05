import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackButton from '../../components/BackButton';
import FileLogger from '../../../infrastructure/logging/FileLogger';
import { colors, spacing, typography, borderRadius } from '../../theme/tokens';

const LogViewerScreen: React.FC = () => {
  const [logs, setLogs] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [fileSize, setFileSize] = useState<string>('0 KB');
  const [logFilePath, setLogFilePath] = useState<string>('');

  useEffect(() => {
    loadLogs();
    loadFileInfo();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const content = await FileLogger.readLogs();
      setLogs(content);
    } catch (error) {
      console.error('Failed to load logs:', error);
      Alert.alert('Error', 'Failed to load logs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFileInfo = async () => {
    try {
      const size = await FileLogger.getLogFileSize();
      const path = FileLogger.getLogFilePath();
      setFileSize(size);
      setLogFilePath(path);
    } catch (error) {
      console.error('Failed to load file info:', error);
    }
  };

  const handleRefresh = () => {
    loadLogs();
    loadFileInfo();
  };

  const handleClear = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to clear all logs? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await FileLogger.clearLogs();
              await loadLogs();
              await loadFileInfo();
              Alert.alert('Success', 'Logs cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear logs');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    try {
      const filePath = await FileLogger.shareLogFile();
      await Share.share({
        title: 'PAYO API Logs',
        message: `Log file location: ${filePath}\n\nFile size: ${fileSize}`,
        url: `file://${filePath}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share logs');
    }
  };

  const handleCopyPath = () => {
    Alert.alert(
      'Log File Path',
      logFilePath,
      [
        { text: 'OK' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />

      <View style={styles.header}>
        <Text style={styles.title}>API Logs</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>File Size: {fileSize}</Text>
          <TouchableOpacity onPress={handleCopyPath}>
            <Text style={styles.pathText}>📁 View Path</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleRefresh}>
          <Text style={styles.actionText}>🔄 Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Text style={styles.actionText}>📤 Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleClear}>
          <Text style={[styles.actionText, styles.dangerText]}>🗑️ Clear</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Loading logs...</Text>
        </View>
      ) : (
        <ScrollView style={styles.logContainer}>
          <Text style={styles.logText}>{logs}</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: spacing[6],
    paddingTop: spacing[2],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    marginBottom: spacing[2],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  pathText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary[500],
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[4],
    gap: spacing[2],
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[4],
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.text.primary,
  },
  dangerButton: {
    borderColor: colors.error[500],
  },
  dangerText: {
    color: colors.error[500],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  logContainer: {
    flex: 1,
    backgroundColor: colors.neutral[900],
    marginHorizontal: spacing[6],
    marginBottom: spacing[6],
    borderRadius: borderRadius.md,
    padding: spacing[4],
  },
  logText: {
    fontSize: typography.fontSize.xs,
    fontFamily: 'Courier',
    color: colors.neutral[100],
    lineHeight: 18,
  },
});

export default LogViewerScreen;
