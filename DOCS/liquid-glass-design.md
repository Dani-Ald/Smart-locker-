# Smart Ticket — Premium Iridescent Liquid Glass

## Implementación (2026-10-31)

Tokens en `App/Smart-Ticket/src/constants/theme.ts`, superficie y fondo en
`src/components/ui/GlassSurface.tsx`. Utilizar `WalletColors` claro/oscuro:
texto sólido, cristal de alta opacidad, borde luminoso, cyan/violeta/rosa puntuales.
La información y el contraste tienen prioridad sobre la transparencia.

- iOS compatible: `GlassView` regular con comprobación de disponibilidad.
- Android: composición translúcida con gradiente; **no es blur nativo**.
- Web: `backdropFilter` sobre una base legible si el navegador lo ignora.
- Una superficie protagonista por sección; mantener controles de lectura sólidos.
- Radios de cristal: `Radius.glass`; botones de al menos 44 pt y textos escalables.
- Native Tabs conserva Boletos, Explorar, Historial y Perfil. La barra web se ancla abajo.
- Barra de estado explícita por tema desde el layout raíz.

## Ticket y accesibilidad

Ticket con título completo, estado, categoría, fecha y lugar sin truncamiento.
Entrada de 1000 ms, inclinación máxima 5°, desplazamiento 16 pt y un reflejo cyan.
Se ejecuta una vez por boleto/cuenta durante la vida del proceso. Cancelar y
estabilizar al perder foco, pasar a segundo plano o activar movimiento reducido.
La presión utiliza escala 0.99; con movimiento reducido solo opacidad.

El QR y todos sus ancestros en `TicketDetailScreen` permanecen estáticos.
No reutilizar esta entrada, transparencias ni reflejos alrededor del QR.
Las pantallas mantienen biometría nativa, reseñas y enlaces externos existentes.
Explorar admite scroll para alturas pequeñas y texto aumentado.

## Sincronización y conservación de datos

`WalletProvider` crea un almacén por sesión compartido entre las pestañas. Una
operación en vuelo agrupa refresh repetidos. NetInfo es el disparador inicial;
un cambio de conectividad durante la operación solicita una ejecución posterior.
Las generaciones descartan resultados de suscripciones abandonadas.

`ticketRepository.ts` inicializa el esquema una vez y serializa **también las
lecturas** en la conexión privada. BEGIN, upsert, eliminación y COMMIT son una
unidad. Si BEGIN falla no se intenta rollback; los fallos posteriores consultan
si sigue activa la transacción antes de revertir. El primer error se conserva.
No hay migración destructiva ni borrado de la base.

La interfaz solo muestra Sincronizado después de guardar y leer correctamente.
Un fallo API/SQLite no se convierte en «sin conexión». El estado previo permanece
visible ante un fallo remoto o de escritura. Diagnósticos solo en `__DEV__`;
los logs incluyen etapa, nunca SQL parametrizado, QR, tokens ni errores crudos.
La caché web continúa en memoria; no prometer persistencia tras recargar.

## Auditoría del icono

Ejecutar `node scripts/audit-icon.cjs` desde la app. Fuente `BOT.png`: 1254²,
símbolo cuadrado redondeado (no circular). Las variantes de 1024² contienen el
dibujo a 850 px (general) y 620 px (adaptativo).

La medición conservadora del contenido no blanco da radios aproximados de
512 px y 374 px respectivamente. Ni +10% ni +15% conservan el símbolo completo
dentro del círculo de 512 px general o del área segura adaptativa de 313 px
(66/108 del diámetro). Por ello **no se ampliaron los assets**. Los márgenes son
parte del recurso actual, no una propiedad del layout de React Native.
Esta prueba geométrica no sustituye capturas de launchers ni prueba todas las
máscaras. Una nueva composición requiere decisión visual y después un binario.

## Verificación reproducible

Desde `App/Smart-Ticket`:

```sh
node --test scripts/wallet-repository.test.cjs scripts/wallet-sync.test.cjs
npm run lint
npx tsc --noEmit
npx expo export --platform all --output-dir <directorio-temporal>
node scripts/audit-icon.cjs
```

Tests de Node 24 con SQLite real en memoria y adaptador Expo simulado: concurrencia,
atomicidad ante fallo parcial, preservación del primer error, aislamiento por
cuenta, single-flight, respuesta tardía, caché offline y fallo de lectura.
No prueban el puente nativo ni reproducen por sí solos el fallo del dispositivo.

Se reprodujo el texto `cannot rollback - no transaction is active` usando el
método `withTransactionAsync` extraído de la versión instalada y dos operaciones
solapadas sobre SQLite de Node. Confirma el mecanismo posible, no el origen exacto
del incidente Android. Las pruebas del repositorio corregido no usan ese método.

### Pendiente de dispositivo / aprobación visual

- Android/iOS: 20 refresh, cambios rápidos de pestaña y modo avión; cerrar/reabrir
  sin red y comprobar boletos anteriores. Confirmar ausencia del rollback reportado.
- Escanear QR con lector independiente y verificar restauración del brillo.
- Claro/oscuro, 320 pt, fuente 200%, TalkBack/VoiceOver, movimiento reducido.
- Medir contraste sobre composición real y cuadros perdidos en Android de gama media.
- Comparar capturas de las cuatro pantallas con referencias y probar biometría,
  logout, reseñas y retorno de los destinos externos.
- Ningún rendimiento, fidelidad visual ni corrección nativa se considera confirmado
  únicamente porque lint, TypeScript y exportación pasen.
