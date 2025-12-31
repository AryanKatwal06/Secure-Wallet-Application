import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, fontScale } from '@/lib/responsive';
type Props = {
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
};
export default function TransactionStatusBadge({ status }: Props) {
  return (
    <View
      style={[
        styles.badge,
        status === 'SUCCESS' && styles.success,
        status === 'FAILED' && styles.failed,
        status === 'PENDING' && styles.pending,
      ]}
    >
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: scale(10),
    paddingVertical: scale(4),
    borderRadius: scale(999),
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontScale(11),
    fontWeight: '800',
    color: '#fff',
  },
  success: { backgroundColor: '#10b981' },
  failed: { backgroundColor: '#ef4444' },
  pending: { backgroundColor: '#f59e0b' },
});