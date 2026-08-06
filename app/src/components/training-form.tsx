import { useState } from 'react';
import { Pressable, StyleSheet, Switch, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRegistro } from '@/lib/registro-context';
import { CalidadDescanso, ETIQUETAS_DESCANSO, RegistroEntrenamiento } from '@/lib/types';

interface Props {
  periodoId: string;
  fecha: string;
  entrenamiento: RegistroEntrenamiento;
}

export function TrainingForm({ periodoId, fecha, entrenamiento }: Props) {
  const { actualizarEntrenamiento } = useRegistro();
  const theme = useTheme();

  const [tipoActividad, setTipoActividad] = useState(entrenamiento.tipoActividad ?? '');
  const [duracionMin, setDuracionMin] = useState(entrenamiento.duracionMin ?? '');
  const [tipoRecuperacion, setTipoRecuperacion] = useState(entrenamiento.tipoRecuperacion ?? '');
  const [mejoraRendimiento, setMejoraRendimiento] = useState(entrenamiento.mejoraRendimiento ?? '');
  const [notas, setNotas] = useState(entrenamiento.notas ?? '');

  const guardarCampo = (patch: Partial<RegistroEntrenamiento>) =>
    actualizarEntrenamiento(periodoId, fecha, { registrado: true, ...patch });

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedView style={styles.header}>
        <ThemedText type="smallBold">Entrenamiento</ThemedText>
        <Switch
          value={entrenamiento.entreno}
          onValueChange={(entreno) => guardarCampo({ entreno })}
        />
      </ThemedView>

      {entrenamiento.entreno ? (
        <ThemedView style={styles.body}>
          <Campo etiqueta="¿Qué entrenamiento hiciste?">
            <TextInput
              value={tipoActividad}
              onChangeText={setTipoActividad}
              onBlur={() => guardarCampo({ tipoActividad })}
              placeholder="Ej: Gimnasio - tren superior, fútbol, running..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
          </Campo>

          <Campo etiqueta="Duración (minutos)">
            <TextInput
              value={duracionMin}
              onChangeText={setDuracionMin}
              onBlur={() => guardarCampo({ duracionMin })}
              placeholder="Ej: 60"
              keyboardType="number-pad"
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
          </Campo>

          <Campo etiqueta="Tipo de recuperación">
            <TextInput
              value={tipoRecuperacion}
              onChangeText={setTipoRecuperacion}
              onBlur={() => guardarCampo({ tipoRecuperacion })}
              placeholder="Ej: activa, estiramientos, hielo, masajes, ninguna..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
          </Campo>

          <Campo etiqueta="¿Notaste mejorías en el rendimiento?">
            <TextInput
              value={mejoraRendimiento}
              onChangeText={setMejoraRendimiento}
              onBlur={() => guardarCampo({ mejoraRendimiento })}
              placeholder="Contá qué notaste (fuerza, resistencia, sensación general...)"
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
          </Campo>

          <Campo etiqueta="Calidad del descanso">
            <ThemedView style={styles.escala}>
              {([1, 2, 3, 4, 5] as CalidadDescanso[]).map((valor) => {
                const seleccionado = entrenamiento.calidadDescanso === valor;
                return (
                  <Pressable key={valor} onPress={() => guardarCampo({ calidadDescanso: valor })}>
                    <ThemedView
                      type={seleccionado ? 'backgroundSelected' : 'background'}
                      style={[styles.escalaItem, { borderColor: theme.backgroundSelected }]}>
                      <ThemedText type="smallBold">{valor}</ThemedText>
                    </ThemedView>
                  </Pressable>
                );
              })}
            </ThemedView>
            {entrenamiento.calidadDescanso && (
              <ThemedText type="small" themeColor="textSecondary">
                {ETIQUETAS_DESCANSO[entrenamiento.calidadDescanso]}
              </ThemedText>
            )}
          </Campo>

          <Campo etiqueta="Notas adicionales (opcional)">
            <TextInput
              value={notas}
              onChangeText={setNotas}
              onBlur={() => guardarCampo({ notas })}
              placeholder="Horas dormidas, despertares nocturnos, etc."
              placeholderTextColor={theme.textSecondary}
              multiline
              style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
          </Campo>
        </ThemedView>
      ) : (
        entrenamiento.registrado && (
          <ThemedText type="small" themeColor="textSecondary" style={styles.sinEntreno}>
            Registraste que no entrenaste este día.
          </ThemedText>
        )
      )}
    </ThemedView>
  );
}

function Campo({ etiqueta, children }: { etiqueta: string; children: React.ReactNode }) {
  return (
    <ThemedView style={styles.campo}>
      <ThemedText type="small" themeColor="textSecondary">
        {etiqueta}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  body: {
    marginTop: Spacing.three,
    gap: Spacing.three,
  },
  campo: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.two,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  escala: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  escalaItem: {
    width: 40,
    height: 40,
    borderRadius: Spacing.two,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sinEntreno: {
    marginTop: Spacing.two,
  },
});
