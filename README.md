# ComparIA — Comparativos inteligentes de Compras (prototipo v0.1)

**Primera versión sin licencias de Azure, sin API de pago y sin base de datos.** La web permite cargar ofertas, revisar datos extraídos, comparar partidas y **editar condiciones comerciales** para exportarlas a Excel.

> **ATENCIÓN.** Es una prueba de concepto, **no** un sistema de IA capaz de interpretar cualquier cotización sin errores. Usa extracción de texto, OCR y reglas de coincidencia. Cada dato debe revisarse antes de una compra, especialmente las especificaciones, el ITBIS y las condiciones comerciales.

## Probar el sistema

1. Abre `index.html` en un navegador reciente con conexión a internet (los módulos JavaScript vienen de CDNs). Para un funcionamiento más confiable, usa GitHub Pages o un servidor web local.
2. Presiona **Cargar comparativo de ejemplo**. Aparecerán 3 proveedores ficticios, sus 9 partidas y sus condiciones comerciales.
3. Edita directamente cualquier partida, precio, cantidad o grupo comparable. Puedes añadir y eliminar partidas.
4. En la sección **Condiciones comerciales**, modifica las condiciones de pago, entrega, instalación, garantía, vigencia, flete, ITBIS, descuentos, repuestos, etc.
5. Presiona **Descargar Excel editable**. Se descargarán 5 hojas: `Resumen`, `Precios`, `Condiciones comerciales`, `Detalle original` y `Alertas`.
6. Para probar la lectura de archivos reales, sube los documentos ficticios de la carpeta `ejemplos/` (dos PDFs y un XLSX). La extracción es orientativa: verifica los resultados.

**Formatos incluidos en la interfaz:** PDF de texto; PDF escaneado (OCR de hasta 4 primeras páginas), XLSX, DOCX, CSV, TXT, PNG, JPG/JPEG, WEBP. No se admiten `.xls` antiguos ni archivos protegidos con contraseña. Se procesan hasta las primeras 12 páginas en PDF de texto y hasta 10 archivos por selección. Documentos extensos, tablas complejas, fórmulas no calculadas o imágenes de baja calidad pueden fallar o requerir transcripción manual.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo (p. ej. `comparia-prototipo`) en GitHub.
2. Sube **todo el contenido de esta carpeta** a la raíz del repositorio. Verifica que `index.html`, `app.js` y `styles.css` estén en la raíz.
3. Ve a **Settings → Pages → Build and deployment → Deploy from a branch → main / (root) → Save**.
4. Abre el enlace `https://USUARIO.github.io/comparia-prototipo/` cuando GitHub termine de publicar.
5. Para actualizar el diseño o las reglas, reemplaza `app.js` y/o `styles.css` en GitHub. Los documentos dentro de `ejemplos` son datos **ficticios** para prueba, no archivos corporativos.

> **No publiques cotizaciones reales o datos de proveedores en el repositorio**, porque GitHub Pages no es una solución privada de almacenamiento. GitHub Pages, incluso en repositorios de acceso restringido según plan, no debe asumirse como un sitio de acceso controlado para el departamento.

## Cómo funcionan los datos y la seguridad

- El navegador lee los archivos seleccionados; **el código de ComparIA no hace solicitudes de carga a servidores ni tiene base de datos**.
- Las librerías (PDF.js, ExcelJS, Mammoth.js y Tesseract.js) se descargan de **servicios CDN de terceros**. El OCR también puede descargar recursos de reconocimiento. Esta versión **no ha sido auditada ni aprobada por TI** y NO debe usarse con ofertas confidenciales hasta que TI revise y autorice el diseño, la cadena de suministro de librerías y la red.
- Los archivos subidos no permanecen al cerrar o recargar la página. El Excel descargado queda en el equipo del usuario.
- No hay inicio de sesión, permisos de edición, historial, base de datos, almacenamiento en OneDrive ni integraciones con SAP.
- Para implementar una solución empresarial controlada, conviene usar librerías alojadas internamente, políticas CSP, autenticación y almacenamiento conforme a las reglas de la empresa.

## Qué se compara y qué NO

- Se muestran partidas por **grupo comparable**; el usuario puede cambiar manualmente el grupo.
- La asociación automática se hace por semejanza textual y algunos sinónimos, y **no prueba** equivalencia de capacidades, dimensiones, marcas, instalación o especificaciones técnicas.
- Los valores resaltados son únicamente los menores **precios unitarios registrados** para grupos de la misma moneda. **No significan mejor oferta ni adjudicación recomendada**.
- El sistema no convierte monedas por su cuenta, no calcula un costo total comparable ajustado por impuestos/flete/instalación, no asigna criterios de evaluación y no inventa condiciones faltantes.
- Cuando un dato no aparece, se presenta como `No indicado` o requiere revisión. Se debe verificar cualquier condición o descripción OCR.
- El precio de Excel de cada renglón se calcula con fórmula `cantidad * precio unitario`; la suma simple de Resumen **no equivale** al costo total de compra.

## Ejemplos e inspiración (públicos)

Estos enlaces fueron revisados como **referencias de estructura**, no son archivos de proveedores reales del usuario:

- Cotización comercial con pago, entrega y validez: https://pedidos.cl/cotizacion/
- Plantilla de cotización Excel con condiciones: https://quotive.co/templates/excel-quote-template/
- Modelo de comparativo con flete, Incoterms y pagos: https://proceny.com/templates/quote-comparison-excel
- Guía sobre negociación de condiciones de suministro: https://www.ilo.org/sites/default/files/wcmsp5/groups/public/%40ed_emp/%40emp_ent/%40ifp_seed/documents/instructionalmaterial/wcms_553922.pdf

Los tres archivos de prueba de `ejemplos/` y los datos del botón de demostración son **completamente ficticios** y fueron creados desde cero para probar variaciones de formato. No representan cotizaciones de negocios reales.

## Librerías utilizadas

- PDF.js v3.11.174 (Apache 2.0): extracción de texto de PDF.
- ExcelJS v4.4.0 (MIT): lectura XLSX y generación de Excel.
- Mammoth.js v1.13.0 (BSD-2-Clause): lectura de texto DOCX.
- Tesseract.js v5.1.1 (Apache 2.0): OCR de imágenes y PDF escaneados.

**Desarrollo futuro recomendado:** motor de extracción más preciso para documentos corporativos diversos (posiblemente un modelo local aprobado por TI), costo total normalizado con conversión manual de moneda, criterios ponderados de evaluación, auditoría de cambios, versión multiusuario privada.
