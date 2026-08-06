import AsyncStorage from '@react-native-async-storage/async-storage';

import { PeriodoRegistro, Perfil, perfilPorDefecto } from '@/lib/types';

const STORAGE_KEY = 'nutricion.periodos.v1';
const PERFIL_KEY = 'nutricion.perfil.v1';

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

export async function cargarPerfil(): Promise<Perfil> {
  const raw = await AsyncStorage.getItem(PERFIL_KEY);
  if (!raw) return perfilPorDefecto();
  try {
    return { ...perfilPorDefecto(), ...JSON.parse(raw) };
  } catch {
    return perfilPorDefecto();
  }
}

export async function guardarPerfil(perfil: Perfil): Promise<void> {
  await AsyncStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
}
