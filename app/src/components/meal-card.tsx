import { format } from 'date-fns';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { eliminarFoto, guardarFotoPersistente } from '@/lib/fotos';
import { useRegistro } from '@/lib/registro-context';
import { RegistroComida, TipoComida } from '@/lib/types';

interface Props {
  periodoId: string;
  fecha: string;
  tipo: TipoComida;
  etiqueta: string;
  comida: RegistroComida;
}

export function MealCard({ periodoId, fecha, tipo, etiqueta, comida }: Props) {
  const { actualizarComida } = useRegistro();
  const theme = useTheme();
  const [expandido, setExpandido] = useState(false);
  const [nota, setNota] = useState(comida.nota ?? '');
  const [horario, setHorario] = useState(comida.horario ?? '');
  const [procesando, setProcesando] = useState(false);

  const tieneContenido = Boolean(comida.nota || comida.fotoUri);
  const horaActual = () => format(new Date(), 'HH:mm');

  const guardarFoto = async (uriOrigen: string) => {
    setProcesando(true);
    try {
      const anterior = comida.fotoUri;
      const nuevaUri = await guardarFotoPersistente(uriOrigen, periodoId, fecha, tipo);
      const patch: Partial<RegistroComida> = { fotoUri: nuevaUri };
      if (!comida.horario) {
        patch.horario = horaActual();
        setHorario(patch.horario);
      }
      await actualizarComida(periodoId, fecha, tipo, patch);
      if (anterior && anterior !== nuevaUri) eliminarFoto(anterior);
    } catch {
      Alert.alert('No se pudo guardar la foto', 'Intentá de nuevo.');
    } finally {
      setProcesando(false);
    }
  };

  const tomarFoto = async () => {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Habilitá el acceso a la cámara para sacar la foto.');
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({ quality: 0.6 });
    if (!resultado.canceled) await guardarFoto(resultado.assets[0].uri);
  };

  const elegirDeGaleria = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert('Permiso necesario', 'Habilitá el acceso a tus fotos para elegir una imagen.');
      return;
    }
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });
    if (!resultado.canceled) await guardarFoto(resultado.assets[0].uri);
  };

  const quitarFoto = async () => {
    eliminarFoto(comida.fotoUri);
    await actualizarComida(periodoId, fecha, tipo, { fotoUri: undefined });
  };

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <Pressable onPress={() => setExpandido((v) => !v)}>
        <ThemedView style={styles.header}>
          <ThemedText type="smallBold">{etiqueta}</ThemedText>
          <ThemedText type="small" themeColor={tieneContenido ? 'accent' : 'textSecondary'}>
            {tieneContenido
              ? `✓ Registrada${comida.horario ? ` · ${comida.horario}` : ''}`
              : expandido
                ? 'Cerrar'
                : 'Agregar'}
          </ThemedText>
        </ThemedView>
      </Pressable>

      {expandido && (
        <ThemedView style={styles.body}>
          <ThemedView style={styles.filaHorario}>
            <ThemedText type="small" themeColor="textSecondary">
              Horario
            </ThemedText>
            <TextInput
              value={horario}
              onChangeText={setHorario}
              onBlur={() => actualizarComida(periodoId, fecha, tipo, { horario })}
              placeholder="HH:mm"
              placeholderTextColor={theme.textSecondary}
              style={[styles.inputHorario, { color: theme.text, borderColor: theme.backgroundSelected }]}
            />
          </ThemedView>

          {comida.fotoUri && (
            <Image source={{ uri: comida.fotoUri }} style={styles.foto} contentFit="cover" />
          )}

          <ThemedView style={styles.botonesFoto}>
            <Pressable onPress={tomarFoto} disabled={procesando} style={styles.botonSecundario}>
              <ThemedText type="small" themeColor="text">
                📷 Tomar foto
              </ThemedText>
            </Pressable>
            <Pressable onPress={elegirDeGaleria} disabled={procesando} style={styles.botonSecundario}>
              <ThemedText type="small" themeColor="text">
                🖼️ Galería
              </ThemedText>
            </Pressable>
            {comida.fotoUri && (
              <Pressable onPress={quitarFoto} disabled={procesando} style={styles.botonSecundario}>
                <ThemedText type="small" themeColor="danger">
                  Quitar
                </ThemedText>
              </Pressable>
            )}
          </ThemedView>

          <TextInput
            value={nota}
            onChangeText={setNota}
            onBlur={() => {
              const patch: Partial<RegistroComida> = { nota };
              if (nota.trim() && !comida.horario && !horario) {
                patch.horario = horaActual();
                setHorario(patch.horario);
              }
              actualizarComida(periodoId, fecha, tipo, patch);
            }}
            placeholder="¿Qué comiste? Cantidades, ingredientes, etc."
            placeholderTextColor={theme.textSecondary}
            multiline
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
        </ThemedView>
      )}
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
    gap: Spacing.two,
  },
  filaHorario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputHorario: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    width: 90,
    textAlign: 'center',
  },
  foto: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: Spacing.two,
  },
  botonesFoto: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  botonSecundario: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.two,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
