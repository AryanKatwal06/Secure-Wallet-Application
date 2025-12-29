import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { CheckCircle2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
interface Props {
 message: string;
}
export default function TransactionSuccess({ message }: Props) {
 const scale = useRef(new Animated.Value(0.6)).current;
 const opacity = useRef(new Animated.Value(0)).current;
 useEffect(() => {
 Animated.parallel([
 Animated.spring(scale, {
 toValue: 1,
 friction: 5,
 useNativeDriver: true,
 }),
 Animated.timing(opacity, {
 toValue: 1,
 duration: 300,
 useNativeDriver: true,
 }),
 ]).start();
 }, []);
 return (
 <LinearGradient
 colors={['#0f172a', '#020617']}
 style={styles.container}
 >
 <Animated.View
 style={[
 styles.card,
 { transform: [{ scale }], opacity },
 ]}
 >
 <CheckCircle2 size={72} color="#22c55e" />
 <Text style={styles.title}>Success</Text>
 <Text style={styles.message}>{message}</Text>
 </Animated.View>
 </LinearGradient>
 );
}
const styles = StyleSheet.create({
 container: {
 ...StyleSheet.absoluteFillObject,
 justifyContent: 'center',
 alignItems: 'center',
 zIndex: 999,
 },
 card: {
 alignItems: 'center',
 padding: 32,
 borderRadius: 24,
 backgroundColor: 'rgba(255,255,255,0.06)',
 borderWidth: 1,
 borderColor: 'rgba(255,255,255,0.12)',
 },
 title: {
 fontSize: 26,
 fontWeight: '800',
 color: '#fff',
 marginTop: 12,
 },
 message: {
 fontSize: 14,
 color: '#94a3b8',
 marginTop: 8,
 textAlign: 'center',
 },
});