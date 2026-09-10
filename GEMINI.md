# Smart-Ticket — Contexto del proyecto para el Agente

Sistema de boletaje digital para eventos del Valle del Mezquital, Hidalgo (ferias, palenques, charreadas). Documentación completa en `docs/`.

## Estructura del repositorio

Dos proyectos independientes coordinados por un modelo de datos y una API compartidos:

- **`App/Smart-Ticket/`** — app móvil (Expo SDK 57 + React Native + TypeScript, Expo Router). Ya scaffoldeada y probada con Expo Go.
- **`API/`** — backend (Node.js + Express + Mongoose → **MongoDB Atlas**). Es la ÚNICA pieza que habla con la base de datos. La cadena de conexión va en `.env` (nunca a git). Ningún otro proyecto debe tener credenciales de Mongo.

## Documentación (leer antes de generar código relacionado)

- `docs/01-modelo-datos-y-arquitectura.md` — colecciones de MongoDB, campos, relaciones, stack técnico de App y WEB.
- `docs/02-contrato-de-api.md` — endpoints REST que App y WEB deben consumir. Si necesitas un endpoint que no está aquí, agrégalo primero al documento antes de improvisarlo en código.
- `docs/03-resumen-y-proximos-pasos.md` — plan paso a paso vigente. **El paso actual es construir `API/` desde cero** (modelos Mongoose → endpoints de `eventos` → probar aislado → conectar un frontend).

## Reglas para el agente

- No implementar pasarela de pago ni autenticación todavía — están marcadas como pendientes a propósito.
- Un solo desarrollador (el usuario) construye los tres proyectos — no asumir que hay backend/API de alguien más.
- Seguir el orden del documento 03 en vez de saltar a implementar varias entidades a la vez.
