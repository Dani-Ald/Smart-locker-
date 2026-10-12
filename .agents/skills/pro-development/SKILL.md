---
name: pro-development
description: Úsala siempre que escribas, modifiques o revises código, dependencias, configuración, commits, documentación o seguridad en Smart-Locker (API y App/Smart-Ticket), o prepares algo para publicarlo como proyecto open source.
---

# Desarrollo profesional y open source

## Seguridad y secretos
- Nunca escribas claves, tokens, contraseñas, PIN ni cadenas de conexión en ningún archivo versionado (código, DOCS/, MEMORY.md, README). Usa solo nombres de variables.
- Los secretos viven en variables de entorno. Mantén un `.env.example` con nombres y valores falsos, y `.env` en `.gitignore`.
- Antes de proponer un commit, revisa el diff buscando secretos. Si encuentras uno, para y avisa sin reproducirlo.
- La API no devuelve PIN, tokens ni datos sensibles en producción.

## Git
- Una rama por tarea: `feature/...`, `fix/...`, `docs/...`.
- Commits pequeños con Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Nunca hagas commit ni push sin que el usuario lo pida.

## Calidad
- Haz solo lo que se pide. No reescribas lo que ya funciona.
- Antes de dar algo por terminado: `expo lint`, `tsc` y los tests si existen.
- Cada dependencia nueva se justifica (para qué, mantenimiento, licencia compatible) y se pregunta antes de instalarla.
- No silencies errores. Valida las entradas de la API y devuelve mensajes de error claros.

## Documentación open source
- Mantén al día: README (qué es, requisitos, instalación, variables de entorno, cómo ejecutar), LICENSE, CONTRIBUTING.md, SECURITY.md y CHANGELOG.
- Comentarios solo donde aporten. Las decisiones importantes van a MEMORY.md.

## Checklist de revisión
- [ ] ¿Hay algún secreto en el diff o en la documentación?
- [ ] ¿Pasan lint y tsc?
- [ ] ¿Se añadió alguna dependencia sin preguntar?
- [ ] ¿El mensaje de commit sigue Conventional Commits?
- [ ] ¿Hay que actualizar README, `.env.example` o MEMORY.md?

## Al terminar
Indica qué puntos del checklist comprobaste y cómo.