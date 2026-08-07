import { format } from 'date-fns';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRegistro } from '@/lib/registro-context';
import { OPCIONES_AGUA } from '@/lib/types';

interface Props {
  periodoId: string;
  fecha: string;
}

export function AguaButton({ periodoId, fecha }: Props) {
  const { agregarAgua } = useRegistro();
  const theme = useTheme();
  const [expandido, setExpandido] = useState(false);

  const elegirOpcion = async (opcion: (typeof OPCIONES_AGUA)[number]['opcion']) => {
    await agregarAgua(periodoId, fecha, opcion);
    setExpandido(false);
  };

  if (!expandido) {
    return (
      <Pressable onPress={() => setExpandido(true)}>
        <ThemedView type="backgroundElement" style={styles.botonCerrado}>
          <ThemedText type="smallBold" themeColor="accent">
            💧 + Agregar agua
          </ThemedText>
        </ThemedView>
      </Pressable>
    );
  }

  return (
    <ThemedView type="backgroundElement" style={styles.botonAbierto}>
      <ThemedText type="small" themeColor="textSecondary">
        Hora: {format(new Date(), 'HH:mm')} · elegí una opción
      </ThemedText>
      <ThemedView style={styles.opciones}>
        {OPCIONES_AGUA.map(({ opcion, etiqueta }) => (
          <Pressable key={opcion} onPress={() => elegirOpcion(opcion)}>
            <ThemedView
              type="backgroundSelected"
              style={[styles.opcion, { borderColor: theme.backgroundSelected }]}>
              <ThemedText type="small">{etiqueta}</ThemedText>
            </ThemedView>
          </Pressable>
        ))}
      </ThemedView>
      <Pressable onPress={() => setExpandido(false)}>
        <ThemedText type="small" themeColor="textSecondary" style={styles.cancelar}>
          Cancelar
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  botonCerrado: {
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  botonAbierto: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  opciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  opcion: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  cancelar: {
    textAlign: 'center',
  },
});
