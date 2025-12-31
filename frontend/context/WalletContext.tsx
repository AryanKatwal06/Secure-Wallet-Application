import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { walletApi } from '@/lib/api';
import type { User, Transaction } from '@/types/wallet';
interface WalletState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, pin: string) => Promise<void>;
  register: (username: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshBalance: () => void;
  addMoney: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
  transfer: (receiverUsername: string, amount: number) => Promise<void>;
  transactions: Transaction[];
  isLoadingTransactions: boolean;
  bankBalance: number;
}
export const [WalletProvider, useWallet] =
  createContextHook<WalletState>(() => {
    const queryClient = useQueryClient();
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    useEffect(() => {
      const loadAuth = async () => {
        try {
          const storedToken = await AsyncStorage.getItem('token');
          const storedUser = await AsyncStorage.getItem('user');
          if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.warn('Failed to restore auth', err);
        } finally {
          setIsBootstrapping(false);
        }
      };
      loadAuth();
    }, []);
    const { data: balanceData } = useQuery({
      queryKey: ['balance', token],
      queryFn: () => walletApi.getBalance(token!),
      enabled: Boolean(token && isAuthenticated),
      refetchInterval: 5000,
    });
    useEffect(() => {
      setUser((prev) =>
        prev && balanceData
          ? {
              ...prev,
              walletBalance:
                balanceData.walletBalance ?? prev.walletBalance,
            }
          : prev
      );
    }, [balanceData]);
    const { data: bankBalanceData } = useQuery({
      queryKey: ['bankBalance', token],
      queryFn: () => walletApi.getBankBalance(token!),
      enabled: Boolean(token && isAuthenticated),
      refetchInterval: 5000,
    });
    const {
      data: transactionsData,
      isLoading: isLoadingTransactions,
    } = useQuery({
      queryKey: ['transactions', token],
      queryFn: () => walletApi.getTransactionHistory(token!),
      enabled: Boolean(token && isAuthenticated),
      refetchInterval: 10000,
    });
    const loginMutation = useMutation({
      mutationFn: ({
        username,
        pin,
      }: {
        username: string;
        pin: string;
      }) => walletApi.login(username, pin),
      onSuccess: async (data) => {
        if (!data.token || !data.userId) {
          throw new Error('Invalid login response');
        }
        const newUser: User = {
          userId: data.userId,
          username: data.username!,
          walletBalance: data.walletBalance ?? 0,
          bankBalance: data.bankBalance ?? 0,
        };
        setToken(data.token);
        setUser(newUser);
        setIsAuthenticated(true);
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
        queryClient.clear();
      },
    });
    const registerMutation = useMutation({
      mutationFn: ({
        username,
        pin,
      }: {
        username: string;
        pin: string;
      }) => walletApi.register(username, pin),
      onSuccess: async (_, variables) => {
        await loginMutation.mutateAsync(variables);
      },
    });
    const addMoneyMutation = useMutation({
      mutationFn: (amount: number) =>
        walletApi.addMoney(token!, amount),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['balance'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      },
    });
    const withdrawMutation = useMutation({
      mutationFn: (amount: number) =>
        walletApi.withdraw(token!, amount),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['balance'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      },
    });
    const transferMutation = useMutation({
      mutationFn: ({
        receiverUsername,
        amount,
      }: {
        receiverUsername: string;
        amount: number;
      }) => walletApi.transfer(token!, receiverUsername, amount),
      onSuccess: () => {
        queryClient.invalidateQueries();
      },
    });
    const logout = async () => {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      await AsyncStorage.multiRemove(['token', 'user']);
      queryClient.clear();
    };
    const refreshBalance = () => {
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['bankBalance'] });
    };
    return {
      user,
      token,
      isAuthenticated,
      isLoading:
        isBootstrapping ||
        loginMutation.isPending ||
        registerMutation.isPending,
      login: async (u, p) => {
        await loginMutation.mutateAsync({ username: u, pin: p });
      },
      register: async (u, p) => {
        await registerMutation.mutateAsync({ username: u, pin: p });
      },
      logout,
      refreshBalance,
      addMoney: async (amount) => {
        await addMoneyMutation.mutateAsync(amount);
      },
      withdraw: async (amount) => {
        await withdrawMutation.mutateAsync(amount);
      },
      transfer: async (receiverUsername, amount) => {
        await transferMutation.mutateAsync({
          receiverUsername,
          amount,
        });
      },
      transactions: transactionsData?.transactions ?? [],
      isLoadingTransactions,
      bankBalance:
        bankBalanceData?.bankBalance ??
        user?.bankBalance ??
        0,
    };
  });