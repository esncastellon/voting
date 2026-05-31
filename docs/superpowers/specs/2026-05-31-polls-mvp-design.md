# Polls MVP Design

## Objetivo

Convertir el dashboard actual en una aplicacion real de votaciones. El resultado debe dejar de depender del modelo de tutorial `invoices/customers/revenue`, usar `polls` como nombre tecnico final y mostrar una interfaz consistente en espanol para crear, gestionar, votar y consultar resultados.

## Decisiones De Dominio

- El nombre tecnico final sera `polls`.
- La interfaz visible usara "votaciones".
- La ruta principal sera `/dashboard/polls`.
- `/dashboard/surveys` se mantendra solo como redirect temporal hacia `/dashboard/polls`.
- Una votacion MVP tendra una pregunta principal y varias opciones.
- El voto sera autenticado y se impedira doble voto por usuario y votacion.
- Los roles basicos seran `admin`, `usuario` y `lector`.

## Esquema De Base De Datos

### roles

- `id`: UUID primary key.
- `name`: texto unico. Valores seed: `admin`, `usuario`, `lector`.
- `description`: texto opcional.

### users

- `id`: UUID primary key.
- `name`: texto requerido.
- `email`: texto unico requerido.
- `password`: hash bcrypt requerido.
- `image_url`: texto requerido con avatar por defecto.
- `role_id`: UUID requerido, foreign key a `roles.id`.
- `created_at`: timestamp por defecto.

### polls

- `id`: UUID primary key.
- `title`: texto requerido.
- `description`: texto opcional.
- `question`: texto requerido.
- `status`: texto requerido con valores `draft`, `open`, `closed`.
- `starts_at`: timestamp opcional.
- `ends_at`: timestamp opcional.
- `created_by`: UUID requerido, foreign key a `users.id`.
- `created_at`: timestamp por defecto.
- `updated_at`: timestamp por defecto.

### poll_options

- `id`: UUID primary key.
- `poll_id`: UUID requerido, foreign key a `polls.id`.
- `label`: texto requerido.
- `position`: entero requerido.

### votes

- `id`: UUID primary key.
- `poll_id`: UUID requerido, foreign key a `polls.id`.
- `option_id`: UUID requerido, foreign key a `poll_options.id`.
- `user_id`: UUID requerido, foreign key a `users.id`.
- `created_at`: timestamp por defecto.
- Restriccion unica: `poll_id, user_id`.

## Datos, Acciones Y Queries

El modulo de votaciones se movera de `survey` a `poll`:

- `fetchFilteredSurveys` se sustituira por `fetchFilteredPolls`.
- `fetchSurveysPages` se sustituira por `fetchPollsPages`.
- `fetchLatestSurveys` se sustituira por `fetchLatestPolls`.
- `fetchSurveyDetailsById` se sustituira por `fetchPollById`.

Acciones reales:

- `createPoll`: valida titulo, pregunta, descripcion, estado, fechas y opciones; crea `polls` y `poll_options`.
- `updatePoll`: actualiza metadatos y opciones si la votacion no esta cerrada.
- `deletePoll`: elimina votos, opciones y votacion en una transaccion.
- `closePoll`: cambia `status` a `closed`.
- `submitVote`: guarda un voto si la votacion esta abierta, el usuario no ha votado y la opcion pertenece a esa votacion.
- `createUser`: valida datos, hashea contrasena con bcrypt y asocia rol.

## Rutas

### Dashboard

- `/dashboard`: metricas reales de votaciones.
- `/dashboard/polls`: listado paginado y buscador.
- `/dashboard/polls/create`: crear votacion.
- `/dashboard/polls/[id]/edit`: editar votacion.
- `/dashboard/polls/[id]`: detalle y resultados administrativos.
- `/dashboard/users`: listado y creacion de usuarios.

### Voto

- `/polls/[id]/vote`: pagina interna autenticada para votar.

La pagina de voto mostrara titulo, descripcion, pregunta, opciones y estado. Si esta cerrada, mostrara que no acepta votos. Si el usuario ya voto, mostrara estado de voto registrado y no permitira repetir.

## Permisos

- `admin`: crear, editar, cerrar, borrar votaciones; crear usuarios; ver resultados.
- `usuario`: votar en votaciones abiertas y ver informacion basica.
- `lector`: ver votaciones y resultados permitidos, sin votar ni modificar.

La primera version aplicara permisos en server actions y paginas de dashboard. NextAuth seguira protegiendo `/dashboard` y tambien permitira el acceso autenticado a `/polls/[id]/vote`; las acciones de voto validaran sesion antes de escribir en base de datos.

## Dashboard

Las tarjetas mostraran:

- Votaciones activas.
- Votaciones cerradas.
- Votos emitidos.
- Participacion, calculada como votos emitidos sobre usuarios con rol `usuario`.

La lista de ultimas votaciones mostrara titulo, estado, fechas y votos totales. El grafico de revenue se reemplazara por un resumen visual de participacion o resultados recientes basado en `votes` y `poll_options`.

## Limpieza

- Eliminar referencias a `invoices`, `customers` y `revenue`.
- Renombrar funciones, tipos y componentes que todavia usen nombres de tutorial.
- Proteger `/seed` para que solo funcione en desarrollo, o eliminarlo si se crea migracion local suficiente.
- Eliminar `/query` o devolver 404.
- Cambiar branding `Acme` por el nombre de la app.
- Cambiar metadata, login y textos restantes a espanol.
- Cambiar `html lang` a `es`.

## Seed Y Migracion

Para el MVP se actualizara `app/seed/route.ts` como inicializador de desarrollo con el esquema real. El seed creara roles, usuarios iniciales, votaciones de ejemplo, opciones y algun voto de muestra. No creara tablas de tutorial.

Si el proyecto incorpora migraciones mas adelante, este esquema sera la base para mover la inicializacion a scripts versionados. Para esta fase, el seed protegido es suficiente para demo y desarrollo.

## Pruebas Y QA

Se anadiran pruebas minimas para:

- Validacion de datos de votacion.
- Prevencion de doble voto.
- Hash de contrasena en `createUser`.
- Queries de metricas principales cuando sea viable aislarlas.

QA manual:

- Login.
- Crear usuario.
- Crear votacion.
- Editar votacion.
- Votar.
- Evitar doble voto.
- Cerrar votacion.
- Ver resultados.

Verificacion final:

- `pnpm lint`.
- `pnpm tsc --noEmit` o equivalente.
- `pnpm build`.

## Riesgos

- La app actual mezcla `survey`, `customer` y `invoice`; algunos renombres tendran que hacerse por capas para evitar romper imports.
- No hay framework de test configurado; puede hacer falta anadir una configuracion minima o limitar pruebas iniciales a helpers puros.
- El uso de Postgres remoto mediante `POSTGRES_URL` puede impedir pruebas automaticas completas si no hay base de datos accesible.
- El formulario actual de votaciones esta orientado a encuestas con multiples preguntas; el MVP lo simplificara a una pregunta principal con opciones.
