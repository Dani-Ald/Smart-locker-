# Guion ejecutivo — Smart Ticket

**Duración orientativa:** 15 minutos, incluida la demostración. Las preguntas pueden atenderse al terminar, según el tiempo autorizado. Las cifras y funciones se presentan con el alcance comprobado en las fuentes.

Los tiempos son orientativos: portada 0:25; equipo 0:35; oportunidad 1:00; negocio 0:55; desarrollo 0:55; arquitectura 0:55; ecosistema 0:45; web 1:00; wallet 1:00; recorrido móvil 2:10; confianza 1:00; demostración 3:45; cierre 0:35. **Total: 15:00.**

## 1. Los mejores momentos comienzan aquí — 0:25

> Buenos días. Somos el equipo Smart Ticket, del séptimo semestre de Ingeniería en Tecnologías de la Información y Comunicaciones. Nuestro proyecto nace de una idea sencilla: acercar los eventos de nuestra región a las personas mediante una experiencia digital clara, práctica y accesible. Hoy presentaremos el valor del proyecto, sus componentes y una demostración de la experiencia.

**Transición:** “Detrás de esta propuesta hay un equipo que trabajó desde la investigación hasta la construcción de la experiencia”.

## 2. Cuatro perspectivas. Una misma visión — 0:35

> Nuestro equipo está integrado por Ricardo López Cruz, Daniel Aldana López, Diego Antonio Badillo Morales y Gerardo Daniel Olivares Álvarez. Durante la investigación, Ricardo participó en el diseño de instrumentos; Daniel, en entrevistas con organizadores; Diego, en la aplicación de encuestas a asistentes; y Gerardo, en la observación de campo. El análisis se realizó en equipo. Estas actividades ayudaron a conectar la propuesta tecnológica con las personas a quienes va dirigida.

**Nota para el equipo:** Las actividades anteriores aparecen en `DOCS/Presentacion/boletos_V1.4.docx`; no equivalen necesariamente a los roles definitivos de desarrollo. Confirmar esos roles y añadir las fotografías originales cuando estén disponibles. El PDF anterior consultado incluye nombres, pero no fotografías de los integrantes.

## 3. Una oportunidad nacida en la región — 1:00

> La experiencia de asistir a un evento comienza antes de llegar al recinto: incluye encontrar información, elegir el evento y obtener acceso. En la investigación académica recogimos opiniones de asistentes y organizadores de eventos regionales. Ocho de diez asistentes encuestados manifestaron disposición a comprar boletos por internet o una aplicación. En cuanto al pago, cuatro prefirieron tarjeta, cuatro efectivo y dos transferencia. Además, tres de diez mencionaron experiencia propia o cercana con boletos falsificados o duplicados. Estos resultados orientaron una propuesta que privilegia comodidad, información accesible y confianza.
>
> Es importante darles su contexto: la encuesta incluyó diez asistentes y se entrevistó a tres organizadores; fue una muestra por conveniencia. Son señales exploratorias útiles para el proyecto, no porcentajes extrapolables a toda la región.

**Fuente:** `DOCS/Presentacion/boletos_V1.4.docx`, secciones 9 y 11, septiembre de 2026.

**Transición:** “Con esas necesidades en mente, diseñamos una relación de valor para ambos lados del evento”.

## 4. Conectamos eventos con quienes quieren vivirlos — 0:55

> Smart Ticket se entiende como un marketplace de boletaje digital: reúne a organizadores, que acercan sus eventos al público, y a asistentes, que pueden descubrir experiencias y consultar sus boletos. Su planteamiento B2B2C refleja precisamente esa relación: la plataforma se vincula con organizadores y estos llegan al consumidor final. Ticketmaster es una referencia de esta lógica de intermediación, adaptada aquí a un enfoque regional.
>
> Para el organizador, el valor está en tener un canal digital para presentar su oferta; para el asistente, en encontrar información y contar con una experiencia móvil. La documentación también plantea una comisión por boleto como modelo de ingresos, sin que esto signifique que existan cobros o ingresos comerciales comprobados.

## 5. Construimos por etapas — 0:55

**Avanzar para revelar cada tarjeta.**

> Primero, el proyecto web documentado reúne elementos como catálogo, búsqueda y canales de contacto. Segundo, incorpora una vista de evento y una experiencia de reserva con temporizador. Tercero, la cuenta permite el registro y la verificación por correo. Cuarto, la aplicación móvil aporta una wallet para consultar boletos y su detalle.
>
> Las fuentes describen el sitio Entrada/tick y la app Smart Ticket en repositorios y contextos distintos. La relación técnica entre ambos debe comprobarse antes de presentar estos hitos como una transacción integrada.

**Transición:** “Para entender cómo se sostiene la experiencia, veamos las capas de la arquitectura”.

## 6. Una experiencia clara. Una arquitectura por capas — 0:55

**Avanzar cinco veces:** clientes; solicitudes; API; acceso a datos; persistencia y servicios complementarios.

> La experiencia comienza en los clientes digitales: una interfaz web y la aplicación móvil. La app se comunica con su API, que concentra servicios y media el acceso a la base de datos. La persistencia utiliza MongoDB; también intervienen servicios de correo y una copia local de la wallet en el dispositivo. Así se separa la interfaz del almacenamiento de información.
>
> El diagrama explica las responsabilidades de cada capa. La app y la web tienen servicios documentados; no aseguramos que compartan la misma API hasta comprobarlo.

## 7. Distintos componentes. Una experiencia conectada — 0:45

> El producto se expresa en diferentes puntos de contacto: la web comunica la oferta, la aplicación acompaña al asistente, los servicios intercambian información y los controles de cuenta aportan confianza. A ello se suma el diseño conceptual de un dispositivo físico que podría registrar conteos de acceso para convertirlos en información útil para quien organiza.
>
> Cada componente tiene una función distinta. En esta presentación, el dispositivo se muestra como diseño conceptual, no como una integración física ya demostrada.

## 8. Del descubrimiento a la gestión del evento — 1:00

> Veamos los dos recorridos. Una persona interesada descubre un evento, consulta sus detalles y puede crear una cuenta. El flujo documentado envía un código al correo para verificarlo. En la web analizada existe una experiencia de reserva con temporizador. Por su parte, quien organiza puede ingresar información para publicar un evento y utilizar los canales disponibles para acercarse al público.
>
> El reporte de la web describe el checkout como una reserva simulada; por eso no lo presentamos como un pago real. Tampoco se ha acreditado aquí que una compra de esa web genere automáticamente un boleto en la wallet.

**Si preguntan por identidad y reventa:** La verificación de correo no equivale a validar una credencial oficial. Los materiales consultados no prueban una validación con INE ni límites de compra por correo; no afirmar que esos controles ya operan.

## 9. Tu boleto te acompaña. También sin conexión — 1:00

> La wallet se pensó para que el boleto pueda acompañar a la persona el día del evento. Cuando hay conexión, la aplicación consulta la información disponible y actualiza la copia local. Cuando no hay conexión, puede mostrar los boletos que ya se sincronizaron previamente. Desde el detalle, la persona consulta datos del evento y el QR se representa en el dispositivo.
>
> La ventaja es la disponibilidad de información ya guardada. Esto no implica que se actualicen cancelaciones en tiempo real sin red ni que mostrar el QR sea, por sí solo, una validación física de acceso.

**Fuente:** `DOCS/19-wallet-offline-first.md`; contrastar con la versión instalada antes de la exposición.

## 10. Smart Ticket en cada momento — 2:10

**La diapositiva contiene diez escenas. Avanzar con las flechas de la diapositiva o con Siguiente. Los teléfonos son recreaciones visuales, no capturas reales.**

1. **Bienvenida:** “Al abrir la aplicación, su identidad presenta una experiencia consistente con la marca”.
2. **Carga:** “Durante la preparación se muestra un estado de carga mientras la aplicación recupera la información necesaria”.
3. **Inicio de sesión:** “La persona accede con correo y contraseña o puede comenzar el registro”.
4. **Registro:** “El formulario solicita datos básicos y comprueba el formato de la información”.
5. **Verificación:** “El código enviado al correo permite completar el paso de verificación”.
6. **Wallet:** “Aquí se reúnen los boletos disponibles; la copia local permite consultarlos después sin conexión”.
7. **Detalle:** “Se muestran los datos del evento y un QR representado localmente. La validación presencial depende del sistema de acceso”.
8. **Explorar:** “La app ofrece enlaces a la cartelera y a la publicación web”.
9. **Historial:** “La navegación incluye un espacio para consultar experiencias anteriores”.
10. **Perfil:** “La cuenta y sus opciones se concentran en el perfil”.

> La app cuenta con documentación de compilaciones APK para Android y de actualizaciones compatibles con su versión instalada. Las mejoras de interfaz y lógica compatibles pueden distribuirse mediante actualizaciones; los cambios nativos requieren una nueva compilación instalable. La disponibilidad del APK específico debe comprobarse antes de mostrarlo.
>
> En seguridad, la app utiliza almacenamiento seguro para información de sesión y una caché local separada por cuenta. No afirmamos que toda la wallet use AES: no se identificó evidencia suficiente para atribuir ese cifrado al almacenamiento del boleto.

**Fuentes:** `App/Smart-Ticket/src/app/`, `src/screens/`, `src/hooks/use-session.ts`, `DOCS/10-sesion-eas-build-apk-android.md` y `DOCS/11-sesion-arm64-eas-update.md`. Confirmar siempre el comportamiento de la compilación usada en la demo.

## 11. Información protegida. Operación más clara — 1:00

> La confianza se construye en varias capas. En la cuenta, se utiliza protección de contraseñas mediante scrypt, verificación por correo y límites de intentos. En la arquitectura, la aplicación se comunica con servicios que median el acceso a la base de datos. En el dispositivo, la sesión usa almacenamiento seguro y la wallet mantiene una separación de registros por cuenta.
>
> La referencia académica para hablar de confidencialidad, integridad y disponibilidad es la NMX-I-27001-NYCE-2015; utilizarla como referencia no significa contar con certificación o cumplimiento auditado. Por separado, el diseño del dispositivo de conteo ilustra cómo un dato del recinto podría apoyar al organizador. Contar personas, verificar identidad y validar un boleto son procesos diferentes.

**Transición:** “Con esta perspectiva de confianza y operación, pasemos a la experiencia que sí podemos mostrar”.

**Nota técnica:** La presencia de navegación protegida en la app no demuestra autorización de rutas en el servidor. Verificar cada afirmación en la versión desplegada.

## 12. Ahora, vivámoslo — 3:45

**Antes de comenzar:** teléfono y proyección preparados; correo y evento de prueba; conectividad; boleto previamente sincronizado para el segmento offline; respaldo en capturas o video. No mostrar datos personales, identificaciones reales, códigos vigentes, tokens ni secretos.

1. **Descubrir (0:35).** Mostrar la cartelera disponible y abrir un evento. “Empezamos donde la persona descubre su próxima experiencia”.
2. **Crear cuenta (1:10).** Abrir el registro de la aplicación o del sitio comprobado, capturar datos ficticios y mostrar la recepción de correo sin exponer el código. Completar la verificación fuera de la vista si es necesario.
3. **Wallet (1:20).** Iniciar sesión con una cuenta de prueba de la API que consume la app, abrir la wallet y el detalle. Si el boleto fue sincronizado antes, activar modo avión y enseñar su consulta. No afirmar sincronización entre cuentas de web y app sin prueba.
4. **Acceso físico (0:40).** Explicar el papel del QR y, únicamente si existe y está ensayado, mostrar el dispositivo disponible. Describir con precisión si funciona de manera independiente o integrada. No mostrar una credencial real.

**Respaldo:** Si falla el correo o la red, continuar con una cuenta de prueba ya preparada y capturas o grabación identificadas como evidencia previa. Si no hay dispositivo, explicar el diagrama conceptual sin simular una lectura como si fuera real.

## 13. La tecnología acerca. Los eventos conectan — 0:35

> Smart Ticket reúne una propuesta de valor regional con experiencias digitales para organizadores y asistentes. La web facilita el encuentro con la oferta de eventos; la aplicación acerca los boletos a la persona, incluso cuando necesita consultar información previamente sincronizada sin conexión. Muchas gracias por su atención. Quedamos atentos a sus preguntas.

## Fuentes y comprobaciones

- Encuesta, muestra y actividades del equipo: `DOCS/Presentacion/boletos_V1.4.docx`.
- Modelo de negocio, web y alcance observado en código de Entrada/tick: `DOCS/Presentacion/REPORTE_EJECUTIVO_PROYECTO.md`; auditoría estática, no prueba de ejecución actual.
- Contexto y límites de integración: `DOCS/Presentacion/Info.MD`.
- Identidad visual: `DOCS/Presentacion/diseño.md` y `App/Smart-Ticket/src/constants/theme.ts`.
- Referencia normativa y dispositivo conceptual: `DOCS/Presentacion/Proyecto integrador 7 SmartTickets.pdf`.
- App y actualización: `App/Smart-Ticket/src/app/`, `src/screens/`, `DOCS/10-sesion-eas-build-apk-android.md`, `DOCS/11-sesion-arm64-eas-update.md` y `DOCS/19-wallet-offline-first.md`.
- Seguridad de cuentas: `API/src/routes/usuarios.js`; validar el despliegue y no confundir código con certificación.
