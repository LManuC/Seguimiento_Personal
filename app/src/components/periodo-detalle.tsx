import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { exportarYCompartirPeriodo } from '@/lib/export';
import { useRegistro } from '@/lib/registro-context';
import { comidasCompletadas } from '@/lib/types';

export function PeriodoDetalle({ periodoId }: { periodoId: string }) {
  const { obtenerPeriodo, finalizarPeriodo, eliminarPeriodo, perfil } = useRegistro();
  const theme = useTheme();
  const [exportando, setExportando] = useState(false);

  const periodo = obtenerPeriodo(periodoId);
  if (!periodo) {
    return <ThemedText themeColor="textSecondary">No se encontró este registro.</ThemedText>;
  }

  const handleExportar = async () => {
    if (!perfil.nombrePaciente?.trim()) {
      Alert.alert(
        'Falta tu nombre',
        'Para generar el PDF con tu nombre, primero completalo en "Tus datos".',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Completar datos', onPress: () => router.push('/perfil') },
        ]
      );
      return;
    }
    setExportando(true);
    try {
      await exportarYCompartirPeriodo(periodo, perfil);
    } catch {
      Alert.alert('No se pudo exportar', 'Ocurrió un problema al generar el PDF.');
    } finally {
      setExportando(false);
    }
  };

  const handleEliminar = () => {
    Alert.alert('Eliminar registro', '¿Seguro que querés borrar este registro de 3 días? Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await eliminarPeriodo(periodo.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText themeColor="textSecondary" type="small">
        Iniciado el {format(parseISO(periodo.creadoEn), "d 'de' MMMM", { locale: es })}
        {periodo.finalizado ? ' · Finalizado' : ' · En curso'}
      </ThemedText>

      {periodo.dias.map((dia, index) => {
        const completas = comidasCompletadas(dia);
        const fechaLegible = format(parseISO(dia.fecha), "EEEE d/M", { locale: es });
        return (
          <Pressable
            key={dia.fecha}
            onPress={() => router.push(`/periodo/${periodo.id}/dia/${dia.fecha}`)}
            style={({ pressed }) => pressed && styles.pressed}>
            <ThemedView type="backgroundElement" style={styles.diaCard}>
              <ThemedView style={styles.diaCardHeader}>
                <ThemedText type="smallBold">Día {index + 1}</ThemedText>
                <ThemedText themeColor="textSecondary" type="small">
                  {fechaLegible.charAt(0).toUpperCase() + fechaLegible.slice(1)}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.diaCardRow}>
                <ThemedText type="small">{completas}/5 comidas registradas</ThemedText>
                <ThemedText
                  type="small"
                  themeColor={
                    dia.entrenamiento.registrado && dia.entrenamiento.entreno
                      ? 'accent'
                      : 'textSecondary'
                  }>
                  {!dia.entrenamiento.registrado
                    ? 'Entrenamiento pendiente'
                    : dia.entrenamiento.entreno
                      ? '✓ Entrenó'
                      : 'No entrenó'}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </Pressable>
        );
      })}

      <Pressable onPress={handleExportar} disabled={exportando}>
        <ThemedView style={[styles.boton, { backgroundColor: theme.accent }]}>
          {exportando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.botonTexto}>Enviar por mail a tu nutricionista</ThemedText>
          )}
        </ThemedView>
      </Pressable>

      {!periodo.finalizado ? (
        <Pressable onPress={() => finalizarPeriodo(periodo.id, true)}>
          <ThemedText type="link" themeColor="textSecondary" style={styles.linkCentrado}>
            Marcar registro como finalizado
          </ThemedText>
        </Pressable>
      ) : (
        <Pressable onPress={() => finalizarPeriodo(periodo.id, false)}>
          <ThemedText type="link" themeColor="textSecondary" style={styles.linkCentrado}>
            Reabrir registro
          </ThemedText>
        </Pressable>
      )}

      <Pressable onPress={handleEliminar}>
        <ThemedText type="link" themeColor="danger" style={styles.linkCentrado}>
          Eliminar este registro
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
  diaCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  diaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diaCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.one,
  },
  boton: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: '600',
  },
  linkCentrado: {
    textAlign: 'center',
  },
});
