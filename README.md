# SoloServiciosUY

Marketplace móvil (Android + iOS) para contratar y ofrecer servicios de:
cuidado de ancianos, limpieza de hogares, limpieza de oficinas, jardinería/podado,
plomería, electricidad y niñería. Pensado para el mercado uruguayo (español, pesos
uruguayos, MercadoPago).

## Stack técnico

- **App**: React Native + Expo (TypeScript), [Expo Router](https://docs.expo.dev/router/introduction/) para la navegación.
- **Backend**: Firebase — Authentication, Firestore, Storage y Cloud Functions.
- **Pagos**: MercadoPago (Checkout Pro), integrado vía Cloud Functions.
- **Estado**: Zustand para el estado de sesión/perfil.

## Funcionalidades del MVP

- Registro/login con email y contraseña, con rol de **cliente**, **prestador** o **ambos**.
- Perfiles con foto, biografía, categorías ofrecidas y zona de cobertura (departamento/barrio).
- Publicar **ofertas** ("ofrezco este servicio") o **solicitudes** ("busco a alguien") por categoría.
- Búsqueda y filtro por categoría, departamento y tipo de publicación.
- Chat interno en tiempo real entre cliente y prestador.
- Flujo de reservas: solicitar → aceptar/rechazar → completar → pagar → calificar.
- Calificaciones y reseñas (con promedio recalculado automáticamente en el backend).
- Pagos dentro de la app vía MercadoPago.
- Verificación de identidad (subida de cédula) con revisión manual — clave para categorías
  sensibles como cuidado de ancianos y niñería.

## Estructura del proyecto

```
app/                    Pantallas (Expo Router, navegación por archivos)
  (auth)/                Login y registro
  (tabs)/                Inicio, Buscar, Mensajes, Reservas, Perfil
  category/[id].tsx       Listado por categoría
  service/[id].tsx        Detalle de una publicación
  service/create.tsx      Crear publicación
  service/mine.tsx        Mis publicaciones
  chat/[threadId].tsx     Conversación
  booking/[id].tsx         Detalle/gestión de una reserva
  user/[uid].tsx           Perfil público de otro usuario
  review/[bookingId].tsx   Dejar una reseña
  verification.tsx         Verificación de identidad

src/
  components/            Componentes de UI reutilizables
  constants/categories.ts Categorías de servicio y departamentos de Uruguay
  services/               Toda la integración con Firebase (auth, listings, bookings, chat, reviews, verification, pagos)
  store/authStore.ts       Estado global de sesión (Zustand)
  theme/                  Colores y espaciados
  types/                  Tipos de datos compartidos

functions/               Cloud Functions (Node/TypeScript)
  src/index.ts             createPaymentPreference, mercadopagoWebhook,
                            recálculo de calificaciones, propagación de verificación
  src/mercadopago.ts        Cliente REST de MercadoPago

firestore.rules           Reglas de seguridad de Firestore
storage.rules              Reglas de seguridad de Storage
firestore.indexes.json     Índices compuestos requeridos por las consultas de la app
firebase.json               Configuración del proyecto Firebase (rules, functions, emuladores)
eas.json                    Perfiles de build de EAS (development/preview/production)
```

## Requisitos previos

- Node.js 20+
- Cuenta de [Firebase](https://console.firebase.google.com/) (plan **Blaze**, necesario porque
  las Cloud Functions hacen llamadas salientes a la API de MercadoPago; el plan Blaze igual
  tiene una capa gratuita generosa).
- Cuenta de [Expo](https://expo.dev/) para compilar con EAS Build.
- Cuenta de [MercadoPago Developers](https://www.mercadopago.com.uy/developers) para los pagos.
- Para publicar: cuenta de **Apple Developer** (99 USD/año) y **Google Play Console** (25 USD pago único).
  Esto lo tienen que crear ustedes — no es algo que se pueda generar automáticamente.

## Puesta en marcha

### 1. Instalar dependencias

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Crear el proyecto de Firebase

1. Andá a la [consola de Firebase](https://console.firebase.google.com/) y creá un proyecto nuevo.
2. Activá **Authentication** → método "Email/contraseña".
3. Activá **Firestore Database** (modo producción).
4. Activá **Storage**.
5. Agregá una app "Web" dentro del proyecto (aunque la app sea móvil, el SDK de Firebase para
   Expo usa la configuración de la app web) y copiá las credenciales que te da.

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Completá `.env` con las credenciales del paso anterior (todas empiezan con `EXPO_PUBLIC_FIREBASE_`).

### 4. Desplegar reglas de seguridad e índices

```bash
npm install -g firebase-tools   # si no lo tenés instalado
firebase login
firebase use --add               # elegí el proyecto que creaste
firebase deploy --only firestore:rules,firestore:indexes,storage
```

### 5. Configurar y desplegar las Cloud Functions (pagos con MercadoPago)

1. En [MercadoPago Developers](https://www.mercadopago.com.uy/developers/panel/app), creá una
   aplicación y obtené tu **Access Token** (usá el de prueba/sandbox mientras desarrollás).
2. Guardalo como secreto de Cloud Functions:
   ```bash
   firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN
   ```
3. Desplegá las funciones:
   ```bash
   firebase deploy --only functions
   ```

### 6. Correr la app

```bash
npm run start
```

Escaneá el QR con la app **Expo Go** (Android/iOS) o corré `npm run android` / `npm run ios`
con un emulador/simulador configurado.

> Nota: `expo-image-picker`, `expo-location` y otros módulos nativos funcionan en Expo Go para
> probar, pero para funcionalidades 100% nativas (o antes de publicar) conviene generar un
> **development build** con EAS (ver abajo).

## Verificación de identidad (moderación manual)

Las solicitudes de verificación quedan en la colección `verificationRequests` de Firestore con
`estado: "pendiente"`. Para aprobar o rechazar una:

1. Abrí la consola de Firebase → Firestore → `verificationRequests`.
2. Revisá las fotos del documento (URLs de Storage guardadas en el documento).
3. Editá el campo `estado` a `"verificado"` o `"rechazado"` (y opcionalmente `motivoRechazo`).
4. Una Cloud Function (`onVerificationRequestUpdated`) propaga automáticamente el estado al
   perfil público del usuario.

Para un volumen mayor de solicitudes, el siguiente paso natural es un panel admin propio (web,
por ejemplo con Next.js + Firebase Admin SDK) en vez de hacerlo a mano desde la consola.

## Pagos con MercadoPago

- El flujo actual usa **Checkout Pro**: la Cloud Function `createPaymentPreference` crea la
  preferencia de pago y la app abre la URL de checkout en el navegador del dispositivo.
- `mercadopagoWebhook` recibe la notificación de pago aprobado y actualiza la reserva a
  `estado: "pagada"`.
- Antes de salir a producción, cambiá el Access Token de sandbox por el de producción
  (`firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN`) y agregá el flujo de comisión del
  marketplace (retener un % antes de liquidar al prestador) si lo necesitan — hoy el monto
  cobrado es el precio acordado completo.

## Compilar la app (EAS Build)

```bash
npm install -g eas-cli
eas login
eas init          # vincula el proyecto a tu cuenta de Expo
eas build --profile preview --platform android   # genera un .apk para probar
eas build --profile production --platform android
eas build --profile production --platform ios     # requiere cuenta de Apple Developer
```

EAS Build compila en la nube, así que **no necesitás una Mac** para generar el build de iOS.

## Publicar en las tiendas

- **Google Play**: `eas submit --platform android` (requiere cuenta de Google Play Console y
  el paquete `uy.soloservicios.app` registrado, o cambiá el `package` en `app.json`).
- **App Store**: `eas submit --platform ios` (requiere cuenta de Apple Developer, certificados
  que EAS puede generar automáticamente, y completar la ficha de la app en App Store Connect).

Estos pasos requieren las cuentas de desarrollador mencionadas arriba — no pueden automatizarse
sin las credenciales de ustedes.

## Qué falta / próximos pasos sugeridos

- **Notificaciones push** (Expo Notifications + FCM) para avisos de nuevos mensajes/reservas.
- **Checkout embebido** (WebView) en vez de abrir el navegador externo para pagar.
- **Comisión del marketplace** en el cálculo del pago (hoy se cobra el 100% al prestador).
- **Panel admin** dedicado para verificación de identidad y moderación de contenido.
- **Términos y condiciones / política de privacidad** — obligatorios para publicar en ambas tiendas.
- Tests automatizados (actualmente no hay suite de tests).
