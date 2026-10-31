# Sesión 18 — Navegación con Expo Router SDK 57 (2026-10-30)

## Objetivo

Revisar la navegación de `App/Smart-Ticket` (rutas por archivos en `src/app`, grupos `(auth)`, detalle de evento, pestañas y layouts), describir su estado, detectar problemas (rutas sin tipar, flujo de autenticación, botón atrás, estados vacíos) y aplicar mejoras guiadas por la documentación de Expo Router SDK 57. Al final, cerrar la sesión con bitácora, memoria y actualización del skill de navegación.

## Qué se hizo

- Auditoría estática de la navegación actual y plan por fases de menor a mayor riesgo.
- Reorganización: Stack raíz con `(auth)`, `(tabs)` y `evento/[id]`; el detalle queda fuera de las pestañas y las URLs públicas se conservan.
- Protección de rutas centralizada con `Stack.Protected`, esperando la lectura de sesión; se quitaron guards y redirecciones duplicadas de login y dashboard.
- Retorno al enlace de evento tras login: una sola vez, con ID MongoDB validado y destino solo en memoria.
- Eliminación de `as any` en navegación; helper `src/navigation/routes.ts` con validación de ID y vuelta segura.
- Atrás coherente: historial primero; sin historial, detalle/publicación → Eventos y registro → Login. Durante el PIN se vuelve al formulario.
- Publicación conserva el borrador al cambiar de pestaña, confirma el descarte y cancela redirecciones diferidas al perder foco.
- Estados y recuperación: 404 de evento distinto de error recuperable con reintento, respuestas de API validadas, catálogo vacío distinto de filtros sin resultados, botones de estado accesibles.
- Sesión: lectura/escritura/borrado con errores recuperables, sesión incompleta se limpia y el token se escribe al final. Web sigue con sesión en memoria.
- Herramientas: `expo lint` configurado, dependencias de desarrollo declaradas y correcciones de reglas de hooks sin desactivarlas.
- Documentación: `README` de la App, este doc, `MEMORY.md` y el skill `app-navigation` migrado a Expo Router.

## Archivos modificados

Nuevos:

- `DOCS/18-navegacion-expo-router-sdk57.md`
- `App/Smart-Ticket/src/app/(tabs)/_layout.tsx`
- `App/Smart-Ticket/src/app/+not-found.tsx`
- `App/Smart-Ticket/src/navigation/routes.ts`
- `App/Smart-Ticket/eslint.config.js` (generado por Expo)

Movidos a `App/Smart-Ticket/src/app/(tabs)/` (git los registra como borrado + alta):

- `index.tsx`, `eventos.tsx`, `dashboard.tsx`, `create-event.tsx`

Modificados:

- `.agents/skills/app-navigation/SKILL.md`
- `MEMORY.md`
- `App/Smart-Ticket/README.md`
- `App/Smart-Ticket/package.json`, `App/Smart-Ticket/package-lock.json`
- `App/Smart-Ticket/src/app/_layout.tsx`
- `App/Smart-Ticket/src/app/(auth)/_layout.tsx`, `(auth)/login.tsx`, `(auth)/register.tsx`
- `App/Smart-Ticket/src/app/evento/[id].tsx`, `App/Smart-Ticket/src/app/explore.tsx`
- `App/Smart-Ticket/src/components/EventCard.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `LoadingDots.tsx`, `Toast.tsx`, `app-tabs.tsx`, `app-tabs.web.tsx`
- `App/Smart-Ticket/src/context/SessionContext.tsx`
- `App/Smart-Ticket/src/hooks/use-session.ts`, `use-color-scheme.web.ts`
- `App/Smart-Ticket/src/screens/EventDetailScreen.tsx`, `EventosScreen.tsx`, `DashboardScreen.tsx`, `CreateEventScreen.tsx`
- `App/Smart-Ticket/src/services/eventService.ts`

No se editó `AGENTS.md` ni `App/Smart-Ticket/AGENTS.md`: los cambios que se hicieron durante la implementación se revirtieron al cerrar.

## Decisiones (y por qué)

- Stack raíz separado de las pestañas — las URLs actuales se conservan y el detalle puede abrirse sobre ellas con historial real.
- `Stack.Protected` en lugar del guard imperativo — una sola fuente de verdad para la sesión y sin rutas protegidas visibles tras logout.
- Mantener login para catálogo, detalle y publicación — continúa la política existente; cambiar el acceso público es una decisión de producto aparte.
- Recuperar el evento solicitado tras login, con ID validado y consumo único — evita perder deep links sin aceptar destinos arbitrarios.
- Destino pendiente y sesión web solo en memoria — no se persiste estado transitorio y se evita añadir dependencias.
- Atrás con historial primero y destinos explícitos sin historial — evita pantallas sin salida en enlaces directos.
- Conservar el borrador entre pestañas y pedir confirmación al salir — evita pérdida accidental de datos ya capturados.
- `/explore` redirige a Eventos y las acciones de Inicio quedan deshabilitadas — eran restos de la plantilla, sin pantallas destino.
- Diferenciar vacío real, sin resultados, 404 y error recuperable — mensajes y acciones útiles distintas para cada caso.
- Declarar `eslint` y `eslint-config-expo` como dependencias de desarrollo — el usuario lo autorizó para que el lint sea reproducible.
- Fusionar el cierre en este doc 18 en lugar de crear un 19 — el número ya estaba ocupado por esta misma sesión (decisión del usuario).

## Problemas y soluciones

- Referencia residual a `sessionLoading` tras quitar el guard del dashboard — error de `tsc`; se eliminó el bloque y la variable.
- `expo lint` sin configuración — Expo generó `eslint.config.js` automáticamente; después se declararon las dependencias.
- Reglas `react-hooks` (`set-state-in-effect`, `immutability`, dependencias) — carga inicial movida a `useFocusEffect` con bandera de cancelación, lecturas iniciales sin `setState` síncrono y `.set()` en valores de Reanimated.
- Hidratación del tema en web con `setState` en efecto — se sustituyó por `useSyncExternalStore` con snapshot de servidor.
- `npx expo install` falló con `EALLOWSCRIPTS` por configuración global de npm del entorno — se actualizó el lockfile con scripts desactivados; `package.json` conservó las versiones declaradas.
- `usePreventRemove` en SDK 57 importa de `expo-router/react-navigation` y entrega `{ data }`, no `repeat` (API de SDK 58) — se continuó la acción con `navigation.dispatch(data.action)`.
- Doble confirmación al descartar el formulario — bandera de descarte autorizado y una sola ruta de salida; la prueba confirmó un único diálogo.
- El detalle no reiniciaba estado al cambiar de `id` — se extrajo el contenido a un componente con `key={id}` y se descartan respuestas obsoletas.
- Enlaces con ID inválido provocaban petición innecesaria — validación previa y mensaje de enlace inválido sin llamar a la API.
- Script de prueba: el botón de acceso dice «Entrar», no «Iniciar sesión» — se ajustó el selector.
- `history.back()` en la prueba cerraba el target de CDP — se toleró ese error y se validó el resultado en la vista.
- Cambios temporales en ambos `AGENTS.md` durante la implementación — revertidos con `git restore` para respetar la regla de no editarlos en el cierre.
- El correo del remitente verificado estaba literal en `MEMORY.md` — se retiró por la regla de no incluir datos de contacto en la memoria.

## Pendientes

- Pruebas manuales en Android e iOS: botón físico/gesto, arranque en frío, tema claro/oscuro y pantalla pequeña.
- Fallos reales de SecureStore (lectura, escritura y borrado) y sesión parcial en dispositivo.
- Alojamiento web estático: fallback de `/evento/<id>` y de rutas desconocidas. La prueba local con fallback no certifica el hosting.
- Definir si `/explore` se elimina definitivamente en lugar de redirigir.
- Autorización de publicación por organizador en API; hoy cualquier sesión puede publicar.
- Decidir persistencia de sesión en web [POR CONFIRMAR].
- Tests automatizados del flujo de navegación y CI (install + lint + tsc).
- Publicar la revisión por OTA/APK; el APK actual no incluye estos cambios.
- Revisar si `dist/` debe regenerarse [POR CONFIRMAR].

## Próximo paso

Confirmar el commit de la rama `feature/navegacion-sdk57` y, enseguida, ejecutar `npm run android` para validar en dispositivo la matriz nativa: arranque con y sin sesión, login, deep link `smartticket://evento/<id>`, botón atrás, PIN → atrás y logout.

## Verificación

- `npm run lint`: sin errores ni advertencias.
- `npx tsc --noEmit`: sin errores, con tipos de ruta regenerados por el generador de Expo CLI SDK 57 (no se editó `.expo/types` a mano).
- `git diff --check`: sin errores de espacio.
- `expo export --platform web`: correcto, 16 rutas estáticas, en directorio temporal (sin reemplazar `dist/`).
- `expo export --platform android`: bundle Hermes generado correctamente; comprueba empaquetado, no ejecución.
- Prueba de navegación en Brave headless vía CDP, con API simulada y servidor estático local, sin excepciones JavaScript: enlace directo → Login → evento, detalle sin pestañas, retorno y cuatro pestañas, borrador conservado y descarte único, error de red con reintento, 404, catálogo vacío con actualización, filtros y limpieza, ID inválido sin petición, logout + atrás sin contenido protegido y página no encontrada.
- Sin verificar todavía: dispositivo Android/iOS, SecureStore real y fallback del hosting. Filas pendientes de la matriz original:

| Caso | Resultado esperado |
| --- | --- |
| Arranque nativo con sesión válida, ausente o parcial | Restaurar sesión o mostrar Login; nunca contenido protegido mientras carga |
| SecureStore falla al leer/guardar/borrar | Error visible y reintento; sin afirmar persistencia exitosa |
| Deep link con app cerrada/abierta, con/sin sesión | Evento tras login, destino consumido una vez; logout no lo recupera |
| Botón Android y gesto iOS | Regreso coherente; atrás no reabre pantallas protegidas tras logout |
| Registro → PIN → atrás → verificación → éxito | Conservar flujo; sin redirección desde una pantalla abandonada |
| Crear evento y cambiar de pestaña durante espera/éxito | Sin redirección tardía ni publicación duplicada; salida explícita al catálogo |
| Pantalla pequeña, tema claro/oscuro, lector de pantalla | Controles accesibles y estados legibles |
| Hosting real: recargar `/evento/<id>` o URL inexistente | Fallback correcto |

Herramientas usadas: documentación versionada de SDK 57 y Context7 (descartando APIs de SDK 58), skill `app-navigation`, `pro-development` y `mobile-ui`. No se cambió `constants/api.ts`, `app.json`, `eas.json` ni `runtimeVersion`; no hubo commit, push ni publicación. La prueba usó datos sintéticos en memoria y no escribió en Railway.
