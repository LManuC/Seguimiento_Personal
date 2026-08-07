import { Stack } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTextField } from '@/hooks/use-text-field';
import { useTheme } from '@/hooks/use-theme';
import { useRegistro } from '@/lib/registro-context';

export default function PerfilScreen() {
  const { perfil, actualizarPerfil } = useRegistro();
  const theme = useTheme();

  const [nombrePaciente, setNombrePaciente] = useTextField(perfil.nombrePaciente ?? '', (v) =>
    actualizarPerfil({ nombrePaciente: v })
  );
  const [nombreNutricionista, setNombreNutricionista] = useTextField(
    perfil.nombreNutricionista,
    (v) => actualizarPerfil({ nombreNutricionista: v })
  );
  const [emailNutricionista, setEmailNutricionista] = useTextField(
    perfil.emailNutricionista,
    (v) => actualizarPerfil({ emailNutricionista: v })
  );

  return (
    <KeyboardAwareScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      bottomOffset={40}>
      <Stack.Screen options={{ title: 'Tus datos' }} />

      <ThemedView style={styles.container}>
        <ThemedView style={styles.campo}>
          <ThemedText type="smallBold">Tu nombre</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Se usa para el nombre del archivo PDF y para identificarte en el registro.
          </ThemedText>
          <TextInput
            value={nombrePaciente}
            onChangeText={setNombrePaciente}
            placeholder="Ej: Manuel Carra"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
        </ThemedView>

        <ThemedView style={styles.campo}>
          <ThemedText type="smallBold">Nombre de tu nutricionista</ThemedText>
          <TextInput
            value={nombreNutricionista}
            onChangeText={setNombreNutricionista}
            placeholder="Ej: Pilar Olaverry"
            placeholderTextColor={theme.textSecondary}
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
        </ThemedView>

        <ThemedView style={styles.campo}>
          <ThemedText type="smallBold">Mail de tu nutricionista</ThemedText>
          <TextInput
            value={emailNutricionista}
            onChangeText={setEmailNutricionista}
            placeholder="Ej: nutricion.olaverry@gmail.com"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
          />
        </ThemedView>
      </ThemedView>
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
    gap: Spacing.four,
  },
  campo: {
    gap: Spacing.one,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    padding: Spacing.two,
    minHeight: 44,
  },
});
