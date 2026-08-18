import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Tokens } from '@/types/api';

const TOKENS_KEY = 'dbm_tokens';
const USER_KEY = 'dbm_user';

export async function getTokens(): Promise<Tokens | null> {
  const raw = await AsyncStorage.getItem(TOKENS_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setTokens(tokens: Tokens): Promise<void> {
  await AsyncStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
}

export async function clearTokens(): Promise<void> {
  await AsyncStorage.removeItem(TOKENS_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

export async function getUser(): Promise<string | null> {
  return await AsyncStorage.getItem(USER_KEY);
}

export async function setUser(userJson: string): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, userJson);
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}
