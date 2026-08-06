import { Directory, File, Paths } from 'expo-file-system';

const CARPETA_FOTOS = 'nutricion-fotos';

function carpetaPeriodo(periodoId: string): Directory {
  const dir = new Directory(Paths.document, CARPETA_FOTOS, periodoId);
  if (!dir.exists) {
    dir.create({ intermediates: true });
  }
  return dir;
}

export async function guardarFotoPersistente(
  uriOrigen: string,
  periodoId: string,
  fecha: string,
  tipo: string
): Promise<string> {
  const dir = carpetaPeriodo(periodoId);
  const destino = new File(dir, `${fecha}-${tipo}.jpg`);
  if (destino.exists) {
    destino.delete();
  }
  const origen = new File(uriOrigen);
  await origen.copy(destino);
  return destino.uri;
}

export function eliminarFoto(uri?: string): void {
  if (!uri) return;
  try {
    const file = new File(uri);
    if (file.exists) {
      file.delete();
    }
  } catch {
    // el archivo ya no existe o no se pudo borrar; no es crítico
  }
}

export async function fotoABase64(uri: string): Promise<string | null> {
  try {
    const file = new File(uri);
    if (!file.exists) return null;
    return await file.base64();
  } catch {
    return null;
  }
}
