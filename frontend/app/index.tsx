import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useWallet } from '@/context/WalletContext';
export default function Index() {
 const router = useRouter();
 const { isAuthenticated, isLoading } = useWallet();
 useEffect(() => {
 if (isLoading) return;
 if (isAuthenticated) {
 router.replace('/dashboard');
 } else {
 router.replace('/auth/login');
 }
 }, [isAuthenticated, isLoading]);
 return (
 <View style={styles.container}>
 <ActivityIndicator size="large" color="#4f46e5" />
 </View>
 );
}
const styles = StyleSheet.create({
 container: {
 flex: 1,
 justifyContent: 'center',
 alignItems: 'center',
 backgroundColor: '#000',
 },
});