import AsyncStorage from '@react-native-async-storage/async-storage';

import { PeriodoRegistro } from '@/lib/types';

const STORAGE_KEY = 'nutricion.periodos.v1';

export async function cargarPeriodos(): Promise<PeriodoRegistro[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function guardarPeriodos(periodos: PeriodoRegistro[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(periodos));
}
