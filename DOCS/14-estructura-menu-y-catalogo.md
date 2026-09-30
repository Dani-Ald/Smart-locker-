# 🗺️ Estructura del Proyecto: Menú, Catálogo y Suscripciones

Este documento define la estructura funcional de la aplicación **Smart-Ticket**, detallando cómo se organizan sus menús, secciones, catálogo de eventos y el futuro sistema de suscripciones. Se explica la relación de estos conceptos con lo que ya está implementado en la aplicación móvil.

---

## 1. El Menú (Navegación Principal)

El menú principal de la aplicación está diseñado para ofrecer una experiencia fluida a los usuarios autenticados. Se implementa mediante una barra de navegación inferior (Bottom Tabs) en la carpeta `app/(tabs)`.

**Estructura actual del Menú:**
*   **🏠 Inicio (`index.tsx`):** La pantalla de bienvenida (Hero). Muestra accesos rápidos y el estado del sistema. 
*   **🎪 Eventos (`eventos.tsx`):** El explorador principal. Permite ver todos los eventos disponibles.
*   **➕ Publicar (`create-event.tsx`):** Acceso para organizadores donde pueden crear nuevos eventos (actualmente se guardan como borradores).
*   **👤 Mi Cuenta (`dashboard.tsx`):** El perfil del usuario, donde puede ver sus estadísticas (eventos próximos, historial) y cerrar sesión.

*Relación con lo actual:* Esta estructura ya está completamente implementada usando `expo-router` y el componente personalizado `app-tabs`.

---

## 2. Las Secciones (Arquitectura de Pantallas)

La aplicación se divide lógicamente en flujos de usuario (secciones), protegiendo las áreas que requieren autenticación.

*   **Sección Pública (Auth):** Contiene `login.tsx` y `register.tsx`. Es el punto de entrada para usuarios no autenticados.
*   **Sección Privada (Tabs):** El menú principal descrito arriba, accesible solo tras iniciar sesión (gestionado por `SessionContext`).
*   **Sección de Detalle (`event/[id].tsx`):** Una vista dedicada e independiente del menú inferior, enfocada en mostrar toda la información de un evento específico y la llamada a la acción (CTA) para comprar boletos.

*Relación con lo actual:* La infraestructura de rutas (layouts, redirecciones automáticas si no hay sesión) y los componentes visuales de estas secciones ya están operativos.

---

## 3. Catálogo, Productos y Servicios (Eventos)

En Smart-Ticket, nuestro **catálogo** está compuesto por los **Eventos** (ferias, palenques, charreadas, etc.). Estos son los "productos" que los organizadores ofrecen y los usuarios consumen.

**Definición del Catálogo:**
*   **Visualización:** Se presenta en formato de Grid (2 columnas) en la pantalla de Eventos, apoyado por un carrusel destacado.
*   **Filtros y Búsqueda:** El catálogo permite a los usuarios encontrar eventos por Categoría (ej. Baile, Jaripeo) o mediante búsqueda de texto libre (nombre, municipio).
*   **Modelo de Datos:** Cada ítem del catálogo (Evento) tiene atributos clave implementados en el backend: `nombre`, `categoria`, `municipio`, `fechaHora`, `precioDesde`, `aforoTotal`.

*Relación con lo actual:* El catálogo es 100% funcional y dinámico, consumiendo los endpoints de la API real (`GET /api/events`) a través de `eventService.ts`. Los componentes `EventCard` y la lógica de filtrado en `EventosScreen` materializan este catálogo.

---

## 4. Suscripciones (Futura Implementación)

Aunque el flujo principal actual es la compra transaccional de boletos, el sistema contempla un modelo de **suscripciones** para aumentar la retención.

**Concepto de Suscripciones (Pendiente):**
*   **Suscripción a Organizadores/Municipios:** Los usuarios podrán "seguir" a un organizador específico o municipio para recibir notificaciones push (vía EAS Push) cuando se publique un nuevo evento en su catálogo.
*   **Membresía Premium (Opcional):** Un modelo donde los usuarios pagan una cuota mensual/anual para obtener beneficios exclusivos, como acceso a preventas, descuentos en boletos o filas preferenciales en los recintos.

*Relación con lo actual:* Actualmente no está implementado, pero la arquitectura de base de datos (`Modelo de Usuario` en MongoDB) y el `SessionContext` en la app móvil están preparados para extenderse y almacenar el estado de suscripción o preferencias de seguimiento de cada usuario.

---

## 5. Unificación de Base de Datos `test` y Ajustes de API

Para garantizar la consistencia en el catálogo de eventos y el registro de usuarios entre el entorno local y de producción:

* **Persistencia Unificada en `test`:** Se configuró Mongoose en `API/src/db.js` con el parámetro explícito `{ dbName: 'test' }` para asegurar que las colecciones `users` y `events` se creen y consulten únicamente en la base de datos **`test`** de MongoDB Atlas.
* **Variable de Entorno (`MONGODB_URI`):** Se actualizó la variable de entorno en el panel de producción (Railway) para apuntar a la base de datos `test`.
* **Ajuste de Rate Limiting:** Se flexibilizó el middleware `express-rate-limit` en `API/src/routes/usuarios.js` aumentando el límite a 50 peticiones por cada 15 minutos en los endpoints `/registro` y `/login`, evitando bloqueos HTTP 429 durante el flujo de pruebas.

