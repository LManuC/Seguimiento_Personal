import { addDays, format } from 'date-fns';
import * as Crypto from 'expo-crypto';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { eliminarFoto } from '@/lib/fotos';
import { cargarPerfil, cargarPeriodos, guardarPerfil, guardarPeriodos } from '@/lib/storage';
import {
  comidasVacias,
  DiaRegistro,
  entrenamientoVacio,
  Perfil,
  perfilPorDefecto,
  PeriodoRegistro,
  RegistroComida,
  RegistroEntrenamiento,
  TipoComida,
} from '@/lib/types';

interface RegistroContextValue {
  periodos: PeriodoRegistro[];
  cargando: boolean;
  periodoActivo: PeriodoRegistro | undefined;
  perfil: Perfil;
  actualizarPerfil: (patch: Partial<Perfil>) => Promise<void>;
  obtenerPeriodo: (id: string) => PeriodoRegistro | undefined;
  crearPeriodo: () => Promise<string>;
  actualizarComida: (
    periodoId: string,
    fecha: string,
    tipo: TipoComida,
    patch: Partial<RegistroComida>
  ) => Promise<void>;
  actualizarEntrenamiento: (
    periodoId: string,
    fecha: string,
    patch: Partial<RegistroEntrenamiento>
  ) => Promise<void>;
  finalizarPeriodo: (id: string, finalizado: boolean) => Promise<void>;
  eliminarPeriodo: (id: string) => Promise<void>;
}

const RegistroContext = createContext<RegistroContextValue | null>(null);

function crearDiasIniciales(): DiaRegistro[] {
  const inicio = new Date();
  return [0, 1, 2].map((offset) => ({
    fecha: format(addDays(inicio, offset), 'yyyy-MM-dd'),
    comidas: comidasVacias(),
    entrenamiento: entrenamientoVacio(),
  }));
}

export function RegistroProvider({ children }: { children: ReactNode }) {
  const [periodos, setPeriodos] = useState<PeriodoRegistro[]>([]);
  const [perfil, setPerfil] = useState<Perfil>(perfilPorDefecto());
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      cargarPeriodos().catch(() => [] as PeriodoRegistro[]),
      cargarPerfil().catch(() => perfilPorDefecto()),
    ]).then(([periodosCargados, perfilCargado]) => {
      setPeriodos(periodosCargados);
      setPerfil(perfilCargado);
      setCargando(false);
    });
  }, []);

  const actualizarPerfil = useCallback(
    async (patch: Partial<Perfil>) => {
      const siguiente = { ...perfil, ...patch };
      setPerfil(siguiente);
      await guardarPerfil(siguiente);
    },
    [perfil]
  );

  const persistir = useCallback(async (siguiente: PeriodoRegistro[]) => {
    setPeriodos(siguiente);
    await guardarPeriodos(siguiente);
  }, []);

  const obtenerPeriodo = useCallback(
    (id: string) => periodos.find((p) => p.id === id),
    [periodos]
  );

  const crearPeriodo = useCallback(async () => {
    const nuevo: PeriodoRegistro = {
      id: Crypto.randomUUID(),
      creadoEn: new Date().toISOString(),
      dias: crearDiasIniciales(),
      finalizado: false,
    };
    await persistir([nuevo, ...periodos]);
    return nuevo.id;
  }, [periodos, persistir]);

  const actualizarComida = useCallback(
    async (periodoId: string, fecha: string, tipo: TipoComida, patch: Partial<RegistroComida>) => {
      const siguiente = periodos.map((periodo) => {
        if (periodo.id !== periodoId) return periodo;
        return {
          ...periodo,
          dias: periodo.dias.map((dia) => {
            if (dia.fecha !== fecha) return dia;
            return {
              ...dia,
              comidas: {
                ...dia.comidas,
                [tipo]: { ...dia.comidas[tipo], ...patch },
              },
            };
          }),
        };
      });
      await persistir(siguiente);
    },
    [periodos, persistir]
  );

  const actualizarEntrenamiento = useCallback(
    async (periodoId: string, fecha: string, patch: Partial<RegistroEntrenamiento>) => {
      const siguiente = periodos.map((periodo) => {
        if (periodo.id !== periodoId) return periodo;
        return {
          ...periodo,
          dias: periodo.dias.map((dia) => {
            if (dia.fecha !== fecha) return dia;
            return { ...dia, entrenamiento: { ...dia.entrenamiento, ...patch } };
          }),
        };
      });
      await persistir(siguiente);
    },
    [periodos, persistir]
  );

  const finalizarPeriodo = useCallback(
    async (id: string, finalizado: boolean) => {
      const siguiente = periodos.map((periodo) =>
        periodo.id === id ? { ...periodo, finalizado } : periodo
      );
      await persistir(siguiente);
    },
    [periodos, persistir]
  );

  const eliminarPeriodo = useCallback(
    async (id: string) => {
      const periodo = periodos.find((p) => p.id === id);
      periodo?.dias.forEach((dia) => {
        Object.values(dia.comidas).forEach((comida) => eliminarFoto(comida.fotoUri));
      });
      await persistir(periodos.filter((p) => p.id !== id));
    },
    [periodos, persistir]
  );

  const periodoActivo = useMemo(() => periodos.find((p) => !p.finalizado), [periodos]);

  const value: RegistroContextValue = {
    periodos,
    cargando,
    periodoActivo,
    perfil,
    actualizarPerfil,
    obtenerPeriodo,
    crearPeriodo,
    actualizarComida,
    actualizarEntrenamiento,
    finalizarPeriodo,
    eliminarPeriodo,
  };

  return <RegistroContext.Provider value={value}>{children}</RegistroContext.Provider>;
}

export function useRegistro() {
  const ctx = useContext(RegistroContext);
  if (!ctx) throw new Error('useRegistro debe usarse dentro de RegistroProvider');
  return ctx;
}
