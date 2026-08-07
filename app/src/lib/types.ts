export type TipoComida = 'desayuno' | 'media_manana' | 'almuerzo' | 'merienda' | 'cena';

export const TIPOS_COMIDA: { tipo: TipoComida; etiqueta: string }[] = [
  { tipo: 'desayuno', etiqueta: 'Desayuno' },
  { tipo: 'media_manana', etiqueta: 'Media mañana' },
  { tipo: 'almuerzo', etiqueta: 'Almuerzo' },
  { tipo: 'merienda', etiqueta: 'Merienda' },
  { tipo: 'cena', etiqueta: 'Cena' },
];

export interface RegistroComida {
  fotoUri?: string;
  nota?: string;
  horario?: string; // HH:mm
}

export type CalidadDescanso = 1 | 2 | 3 | 4 | 5;

export const ETIQUETAS_DESCANSO: Record<CalidadDescanso, string> = {
  1: 'Muy mala',
  2: 'Mala',
  3: 'Regular',
  4: 'Buena',
  5: 'Muy buena',
};

export interface RegistroEntrenamiento {
  registrado: boolean;
  entreno: boolean;
  tipoActividad?: string;
  duracionMin?: string;
  tipoRecuperacion?: string;
  mejoraRendimiento?: string;
  calidadDescanso?: CalidadDescanso;
  notas?: string;
}

export type ComidasDelDia = Record<TipoComida, RegistroComida>;

export type OpcionAgua = 'vaso_chico' | 'vaso_grande' | 'botella_500ml';

export const OPCIONES_AGUA: { opcion: OpcionAgua; etiqueta: string }[] = [
  { opcion: 'vaso_chico', etiqueta: 'Vaso chico' },
  { opcion: 'vaso_grande', etiqueta: 'Vaso grande' },
  { opcion: 'botella_500ml', etiqueta: 'Botella 500ml' },
];

export interface RegistroAgua {
  id: string;
  horario: string; // HH:mm, fijado al crear el registro
  opcion: OpcionAgua;
}

/** Horario de referencia usado solo para ordenar comidas que todavía no tienen horario cargado. */
export const HORARIO_REFERENCIA_COMIDA: Record<TipoComida, string> = {
  desayuno: '08:00',
  media_manana: '10:30',
  almuerzo: '13:00',
  merienda: '17:00',
  cena: '20:30',
};

export interface DiaRegistro {
  fecha: string; // yyyy-MM-dd
  comidas: ComidasDelDia;
  agua: RegistroAgua[];
  entrenamiento: RegistroEntrenamiento;
}

export interface PeriodoRegistro {
  id: string;
  creadoEn: string; // ISO datetime
  dias: DiaRegistro[];
  finalizado: boolean;
}

export function comidasVacias(): ComidasDelDia {
  return {
    desayuno: {},
    media_manana: {},
    almuerzo: {},
    merienda: {},
    cena: {},
  };
}

export function entrenamientoVacio(): RegistroEntrenamiento {
  return { registrado: false, entreno: false };
}

export function diaCompleto(dia: DiaRegistro): boolean {
  const comidasCompletas = Object.values(dia.comidas).every((c) => c.nota || c.fotoUri);
  return comidasCompletas && dia.entrenamiento.registrado;
}

export function comidasCompletadas(dia: DiaRegistro): number {
  return Object.values(dia.comidas).filter((c) => c.nota || c.fotoUri).length;
}

export interface Perfil {
  nombrePaciente?: string;
  nombreNutricionista: string;
  emailNutricionista: string;
}

export function perfilPorDefecto(): Perfil {
  return {
    nombreNutricionista: 'Pilar Olaverry',
    emailNutricionista: 'nutricion.olaverry@gmail.com',
  };
}
