import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, fontScale } from '@/lib/responsive';
interface Props {
  name?: string;
}
export default function TransactionAvatar({ name }: Props) {
  const safeName = name?.trim() || 'U';
  const initials = useMemo(() => {
    const parts = safeName.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [safeName]);
  return (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6']}
      style={styles.avatar}
    >
      <Text style={styles.text}>{initials}</Text>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  avatar: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '800',
  },
});