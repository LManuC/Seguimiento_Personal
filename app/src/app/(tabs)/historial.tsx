import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { router } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRegistro } from '@/lib/registro-context';
import { comidasCompletadas } from '@/lib/types';

export default function HistorialScreen() {
  const { periodos, cargando } = useRegistro();
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
            Historial
          </ThemedText>

          {!cargando && periodos.length === 0 && (
            <ThemedText themeColor="textSecondary">
              Todavía no iniciaste ningún registro de 3 días.
            </ThemedText>
          )}

          {periodos.map((periodo) => {
            const totalComidas = periodo.dias.reduce((sum, d) => sum + comidasCompletadas(d), 0);
            return (
              <Pressable
                key={periodo.id}
                onPress={() => router.push(`/periodo/${periodo.id}`)}
                style={({ pressed }) => pressed && styles.pressed}>
                <ThemedView type="backgroundElement" style={styles.card}>
                  <ThemedView style={styles.cardHeader}>
                    <ThemedText type="smallBold">
                      {format(parseISO(periodo.creadoEn), "d 'de' MMMM", { locale: es })}
                    </ThemedText>
                    <ThemedText
                      type="small"
                      themeColor={periodo.finalizado ? 'accent' : 'textSecondary'}>
                      {periodo.finalizado ? 'Finalizado' : 'En curso'}
                    </ThemedText>
                  </ThemedView>
                  <ThemedText type="small" themeColor="textSecondary">
                    {totalComidas}/15 comidas registradas
                  </ThemedText>
                </ThemedView>
              </Pressable>
            );
          })}
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
  pressed: {
    opacity: 0.7,
  },
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.half,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
