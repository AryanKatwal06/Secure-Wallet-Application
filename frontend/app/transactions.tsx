import React, { useMemo, useState } from 'react';
import {
 View,
 Text,
 TouchableOpacity,
 StyleSheet,
 FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useWallet } from '@/context/WalletContext';
import type { Transaction } from '@/types/wallet';
import {
 ArrowUpCircle,
 ArrowDownCircle,
 Send,
 Filter,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { scale, verticalScale, fontScale } from '@/lib/responsive';
type FilterType = 'ALL' | 'ADD_MONEY' | 'WITHDRAW' | 'TRANSFER';
export default function TransactionsScreen() {
 const { transactions, user, isLoadingTransactions } = useWallet();
 const [filter, setFilter] = useState<FilterType>('ALL');
 const filteredTransactions = useMemo(() => {
 const filtered =
 filter === 'ALL'
 ? transactions
 : transactions.filter((t) => t.type === filter);
 return [...filtered].sort(
 (a, b) => b.createdAt - a.createdAt
 );
 }, [transactions, filter]);
 const getTitle = (txn: Transaction) => {
 switch (txn.type) {
 case 'ADD_MONEY':
 return 'Money Added';
 case 'WITHDRAW':
 return 'Withdrawn';
 case 'TRANSFER':
 return txn.senderId === user?.userId ? 'Sent' : 'Received';
 default:
 return 'Transaction';
 }
 };
 const isNegative = (txn: Transaction) =>
 txn.type === 'WITHDRAW' ||
 (txn.type === 'TRANSFER' && txn.senderId === user?.userId);
 const renderTransaction = ({ item }: { item: Transaction }) => {
 const negative = isNegative(item);
 return (
 <View style={styles.transactionItem}>
 <View style={styles.transactionLeft}>
 <View
 style={[
 styles.transactionIcon,
 item.type === 'ADD_MONEY' && styles.iconGreen,
 item.type === 'WITHDRAW' && styles.iconOrange,
 item.type === 'TRANSFER' && styles.iconBlue,
 ]}
 >
 {item.type === 'ADD_MONEY' && (
 <ArrowDownCircle size={scale(22)} color="#10b981" />
 )}
 {item.type === 'WITHDRAW' && (
 <ArrowUpCircle size={scale(22)} color="#f59e0b" />
 )}
 {item.type === 'TRANSFER' && (
 <Send size={scale(22)} color="#3b82f6" />
 )}
 </View>
 <View style={{ flex: 1 }}>
 <Text style={styles.transactionType}>
 {getTitle(item)}
 </Text>
 <Text style={styles.transactionDate}>
 {new Date(item.createdAt).toLocaleString()}
 </Text>
 <Text style={styles.transactionId}>
 {item.transactionId}
 </Text>
 </View>
 </View>
 <Text
 style={[
 styles.transactionAmount,
 negative
 ? styles.amountNegative
 : styles.amountPositive,
 ]}
 >
 {negative ? '-' : '+'}₹{item.amount.toFixed(2)}
 </Text>
 </View>
 );
 };
 const filters: { key: FilterType; label: string }[] = [
 { key: 'ALL', label: 'All' },
 { key: 'ADD_MONEY', label: 'Added' },
 { key: 'WITHDRAW', label: 'Withdrawn' },
 { key: 'TRANSFER', label: 'Transfers' },
 ];
 return (
 <SafeAreaView style={styles.safe}>
 <StatusBar style="light" />
 <LinearGradient colors={['#0f172a', '#1e293b']} style={styles.gradient}>
 <View style={styles.wrapper}>
 <View style={styles.header}>
 <View style={styles.headerTop}>
 <Text style={styles.title}>Transactions</Text>
 <View style={styles.filterIcon}>
 <Filter size={scale(18)} color="#6366f1" />
 </View>
 </View>
 <View style={styles.filterContainer}>
 {filters.map((f) => (
 <TouchableOpacity
 key={f.key}
 style={[
 styles.filterButton,
 filter === f.key && styles.filterButtonActive,
 ]}
 onPress={() => setFilter(f.key)}
 >
 <Text
 style={[
 styles.filterText,
 filter === f.key && styles.filterTextActive,
 ]}
 >
 {f.label}
 </Text>
 </TouchableOpacity>
 ))}
 </View>
 </View>
 {isLoadingTransactions ? (
 <View style={styles.center}>
 <Text style={styles.empty}>Loading...</Text>
 </View>
 ) : filteredTransactions.length === 0 ? (
 <View style={styles.center}>
 <Text style={styles.empty}>No transactions found</Text>
 </View>
 ) : (
 <FlatList
 data={filteredTransactions}
 renderItem={renderTransaction}
 keyExtractor={(item) => item.transactionId}
 contentContainerStyle={styles.listContent}
 showsVerticalScrollIndicator={false}
 />
 )}
 </View>
 </LinearGradient>
 </SafeAreaView>
 );
}
const styles = StyleSheet.create({
 safe: { flex: 1, backgroundColor: '#0f172a' },
 gradient: { flex: 1 },
 wrapper: {
 flex: 1,
 maxWidth: 520,
 width: '100%',
 alignSelf: 'center',
 },
 header: {
 paddingHorizontal: scale(20),
 paddingTop: verticalScale(20),
 paddingBottom: verticalScale(16),
 },
 headerTop: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 marginBottom: verticalScale(16),
 },
 title: {
 fontSize: fontScale(28),
 fontWeight: '800',
 color: '#fff',
 },
 filterIcon: {
 width: scale(40),
 height: scale(40),
 borderRadius: scale(20),
 backgroundColor: 'rgba(99,102,241,0.1)',
 justifyContent: 'center',
 alignItems: 'center',
 },
 filterContainer: {
 flexDirection: 'row',
 flexWrap: 'wrap',
 gap: scale(8),
 },
 filterButton: {
 paddingHorizontal: scale(14),
 paddingVertical: verticalScale(6),
 borderRadius: scale(18),
 backgroundColor: 'rgba(255,255,255,0.05)',
 borderWidth: 1,
 borderColor: 'rgba(255,255,255,0.1)',
 },
 filterButtonActive: {
 backgroundColor: 'rgba(99,102,241,0.2)',
 borderColor: '#6366f1',
 },
 filterText: {
 fontSize: fontScale(13),
 fontWeight: '600',
 color: '#94a3b8',
 },
 filterTextActive: {
 color: '#6366f1',
 },
 listContent: {
 paddingHorizontal: scale(20),
 paddingBottom: verticalScale(24),
 },
 center: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 },
 empty: {
 fontSize: fontScale(16),
 color: '#64748b',
 },
 transactionItem: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 backgroundColor: 'rgba(255,255,255,0.05)',
 padding: scale(16),
 borderRadius: scale(16),
 marginBottom: verticalScale(12),
 borderWidth: 1,
 borderColor: 'rgba(255,255,255,0.1)',
 },
 transactionLeft: {
 flexDirection: 'row',
 alignItems: 'center',
 gap: scale(12),
 flex: 1,
 },
 transactionIcon: {
 width: scale(44),
 height: scale(44),
 borderRadius: scale(22),
 justifyContent: 'center',
 alignItems: 'center',
 },
 iconGreen: { backgroundColor: 'rgba(16,185,129,0.1)' },
 iconOrange: { backgroundColor: 'rgba(245,158,11,0.1)' },
 iconBlue: { backgroundColor: 'rgba(59,130,246,0.1)' },
 transactionType: {
 fontSize: fontScale(15),
 fontWeight: '700',
 color: '#fff',
 },
 transactionDate: {
 fontSize: fontScale(12),
 color: '#64748b',
 },
 transactionId: {
 fontSize: fontScale(10),
 color: '#475569',
 },
 transactionAmount: {
 fontSize: fontScale(16),
 fontWeight: '800',
 },
 amountPositive: { color: '#10b981' },
 amountNegative: { color: '#ef4444' },
});