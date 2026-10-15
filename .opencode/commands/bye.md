---
description: Cierra la sesión - guarda el contexto en DOCS, actualiza MEMORY.md y propone reglas para AGENTS.md
agent: build
---
Vamos a cerrar la sesión. Nota adicional del usuario (opcional): $ARGUMENTS

Lee @MEMORY.md y @AGENTS.md. Luego ejecuta `git status` y `git diff --stat` para ver qué cambió.

## 1. Numeración
- Lista los archivos de DOCS/ y detecta el número de sesión más alto.
- La nueva sesión es ese número + 1.
- Copia exactamente el patrón de nombre de los archivos existentes (dígitos, separadores, mayúsculas). Si no hay patrón claro, usa NN-titulo-corto.md con dos dígitos.
- Si ya existe un archivo con ese número, para y avísame.
- Obtén la fecha de hoy con `Get-Date -Format yyyy-MM-dd`.

## 2. Archivo de sesión
Crea DOCS/<nuevo archivo>.md con estas secciones:
- # Sesión NN — <título corto> (fecha)
- ## Objetivo: qué se quería lograr.
- ## Qué se hizo: resumen en pocas líneas.
- ## Archivos modificados: lista (según git).
- ## Decisiones (y por qué): solo las que se tomaron en esta sesión.
- ## Problemas y soluciones: errores encontrados y cómo se resolvieron.
- ## Pendientes: qué quedó sin hacer.
- ## Próximo paso: la acción exacta con la que debería empezar la siguiente sesión.
- ## Verificación: qué se probó y con qué resultado (expo lint, tsc, prueba manual).
Basa el contenido en la conversación y en git. Si no sabes algo, escribe "[POR CONFIRMAR]". No inventes.

## 3. Memoria
Actualiza MEMORY.md: estado actual, decisiones importantes (con su porqué), errores a evitar y próximos pasos. Añade una línea con el enlace al archivo de sesión. Mantenlo en máximo ~50 líneas: resume o elimina lo que ya no aporte. Si existe un índice de sesiones en DOCS/, añade también la nueva.

## 4. Reglas permanentes
NO edites AGENTS.md. Si de esta sesión salió alguna regla que deba ser permanente, propónla al final con el texto exacto y en qué sección iría. Si no hay ninguna, dilo.

## 5. Seguridad
Nunca incluyas claves, tokens, contraseñas, PIN, cadenas de conexión ni datos personales, ni en DOCS ni en MEMORY.md. Usa solo nombres de variables. Antes de terminar, vuelve a leer los archivos que escribiste y confirma que no contienen nada de eso.

## 6. Cierre
Muéstrame: el número de sesión, los archivos creados o modificados, la regla propuesta para AGENTS.md (si hay) y un mensaje de commit sugerido. NO hagas commit ni push.