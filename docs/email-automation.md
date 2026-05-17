# Correos desde Admin y automatizaciones

## Que incluye

- Campanas manuales desde `/admin`
- Correo de bienvenida cuando se crea el documento del usuario
- Correo cuando `onboardingCompleted` pasa de `false` a `true`

## Proveedor usado

La implementacion usa Cloud Functions for Firebase + Resend.

## Variables y secretos requeridos

Configura estos parametros para Functions:

- `MAIL_FROM`
- `APP_BASE_URL`
- `EMAIL_AUTOMATION_ENABLED`
- `ADMIN_CAMPAIGNS_ENABLED`

Configura este secret:

- `RESEND_API_KEY`

## Ejemplo

```bash
cd functions
npm install
cd ..
firebase functions:secrets:set RESEND_API_KEY
firebase deploy --only functions
```

## Deploy desde GitHub

El workflow de produccion tambien puede desplegar `functions` desde GitHub Actions.

Secrets requeridos en `Settings -> Secrets and variables -> Actions`:

- `FIREBASE_PROJECT_ID` o `VITE_FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_FOLLOWBACK`
- `DEPLOY_FUNCTIONS`
- `RESEND_API_KEY`
- `MAIL_FROM`
- `APP_BASE_URL`
- `EMAIL_AUTOMATION_ENABLED`
- `ADMIN_CAMPAIGNS_ENABLED`

El workflow:

1. instala dependencias de `functions`
2. genera `functions/.env` en el runner
3. sincroniza `RESEND_API_KEY` con Secret Manager
4. despliega `firestore` y `functions`
5. despliega Hosting

Si `DEPLOY_FUNCTIONS` no es `true`, el workflow omite todos esos pasos y despliega solo `firestore` y `hosting`.

Si prefieres establecer parametros antes del deploy, puedes crear `functions/.env` con:

```env
MAIL_FROM=no-reply@tudominio.com
APP_BASE_URL=https://tu-dominio.com
EMAIL_AUTOMATION_ENABLED=true
ADMIN_CAMPAIGNS_ENABLED=true
```

Puedes partir de [`functions/.env.example`](/home/yisus/Documents/workspace/UFPSO/followback/functions/.env.example:1).

Si no existe ese archivo, Firebase CLI te pedira los valores durante el deploy porque estan declarados con `defineString`.

Valores recomendados:

- `MAIL_FROM=no-reply@tudominio.com`
- `APP_BASE_URL=https://tu-dominio.com`
- `EMAIL_AUTOMATION_ENABLED=true`
- `ADMIN_CAMPAIGNS_ENABLED=true`

Si quieres dejar los correos listos pero apagados al inicio:

- `EMAIL_AUTOMATION_ENABLED=false`
- `ADMIN_CAMPAIGNS_ENABLED=false`

## Requisitos operativos

- Tener un dominio verificado en Resend
- Usar un remitente valido en `MAIL_FROM`
- Desplegar `functions` y `firestore.rules`
- Tener el proyecto en plan `Blaze` si vas a usar Cloud Functions con secretos de Firebase

## Como obtener cada variable

### `RESEND_API_KEY`

1. Crea una cuenta en Resend.
2. Entra al dashboard de Resend.
3. Ve a `API Keys`.
4. Crea una nueva clave para backend.
5. Guardala en Firebase con:

```bash
firebase functions:secrets:set RESEND_API_KEY
```

### `MAIL_FROM`

1. En Resend, verifica un dominio propio.
2. Una vez verificado, puedes enviar desde cualquier direccion de ese dominio.
3. Elige un remitente, por ejemplo:

```txt
no-reply@tudominio.com
```

4. Configuralo al desplegar Functions cuando Firebase lo solicite.

Sin dominio propio no puedes enviar correos reales a tus usuarios con Resend. Para desarrollo puedes usar `resend.dev`, pero solo para enviar pruebas a tu propia direccion.

### `APP_BASE_URL`

Es la URL publica de la app. Ejemplos:

- `http://localhost:5173` para pruebas locales
- `https://followback-30d3f.web.app`
- `https://tudominio.com`

No necesitas dominio propio para la app. Puedes usar la URL por defecto de Firebase Hosting (`*.web.app` o `*.firebaseapp.com`) como `APP_BASE_URL`.

### `EMAIL_AUTOMATION_ENABLED`

Controla los correos automaticos:

- bienvenida al registrarse
- confirmacion al completar onboarding

Usa `true` o `false`.

### `ADMIN_CAMPAIGNS_ENABLED`

Controla si el dashboard admin puede lanzar campanas manuales.

Usa `true` o `false`.

## Flujo esperado

1. El usuario se autentica por primera vez y se crea su documento en `users`.
2. Se envia el correo de bienvenida.
3. Cuando completa onboarding y el usuario pasa a `onboardingCompleted: true`, se envia el correo de publicacion/completitud.
4. Desde `/admin`, un usuario con rol `admin` puede lanzar campanas a segmentos de usuarios activos.
