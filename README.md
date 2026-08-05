# Registro Nutrición

App para Android hecha con [Expo](https://expo.dev) (React Native + TypeScript) para cumplir la consigna de la Lic. Pilar Olaverry (Nutrición Deportiva): registrar 3 días completos de comidas (foto o anotación) y las actividades de entrenamiento de esos días (tipo de recuperación, mejorías en el rendimiento, calidad del descanso).

El código de la app vive en [`app/`](app/).

## Qué hace la app

- **Registro (tab 1):** al tocar "Iniciar registro de 3 días" se crea un período con la fecha de hoy + los 2 días siguientes. Cada día tiene 5 comidas (Desayuno, Media mañana, Almuerzo, Merienda, Cena); para cada una se puede sacar una foto con la cámara, elegir una foto de la galería, y/o escribir una nota de qué se comió.
- **Entrenamiento por día:** switch "¿Entrenaste hoy?" y, si está activo, campos para tipo de actividad, duración, **tipo de recuperación**, **si notaste mejorías en el rendimiento** y **calidad del descanso** (escala 1 a 5) — los puntos exactos que pide la consigna.
- **Compartir con tu nutricionista:** genera un PDF con los 3 días (notas + fotos embebidas) y abre el menú nativo de Android para enviarlo por WhatsApp, email, etc.
- **Historial (tab 2):** lista de períodos de registro anteriores, para reutilizar la app en cada control futuro.
- Todo se guarda localmente en el celular (AsyncStorage + almacenamiento de archivos del dispositivo); no hace falta internet ni cuenta para usarla día a día.

## Estructura del proyecto

```
app/
  src/
    app/                        rutas (expo-router)
      (tabs)/                   tabs "Registro" e "Historial"
      periodo/[periodoId]/      detalle de un período + export
        dia/[fecha].tsx         comidas + entrenamiento de un día
    components/
      periodo-detalle.tsx       tarjetas de los 3 días + acciones (compartir/finalizar/eliminar)
      meal-card.tsx             foto + nota de una comida
      training-form.tsx         formulario de entrenamiento del día
    lib/
      types.ts                  modelo de datos (PeriodoRegistro, DiaRegistro, etc.)
      storage.ts                lectura/escritura en AsyncStorage
      fotos.ts                  guardar/borrar/leer fotos en almacenamiento persistente
      registro-context.tsx      estado global (React Context) de los períodos
      export.ts                 generación del PDF y compartir
  app.json                      configuración de Expo (nombre, ícono, permisos de cámara)
  eas.json                      perfiles de build (el perfil "preview" genera un .apk)
```

## Instalar y probar en tu celular (sin generar un .apk)

Requisitos en la PC: [Node.js](https://nodejs.org) (ya instalado) y la app **Expo Go** en tu Android (se descarga gratis de Play Store).

1. Abrí una terminal en la carpeta `app/`:
   ```
   cd app
   npx expo start
   ```
2. Se va a mostrar un código QR en la terminal.
3. Abrí **Expo Go** en tu celular y escaneá el código QR (tenés que estar en la misma red WiFi que la PC).
4. La app se abre al instante en tu teléfono. Cualquier cambio que se haga en el código se refleja al instante (hot reload).

Esta forma es ideal para probar y ajustar la app, pero requiere tener Expo Go instalado y la PC prendida corriendo `expo start`.

## Generar el .apk instalable (para usarla sin la PC ni Expo Go)

Se genera en la nube con **EAS Build** (gratis, de Expo), no requiere instalar Android Studio.

1. Creá una cuenta gratuita en https://expo.dev (si no tenés una).
2. En la carpeta `app/`, iniciá sesión:
   ```
   npx eas login
   ```
3. Generá el APK:
   ```
   npx eas build -p android --profile preview
   ```
   (La primera vez te va a preguntar si querés crear el proyecto en tu cuenta de Expo — decís que sí. El perfil `preview` ya está configurado en `eas.json` para generar un `.apk` directo, no un `.aab` de Play Store.)
4. Cuando termina el build (unos 10-15 minutos), EAS te da un link de descarga. Abrí ese link desde el navegador del celular y descargá el `.apk`.
5. Android puede pedir permiso para "instalar apps de fuentes desconocidas" la primera vez — lo habilitás y instalás el APK normalmente.

Una vez instalada así, la app funciona de forma completamente independiente (no necesita Expo Go ni la PC).

## Verificaciones hechas

- `npx tsc --noEmit` — sin errores de TypeScript.
- `npx expo-doctor` — 20/20 checks pasados.
- `npx expo export -p android` y `npx expo export -p web` — el bundle compila sin errores en ambas plataformas.
