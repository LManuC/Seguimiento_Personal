import { Alert, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useRegistro } from '@/lib/registro-context';
import { OPCIONES_AGUA, RegistroAgua } from '@/lib/types';

interface Props {
  periodoId: string;
  fecha: string;
  registro: RegistroAgua;
}

export function AguaItem({ periodoId, fecha, registro }: Props) {
  const { eliminarAgua } = useRegistro();
  const etiqueta = OPCIONES_AGUA.find((o) => o.opcion === registro.opcion)?.etiqueta ?? '';

  const confirmarEliminar = () => {
    Alert.alert('Quitar registro', `¿Quitar "${etiqueta}" de las ${registro.horario}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Quitar', style: 'destructive', onPress: () => eliminarAgua(periodoId, fecha, registro.id) },
    ]);
  };

  return (
    <Pressable onPress={confirmarEliminar}>
      <ThemedView type="backgroundElement" style={styles.fila}>
        <ThemedText type="small">💧 {registro.horario} · {etiqueta}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Quitar
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
