import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

import { AguaButton } from '@/components/agua-button';
import { AguaItem } from '@/components/agua-item';
import { MealCard } from '@/components/meal-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrainingForm } from '@/components/training-form';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRegistro } from '@/lib/registro-context';
import { DiaRegistro, HORARIO_REFERENCIA_COMIDA, TIPOS_COMIDA } from '@/lib/types';

type LineaTiempo =
  | { tipo: 'comida'; horarioOrden: string; comidaTipo: (typeof TIPOS_COMIDA)[number] }
  | { tipo: 'agua'; horarioOrden: string; id: string };

function construirLineaTiempo(dia: DiaRegistro): LineaTiempo[] {
  const lineas: LineaTiempo[] = [
    ...TIPOS_COMIDA.map((comidaTipo) => ({
      tipo: 'comida' as const,
      horarioOrden: dia.comidas[comidaTipo.tipo].horario ?? HORARIO_REFERENCIA_COMIDA[comidaTipo.tipo],
      comidaTipo,
    })),
    ...dia.agua.map((a) => ({ tipo: 'agua' as const, horarioOrden: a.horario, id: a.id })),
  ];
  return lineas.sort((a, b) => a.horarioOrden.localeCompare(b.horarioOrden));
}

export default function DiaScreen() {
  const { periodoId, fecha } = useLocalSearchParams<{ periodoId: string; fecha: string }>();
  const { obtenerPeriodo } = useRegistro();
  const theme = useTheme();

  const periodo = obtenerPeriodo(periodoId);
  const dia = periodo?.dias.find((d) => d.fecha === fecha);

  const fechaLegible = fecha
    ? format(parseISO(fecha), "EEEE d 'de' MMMM", { locale: es })
    : '';

  return (
    <KeyboardAwareScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      bottomOffset={40}>
      <Stack.Screen
        options={{ title: fechaLegible.charAt(0).toUpperCase() + fechaLegible.slice(1) }}
      />

      {!dia || !periodo ? (
        <ThemedText themeColor="textSecondary">No se encontró este día.</ThemedText>
      ) : (
        <ThemedView style={styles.container}>
          <AguaButton periodoId={periodo.id} fecha={dia.fecha} />

          {construirLineaTiempo(dia).map((linea) =>
            linea.tipo === 'comida' ? (
              <MealCard
                key={linea.comidaTipo.tipo}
                periodoId={periodo.id}
                fecha={dia.fecha}
                tipo={linea.comidaTipo.tipo}
                etiqueta={linea.comidaTipo.etiqueta}
                comida={dia.comidas[linea.comidaTipo.tipo]}
              />
            ) : (
              <AguaItem
                key={linea.id}
                periodoId={periodo.id}
                fecha={dia.fecha}
                registro={dia.agua.find((a) => a.id === linea.id)!}
              />
            )
          )}

          <TrainingForm
            periodoId={periodo.id}
            fecha={dia.fecha}
            entrenamiento={dia.entrenamiento}
          />
        </ThemedView>
      )}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    padding: Spacing.four,
  },
  container: {
    gap: Spacing.three,
  },
});
