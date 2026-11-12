# ACTIVAR COMPARIA · Historial PRIVADO para Grupo Ramos

Este paquete está preparado para **lectores** (consultan) y **editores** (consultan y publican), sin Azure. Los datos compartidos se guardan en Supabase Free. Los archivos originales no se suben a la base de datos. Toda la configuración inicial es manual y requiere tener permiso para utilizar estos servicios externos.

**IMPORTANTE:** No publiques cotizaciones reales sin autorización del área de TI. No compartas claves secretas, tokens o contraseñas. La URL y `sb_publishable_...` pueden estar en el navegador SOLO si la base de datos tiene las políticas RLS correctas.

## Fase 1: GitHub Pages

1. Descomprime el ZIP y sube todo el **CONTENIDO** de la carpeta a la raíz del repositorio (index.html, app.js, styles.css, assets/, supabase/, etc.).
2. Configura **Settings → Pages → Deploy from a branch → main → /(root) → Save**. Comprueba que funcione la página. Todavía no habrá historial sincronizado.

## Fase 2: Supabase Free y políticas PRIVADAS

3. En https://supabase.com, crea un proyecto nuevo con plan Free. Guarda la contraseña de base de datos en un gestor seguro; no se incorpora al sitio.
4. En **SQL Editor → New query**, pega y ejecuta el contenido completo de `supabase/01_historial_publico.sql`. **Sin salir del editor y antes de guardar nada**, pega y ejecuta en otra consulta el contenido de `supabase/02_opcional_historial_privado.sql`. El primero crea el esquema y el segundo reemplaza las reglas de lectura pública por políticas privadas y separa lectores de editores. Verifica que ambos indiquen ejecución exitosa.
5. En **SQL Editor**, pega y ejecuta (cambia los correos por los verdaderos):

```sql
-- Quienes podrán GUARDAR y CONSULTAR (editores)
insert into public.comparia_editors (email) values
('comprador1@empresa.com'),
('comprador2@empresa.com')
on conflict (email) do nothing;

-- Quienes podrán CONSULTAR pero no GUARDAR (lectores)
insert into public.comparia_viewers (email) values
('lector1@empresa.com'),
('lector2@empresa.com')
on conflict (email) do nothing;
```

Cada persona iniciará sesión con GitHub y el correo autenticado allí tiene que corresponder al correo autorizado en estas listas. La cuenta usada para entrar a Supabase como administrador puede ser distinta.

## Fase 3: inicio de sesión con GitHub

6. En Supabase ve a **Authentication → Sign In / Providers → GitHub**. Copia su `Callback URL` (`https://...supabase.co/auth/v1/callback`).
7. En tu cuenta de GitHub entra a **Settings → Developer settings → OAuth Apps → New OAuth App**. Completa el nombre (ComparIA), `Homepage URL` (la dirección exacta de tu GitHub Pages) y `Authorization callback URL` (la que copiaste de Supabase). Registra la app, copia el **Client ID**, genera un **Client Secret** y pégalos **solo en Supabase → GitHub Provider**. Activa el proveedor. No agregues el Client Secret al repositorio.
8. En Supabase ve a **Authentication → URL Configuration**. En `Site URL` pon la dirección de GitHub Pages y agrega la **misma URL** en `Redirect URLs`. Conservar la barra final puede ser importante: utiliza la dirección que publica GitHub Pages.

## Fase 4: conectar la página

9. En Supabase, usa el menú **Connect** del proyecto para copiar la URL y la **publishable key**, o usa **Settings → API Keys**. Edita el archivo `db-config.js`:

```javascript
window.COMPARIA_DB_CONFIG = {
  url: 'https://TU_PROYECTO.supabase.co',
  publishableKey: 'sb_publishable_TU_CLAVE_PUBLICA'
};
```

No uses la clave `sb_secret_...`, antigua `service_role`, ni la contraseña de base de datos.

10. Sube nuevamente `db-config.js` actualizado al repositorio GitHub. Abre la página y pulsa **Historial compartido**. El estado debe indicar «Historial conectado». Para el modo privado, inicia sesión con GitHub (el botón en la página se llama «Acceso para guardar») antes de consultar o publicar registros.

## Prueba con dos personas

11. El editor inicia sesión, abre el comparativo ficticio, pulsa **Guardar y compartir** y confirma. Debería recibir un enlace a la versión guardada.
12. Envía el enlace a otra persona agregada en `comparia_viewers`. Esa persona debe iniciar sesión con su GitHub y luego volver a abrir el enlace. Podrá ver el registro, pero no debería poder publicar.
13. Prueba en una ventana privada SIN iniciar sesión: el registro privado **no** debe abrirse ni mostrar datos. Verifica también que un correo NO autorizado no vea los reportes.

## Qué se guarda

Proyecto, folio, autores, partidas, cantidades, precios en moneda de origen, tasas, condiciones comerciales, ponderaciones, ranking y resultado. **No se guardan** PDFs originales, Word, Excel de origen, contratos, aprobaciones ni imágenes cargadas. Cada «Guardar» crea una nueva versión, no modifica la previa. Los botones Excel/PDF generan descargas locales.

## Problemas frecuentes

- «Historial no conectado»: verifica el contenido de `db-config.js` publicado y que el proyecto Supabase esté activo.
- Sin resultados: inicia sesión; verifica que tu email autenticado figure en `comparia_viewers` o `comparia_editors`.
- No puedo guardar: exige correo en `comparia_editors` y contraseña/identidad GitHub correcta. Las cuentas en `comparia_viewers` solo consultan.
- GitHub no retorna a la página: verifica el callback URL en la OAuth App y los Redirect URLs en Supabase.
- No aparece inicio de sesión: revisa que la red corporativa permita Supabase y la biblioteca JavaScript CDN.
- No uses el plan Free como repositorio crítico sin respaldos y revisión de TI; puede pausarse por inactividad.

Documentación de referencia:
- https://supabase.com/docs/guides/auth/social-sign-in/auth-github
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/redirect-urls
- https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
