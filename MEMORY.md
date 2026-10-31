# MEMORY.md — Smart Locker

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual

- API (Railway): `eventos` (lista/detalle/crear) y `usuarios` (registro, login, verificar/reenviar PIN) operativos.
- Verificación por correo funcional vía Brevo HTTPS (commit `105ef7f`); remitente verificado en la cuenta del proyecto.
- App Expo SDK 57: auth, catálogo, detalle, dashboard y `create-event` funcionales; APK publicado + OTA activos.
- Navegación reorganizada en rama `feature/navegacion-sdk57`: Stack raíz + `(auth)` + `(tabs)`, detalle fuera de pestañas, URLs conservadas. Aún no publicada por OTA/APK.
- No existe `WEB/` aunque el doc 03 la contempla.
- Sin tests automatizados ni lint en API; App con `expo lint` y tsc estricto.
- Última sesión: `DOCS/18-navegacion-expo-router-sdk57.md`.

## Decisiones (y por qué)

- MongoDB Atlas con `dbName: 'test'` forzado en `API/src/db.js` — [POR CONFIRMAR].
- Brevo REST API (HTTPS 443) en vez de SMTP — Railway bloquea 25/465/587 en Hobby/Trial (doc 17).
- Auth propia sin JWT — [POR CONFIRMAR]; la API sigue sin validar el token.
- Protección cliente con `Stack.Protected` y espera de lectura de sesión — una sola fuente de verdad, sin guards duplicados ni rutas protegidas tras logout.
- Login sigue exigido para catálogo, detalle y publicación — política previa; falta autorización real en API.
- Enlace a evento con ID validado se recupera una vez tras login, solo en memoria — evita destinos arbitrarios y estado persistente transitorio.
- Web mantiene sesión en memoria; nativo usa SecureStore con errores recuperables — sin dependencias nuevas.
- Atrás: historial primero; sin historial detalle/publicación → Eventos y registro → Login. PIN vuelve al formulario; borrador conservado entre tabs.
- `/explore` redirige a Eventos y las acciones de Inicio muestran «Próximamente» — no existen pantallas destino.
- ESLint y `eslint-config-expo` como devDependencies — lint reproducible (autorizado en sesión 18).
- `codigoDev` en registro/reenvío — fallback de pruebas (doc 17). Rate limit 50/15 min (doc 14).

## Aprendizajes y errores a evitar

- No usar SMTP saliente en Railway Hobby/Trial: timeout silencioso.
- Ethereal como fallback ocultaba errores reales — eliminado en `4e452b1`.
- Variables de entorno con comillas/espacios rompen credenciales — usar `cleanVal()`.
- `DOCS/17` contiene claves reales ya en git: pendiente rotar y retirarlas.
- SDK 57: `usePreventRemove` viene de `expo-router/react-navigation` y entrega `data`, no `repeat` (eso es SDK 58).
- Reglas react-hooks de `expo lint`: evitar `setState` directo en efectos; usar `useFocusEffect` con bandera de cancelación y `.set()` en Reanimated.
- `npm install` falla con `EALLOWSCRIPTS` por `allow-scripts` global del entorno; usar `--package-lock-only --ignore-scripts`.
- No escribir correos ni contactos reales en docs o memoria: solo nombres de variables.

## Próximos pasos

- (ver "Forma de trabajar" en AGENTS.md: seguridad → auth real → flujo de boletos → WEB/ → tests/lint → CI)
- Navegación: commit de la rama, pruebas manuales Android/iOS, SecureStore real y fallback del hosting estático.
