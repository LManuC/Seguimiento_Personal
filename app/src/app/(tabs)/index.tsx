import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PeriodoDetalle } from '@/components/periodo-detalle';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRegistro } from '@/lib/registro-context';

export default function HomeScreen() {
  const { cargando, periodoActivo, crearPeriodo } = useRegistro();
  const theme = useTheme();

  const contentPlatformStyle = Platform.select({
    android: { paddingBottom: Spacing.four },
    web: { paddingTop: Spacing.six, paddingBottom: Spacing.four },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.container}>
          <ThemedText type="subtitle" style={styles.titulo}>
            Registro de 3 días
          </ThemedText>

          {cargando ? null : periodoActivo ? (
            <PeriodoDetalle periodoId={periodoActivo.id} />
          ) : (
            <ThemedView style={styles.vacio}>
              <ThemedText themeColor="textSecondary" style={styles.vacioTexto}>
                Anotá o sacá foto de tus comidas durante 3 días completos, y registrá tus
                entrenamientos (recuperación, rendimiento y descanso) para compartirlo con tu
                nutricionista.
              </ThemedText>
              <Pressable onPress={() => crearPeriodo()}>
                <ThemedView style={[styles.boton, { backgroundColor: theme.accent }]}>
                  <ThemedText style={styles.botonTexto}>Iniciar registro de 3 días</ThemedText>
                </ThemedView>
              </Pressable>
            </ThemedView>
          )}
        </ThemedView>
      </SafeAreaView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  container: {
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  titulo: {
    marginBottom: Spacing.one,
  },
  vacio: {
    gap: Spacing.four,
    paddingVertical: Spacing.four,
  },
  vacioTexto: {
    lineHeight: 22,
  },
  boton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  botonTexto: {
    color: '#fff',
    fontWeight: '600',
  },
});
