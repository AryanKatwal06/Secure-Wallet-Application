import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useWallet } from '@/context/WalletContext';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { scale, verticalScale, fontScale } from '@/lib/responsive';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import TransactionAvatar from '@/components/TransactionAvatar';
export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { transactions, user } = useWallet();
  const transaction = useMemo(
    () => transactions.find((t) => t.transactionId === id),
    [transactions, id]
  );
  if (!transaction) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Transaction not found</Text>
      </SafeAreaView>
    );
  }
  const isSent =
    transaction.type === 'TRANSFER' &&
    transaction.senderId === user?.userId;
  const isNegative =
    transaction.type === 'WITHDRAW' || isSent;
  const title =
    transaction.type === 'TRANSFER'
      ? isSent
        ? 'Money Sent'
        : 'Money Received'
      : transaction.type === 'ADD_MONEY'
      ? 'Money Added'
      : 'Withdrawn';
  const copyTransactionId = async () => {
    await Clipboard.setStringAsync(transaction.transactionId);
    Alert.alert('Copied', 'Transaction ID copied');
  };
  const shareReceipt = async () => {
    try {
      const content =
        `SECURE WALLET RECEIPT\n\n` +
        `Transaction ID: ${transaction.transactionId}\n` +
        `Type: ${transaction.type}\n` +
        `Amount: ₹${transaction.amount}\n` +
        `Status: ${transaction.status}\n` +
        `Date: ${new Date(transaction.createdAt).toLocaleString()}\n`;
      const baseDir =
        FileSystem.cacheDirectory ??
        FileSystem.documentDirectory;
      if (!baseDir) throw new Error('No directory');
      const fileUri =
        `${baseDir}receipt_${transaction.transactionId}.txt`;
      await FileSystem.writeAsStringAsync(fileUri, content);
      await Sharing.shareAsync(fileUri);
    } catch {
      Alert.alert('Error', 'Unable to share receipt');
    }
  };
  const fromName =
    transaction.senderUsername || transaction.senderId;
  const toName =
    transaction.receiverUsername || transaction.receiverId || '-';
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={styles.container}
      >
        <View style={styles.card}>
          <View style={styles.avatarContainer}>
            <TransactionAvatar
              name={isSent ? toName : fromName}
              size={scale(72)}
              fontSize={fontScale(32)}
            />
          </View>
          <Text
            style={[
              styles.amount,
              isNegative ? styles.negative : styles.positive,
            ]}
          >
            {isNegative ? '-' : '+'}₹{transaction.amount.toFixed(2)}
          </Text>
          <Text style={styles.title}>{title}</Text>
          <StatusBadge status={transaction.status} />
          <View style={styles.divider} />
          <DetailRow label="Date" value={new Date(transaction.createdAt).toLocaleString()} />
          <DetailRow label="Transaction ID" value={transaction.transactionId} />
          {transaction.type === 'TRANSFER' && (
            <>
              <DetailRow
                label="From"
                value={isSent ? `@${user?.username}` : `@${fromName}`}
              />
              <DetailRow
                label="To"
                value={isSent ? `@${toName}` : `@${user?.username}`}
              />
            </>
          )}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={copyTransactionId}
            >
              <Text style={styles.actionText}>📎 Copy Transaction ID</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={shareReceipt}
            >
              <Text style={styles.actionText}>📤 Share Receipt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
function StatusBadge({ status }: { status: string }) {
  const color =
    status === 'SUCCESS'
      ? '#10b981'
      : status === 'FAILED'
      ? '#ef4444'
      : '#f59e0b';
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.badgeText, { color }]}>
        {status}
      </Text>
    </View>
  );
}
function DetailRow({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f172a' },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: scale(20),
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: scale(20),
    padding: scale(24),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: verticalScale(12),
  },
  amount: {
    fontSize: fontScale(36),
    fontWeight: '900',
    textAlign: 'center',
  },
  positive: { color: '#10b981' },
  negative: { color: '#ef4444' },
  title: {
    fontSize: fontScale(18),
    color: '#e5e7eb',
    textAlign: 'center',
    marginTop: verticalScale(6),
  },
  badge: {
    alignSelf: 'center',
    marginTop: verticalScale(10),
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(4),
    borderRadius: scale(20),
    borderWidth: 1,
  },
  badgeText: {
    fontSize: fontScale(12),
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: verticalScale(16),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  label: {
    fontSize: fontScale(13),
    color: '#94a3b8',
  },
  value: {
    fontSize: fontScale(14),
    color: '#fff',
    fontWeight: '600',
    maxWidth: '65%',
    textAlign: 'right',
  },
  actions: {
    marginTop: verticalScale(24),
    gap: verticalScale(12),
  },
  actionButton: {
    backgroundColor: 'rgba(99,102,241,0.15)',
    paddingVertical: verticalScale(14),
    borderRadius: scale(14),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  actionText: {
    color: '#6366f1',
    fontSize: fontScale(16),
    fontWeight: '800',
  },
  error: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 40,
  },
});