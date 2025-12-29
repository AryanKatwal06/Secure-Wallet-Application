import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { WalletProvider } from '@/context/WalletContext';
import { OfflineProvider } from '@/context/OfflineContext';
SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();
function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="dashboard" />
      <Stack.Screen
        name="add-money"
        options={{ presentation: 'modal', headerShown: true, title: 'Add Money' }}
      />
      <Stack.Screen
        name="withdraw"
        options={{ presentation: 'modal', headerShown: true, title: 'Withdraw' }}
      />
      <Stack.Screen
        name="send-money"
        options={{ presentation: 'modal', headerShown: true, title: 'Send Money' }}
      />
      <Stack.Screen
        name="transactions"
        options={{ headerShown: true, title: 'Transactions' }}
      />
    </Stack>
  );
}
export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <OfflineProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="light" />
            <RootLayoutNav />
          </GestureHandlerRootView>
        </OfflineProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}