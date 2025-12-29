import React, { useEffect, useRef, useState } from 'react';
import {
 View,
 Text,
 TouchableOpacity,
 StyleSheet,
 ScrollView,
 Animated,
 RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWallet } from '@/context/WalletContext';
import {
 ArrowDownCircle,
 ArrowUpCircle,
 Send,
 History,
 LogOut,
 CreditCard,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { scale, verticalScale, fontScale } from '@/lib/responsive';
export default function DashboardScreen() {
 const router = useRouter();
 const { user, bankBalance, refreshBalance, logout } = useWallet();
 const balanceAnim = useRef(new Animated.Value(0)).current;
 const [displayBalance, setDisplayBalance] = useState(0);
 const [refreshing, setRefreshing] = useState(false);
 const walletBalance = user?.walletBalance ?? 0;
 useEffect(() => {
 balanceAnim.setValue(0);
 Animated.timing(balanceAnim, {
 toValue: walletBalance,
 duration: 900,
 useNativeDriver: false,
 }).start();
 const listener = balanceAnim.addListener(({ value }) =>
 setDisplayBalance(value)
 );
 return () => balanceAnim.removeListener(listener);
 }, [walletBalance]);
 const onRefresh = async () => {
 setRefreshing(true);
 await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
 refreshBalance();
 setTimeout(() => setRefreshing(false), 800);
 };
 const handleLogout = async () => {
 await Haptics.notificationAsync(
 Haptics.NotificationFeedbackType.Warning
 );
 await logout();
 router.replace('/auth/login');
 };
 return (
 <SafeAreaView style={styles.safe}>
 <StatusBar style="light" />
 <LinearGradient colors={['#0f172a', '#020617']} style={styles.container}>
 <ScrollView
 contentContainerStyle={styles.content}
 refreshControl={
 <RefreshControl
 refreshing={refreshing}
 onRefresh={onRefresh}
 tintColor="#6366f1"
 />
 }
 showsVerticalScrollIndicator={false}
 >
 <View style={styles.header}>
 <View>
 <Text style={styles.greeting}>Welcome back</Text>
 <Text style={styles.username}>{user?.username}</Text>
 </View>
 <TouchableOpacity style={styles.logout} onPress={handleLogout}>
 <LogOut size={scale(20)} color="#ef4444" />
 </TouchableOpacity>
 </View>
 <View style={styles.glassCard}>
 <LinearGradient
 colors={['#6366f1', '#8b5cf6', '#a855f7']}
 style={styles.balanceGradient}
 >
 <View style={styles.balanceTop}>
 <Text style={styles.balanceLabel}>Wallet Balance</Text>
 <CreditCard
 size={scale(22)}
 color="rgba(255,255,255,0.9)"
 />
 </View>
 <Text style={styles.balanceAmount}>
 ₹{displayBalance.toFixed(2)}
 </Text>
 <Text style={styles.bankBalance}>
 Bank: ₹{bankBalance.toFixed(2)}
 </Text>
 </LinearGradient>
 </View>
 <View style={styles.grid}>
 <ActionCard
 label="Add Money"
 icon={<ArrowDownCircle size={scale(28)} color="#10b981" />}
 onPress={() => router.push('/add-money')}
 colors={['#10b981', '#059669']}
 />
 <ActionCard
 label="Withdraw"
 icon={<ArrowUpCircle size={scale(28)} color="#f59e0b" />}
 onPress={() => router.push('/withdraw')}
 colors={['#f59e0b', '#d97706']}
 />
 <ActionCard
 label="Send"
 icon={<Send size={scale(28)} color="#3b82f6" />}
 onPress={() => router.push('/send-money')}
 colors={['#3b82f6', '#2563eb']}
 />
 <ActionCard
 label="History"
 icon={<History size={scale(28)} color="#8b5cf6" />}
 onPress={() => router.push('/transactions')}
 colors={['#8b5cf6', '#7c3aed']}
 />
 </View>
 </ScrollView>
 </LinearGradient>
 </SafeAreaView>
 );
}
function ActionCard({
 label,
 icon,
 onPress,
 colors,
}: {
 label: string;
 icon: React.ReactNode;
 onPress: () => void;
 colors: string[];
}) {
 return (
 <TouchableOpacity style={styles.actionCard} onPress={onPress}>
 <LinearGradient colors={colors} style={styles.actionGradient}>
 {icon}
 <Text style={styles.actionText}>{label}</Text>
 </LinearGradient>
 </TouchableOpacity>
 );
}
const styles = StyleSheet.create({
 safe: {
 flex: 1,
 backgroundColor: '#020617',
 },
 container: {
 flex: 1,
 },
 content: {
 paddingHorizontal: scale(20),
 paddingTop: verticalScale(24),
 paddingBottom: verticalScale(32),
 maxWidth: 520,
 width: '100%',
 alignSelf: 'center',
 },
 header: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 alignItems: 'center',
 marginBottom: verticalScale(28),
 },
 greeting: {
 color: '#94a3b8',
 fontSize: fontScale(14),
 },
 username: {
 color: '#fff',
 fontSize: fontScale(28),
 fontWeight: '800',
 },
 logout: {
 width: scale(44),
 height: scale(44),
 borderRadius: scale(22),
 backgroundColor: 'rgba(239,68,68,0.15)',
 alignItems: 'center',
 justifyContent: 'center',
 },
 glassCard: {
 borderRadius: scale(24),
 overflow: 'hidden',
 marginBottom: verticalScale(28),
 },
 balanceGradient: {
 padding: scale(24),
 },
 balanceTop: {
 flexDirection: 'row',
 justifyContent: 'space-between',
 marginBottom: verticalScale(12),
 },
 balanceLabel: {
 color: 'rgba(255,255,255,0.9)',
 fontWeight: '600',
 },
 balanceAmount: {
 fontSize: fontScale(42),
 fontWeight: '900',
 color: '#fff',
 marginBottom: verticalScale(12),
 },
 bankBalance: {
 color: 'rgba(255,255,255,0.8)',
 fontWeight: '600',
 },
 grid: {
 flexDirection: 'row',
 flexWrap: 'wrap',
 justifyContent: 'space-between',
 gap: scale(14),
 },
 actionCard: {
 width: '48%',
 aspectRatio: 1.25,
 borderRadius: scale(18),
 overflow: 'hidden',
 },
 actionGradient: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 gap: verticalScale(8),
 },
 actionText: {
 color: '#fff',
 fontWeight: '700',
 fontSize: fontScale(16),
 },
});