import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { MealCard } from '@/components/meal-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TrainingForm } from '@/components/training-form';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRegistro } from '@/lib/registro-context';
import { TIPOS_COMIDA } from '@/lib/types';

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
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}>
      <Stack.Screen
        options={{ title: fechaLegible.charAt(0).toUpperCase() + fechaLegible.slice(1) }}
      />

      {!dia || !periodo ? (
        <ThemedText themeColor="textSecondary">No se encontró este día.</ThemedText>
      ) : (
        <ThemedView style={styles.container}>
          {TIPOS_COMIDA.map(({ tipo, etiqueta }) => (
            <MealCard
              key={tipo}
              periodoId={periodo.id}
              fecha={dia.fecha}
              tipo={tipo}
              etiqueta={etiqueta}
              comida={dia.comidas[tipo]}
            />
          ))}

          <TrainingForm
            periodoId={periodo.id}
            fecha={dia.fecha}
            entrenamiento={dia.entrenamiento}
          />
        </ThemedView>
      )}
    </ScrollView>
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
