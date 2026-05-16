# FollowBack

FollowBack es una app web para descubrir emprendimientos, ver sus redes sociales y construir una comunidad de apoyo visible entre marcas, artistas, creadores y negocios emergentes.

El producto se presenta como un directorio inteligente con red de apoyo, no como un sistema de automatizacion de follows externos. Todo followback es manual y transparente.

## Stack

- React
- Vite
- TypeScript
- Firebase Authentication
- Cloud Firestore
- Firebase Storage opcional
- Firebase Hosting
- GitHub Actions

## MVP incluido

- Landing publica en `/`
- Login en `/login`
- Onboarding de emprendimiento en `/onboarding`
- Directorio filtrable en `/discover`
- Perfil publico en `/v/:slug`
- Vista de redes en `/ventures/:slug/networks`
- Dashboard en `/dashboard`
- Favoritos en `/favorites`
- Mapa de relaciones en `/network-map`
- Settings en `/settings`
- Reglas iniciales de Firestore
- Workflows de CI, preview y deploy productivo

## Notas de ejecucion

La app esta preparada para dos modos:

1. Modo demo local.
   Si no defines `VITE_FIREBASE_*`, la app sigue funcionando con datos seed y login demo.
2. Modo Firebase real.
   Si defines `API key`, `auth domain`, `project id`, `messaging sender id` y `app id`, el boton de Google Login queda habilitado y el proyecto puede desplegarse con Firebase Hosting.

El store principal del MVP corre en `localStorage` para que el flujo completo sea usable sin bloquear el desarrollo mientras se conectan colecciones reales de Firestore.

## Instalacion local

```bash
npm install
cp .env.example .env
npm run dev
```

Valida calidad con:

```bash
npm run lint
npm run typecheck
npm run test -- --run
npm run build
```

## Variables de entorno

Archivo `.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
# Optional while Storage is disabled
VITE_FIREBASE_STORAGE_BUCKET=
# Optional if you enable Analytics
VITE_FIREBASE_MEASUREMENT_ID=
```

## Configuracion de Firebase

1. Crea un proyecto en Firebase.
2. Activa Authentication con Google.
3. Activa Firestore en modo nativo.
4. Registra una app web y copia la configuracion a `.env`.
5. Instala Firebase CLI si vas a desplegar desde tu maquina:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

7. Publica reglas e indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

8. Publica hosting:

```bash
npm run build
firebase deploy --only hosting
```

## GitHub Actions

Workflows incluidos:

- `.github/workflows/ci.yml`
  Corre en `pull_request` y `push` a `main`.
  Ejecuta `npm ci`, `lint`, `typecheck`, `test` y `build`.

- `.github/workflows/firebase-hosting-pull-request.yml`
  Genera previews de Firebase Hosting para cada PR hacia `main`.

- `.github/workflows/firebase-hosting-merge.yml`
  Publica automaticamente a produccion al hacer `push` o merge a `main`.
  Despliega Hosting y Firestore. No despliega Storage mientras el proyecto siga en Spark.

## GitHub Secrets requeridos

Configura estos secrets en `Settings -> Secrets and variables -> Actions`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_FOLLOWBACK`

Si no quieres duplicar el project id, los workflows tambien aceptan `VITE_FIREBASE_PROJECT_ID` como fallback para el deploy.
`VITE_FIREBASE_STORAGE_BUCKET` es opcional mientras Storage siga deshabilitado.

## Service account para GitHub Actions

El secret que ya espera este repo es:

- `FIREBASE_SERVICE_ACCOUNT_FOLLOWBACK`

Ese secret debe guardar el JSON completo de una service account de Google Cloud, no una ruta ni un token suelto.

### Como crearlo

1. Entra al proyecto correcto en Google Cloud Console.
2. Ve a `IAM & Admin -> Service Accounts`.
3. Crea una nueva cuenta de servicio, por ejemplo `github-actions-followback`.
4. Asignale como minimo permisos para este repo:
   - `Firebase Hosting Admin`
  - `Firebase Admin` para publicar recursos Firebase desde CLI
  - `Cloud Datastore Index Admin` para publicar indexes de Firestore
  - `Service Usage Admin` para habilitar y consultar APIs requeridas por Firebase CLI
  - `Cloud Run Viewer` solo si despues usas rewrites de Hosting hacia Functions o Cloud Run
5. Abre esa cuenta de servicio y crea una clave nueva tipo `JSON`.
6. Descarga el archivo.
7. Copia el contenido completo del JSON y guardalo en GitHub como secret con nombre exacto `FIREBASE_SERVICE_ACCOUNT_FOLLOWBACK`.

### Que hace en este repo

- El action de preview y producción de Hosting usa `firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_FOLLOWBACK }}`.
- El workflow de producción ahora tambien usa ese mismo JSON para autenticarse con Firebase CLI y ejecutar:

```bash
firebase deploy --only firestore
```

Eso publica desde el repositorio:

- `firestore.rules`
- `firestore.indexes.json`

No lo hago en el workflow de PR porque no conviene tocar reglas reales desde previews.

## Firebase Storage y plan gratuito

Si quieres mantener el proyecto en el plan gratuito Spark, no uses Firebase Storage por ahora.

La documentacion oficial de Firebase indica que Cloud Storage for Firebase requiere el plan Blaze desde octubre de 2024, aunque siga teniendo cuotas gratuitas de uso una vez activas billing. Fuentes:

- [Cloud Storage for Firebase: Get started on web](https://firebase.google.com/docs/storage/web/start)
- [Firebase pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans?hl=en-419)

En este repo eso no bloquea el MVP porque:

- `logoURL` y `coverURL` aceptan URLs externas
- el formulario local puede previsualizar imagenes sin subirlas a Firebase
- los workflows ya no intentan desplegar `storage.rules`
- `firebase deploy` local ya no incluye Storage por defecto

Cuando decidas pasar a Blaze, puedes reactivar Storage en dos pasos:

1. Inicializar Firebase Storage en la consola del proyecto.
2. Volver a agregar la seccion `storage` en `firebase.json` y cambiar el workflow de producción para desplegar tambien `storage`.

## Estructura

```txt
followback/
├── .github/workflows/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   └── types/
├── .env.example
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
└── README.md
```

## Seguridad y alcance

- No se automatizan follows en redes externas.
- El MVP limita a un emprendimiento por usuario.
- `firestore.rules` es una base inicial. Antes de produccion conviene endurecer validacion de campos, tipos y transiciones de estado.

## Proximos pasos razonables

- Cambiar el store local por colecciones reales de Firestore en servicios.
- Subir logos y covers a Firebase Storage en vez de guardar data URLs.
- Agregar panel admin, reportes moderados y analytics mas detallada.
- Anadir tests de integracion para formularios y flujos protegidos.
