# ComparIA · Grupo Ramos

Prototipo funcional **gratuito, estático y con historial compartido opcional** para comparar ofertas de proveedores. Se diseñó a partir de un modelo visual aprobado: el **ítem en la fila** y los **proveedores en columnas**, con **cantidad cotizada, precio unitario y total por artículo**, condiciones comerciales, evaluación ponderada, ranking y recomendación orientativa.

**NOVEDAD · HISTORIAL DEL EQUIPO:** esta versión añade **Guardar y compartir**, **Historial compartido**, acceso con GitHub, búsqueda de comparativos y enlaces individuales. Para que funcione en varios dispositivos hay que configurar Supabase Free con `CONFIGURAR_HISTORIAL.md`. No se suben documentos originales. **El modo recomendado es PRIVADO: ejecuta ambos scripts SQL para que solo usuarios autorizados puedan ver registros; no uses cotizaciones confidenciales sin revisión de TI.**

![Logo de ComparIA](assets/grupo-ramos.png)

## 1. Subir a GitHub Pages

1. Extrae el archivo ZIP.
2. En GitHub, crea un repositorio nuevo (por ejemplo `comparia-grupo-ramos`).
3. En el repositorio, usa **Add file → Upload files** y sube **el contenido de la carpeta** (no una carpeta dentro de otra). Es importante que `index.html` quede en la raíz junto a `app.js`, `parser.js`, `styles.css` y la carpeta `assets`.
4. En **Settings → Pages → Build and deployment**, selecciona **Deploy from a branch**, rama `main` y carpeta `/ (root)`; pulsa **Save**.
5. Abre la URL que GitHub publique en la sección Pages.

No requiere Azure ni servidor propio para mostrar la demostración. Para el **historial sincronizado** sí hace falta conectar un proyecto Supabase Free. Necesita conexión para descargar las bibliotecas JavaScript desde CDN (PDF.js, ExcelJS, Tesseract, Mammoth, jsPDF y AutoTable). La disponibilidad de estas bibliotecas depende de la red corporativa.

## 2. Uso básico

1. Abre la página. Inicialmente aparece una **demostración con tres proveedores y cifras completamente ficticias**.
2. Haz clic en **+ Cotizaciones**. Añade documentos en PDF, Excel `.xlsx`, Word `.docx`, texto, CSV o imágenes. El sistema intenta extraer partidas y condiciones por reglas y OCR. **No garantiza leer correctamente cualquier diseño**.
3. Haz clic en el icono **✎** al lado de cada proveedor. Corrige los precios, cantidades, descripción, moneda, impuestos, flete, instalación y las condiciones comerciales. **Homologa cada partida** con el ítem de referencia correspondiente. El botón **Editar artículos solicitados** cambia las cantidades de la solicitud.
4. Introduce **calidad técnica (0–100)** y marca que se verificó la equivalencia técnica, solo después de una revisión real.
5. Revisa **Configurar tasas**, si recibiste propuestas en USD/EUR/otras monedas. Puedes consultar tasas públicas o introducir la tasa corporativa, fecha y fuente. Cuando faltan tasas, el sistema **bloquea la recomendación de ganador**.
6. En **Editar ponderaciones**, define cuánto pesa cada factor. Deben sumar exactamente **100%**. Los puntajes se recalculan y la página muestra ranking y propuesta de ganador, **solo si las cotizaciones son evaluables**.
7. Usa **PDF** para descargar el resumen horizontal; **Excel** para descargar un libro editable con las hojas Comparativo, Condiciones comerciales, Evaluación y Trazabilidad.

## 3. Cálculo de los puntajes

- **Precio (40% por defecto):** total más barato ÷ total de cada proveedor × 100.
- **Plazo (15%):** menor cantidad de días de entrega ÷ plazo del proveedor × 100. El prototipo no distingue automáticamente días hábiles de calendario, lo cual debe homologarse en revisión.
- **Garantía (15%):** meses ofertados ÷ máximo ofertado × 100.
- **Calidad / marca (10%):** **calificación humana** de 0 a 100; la página nunca inventa la calidad técnica.
- **Instalación y soporte (10%):** 100 si está incluida y 0 si no; el costo adicional (si existe) también se suma al precio.
- **Condiciones de pago (5%):** regla heurística: más días de crédito mejoran el puntaje, y anticipos lo reducen. Es un criterio configurable a desarrollar para políticas empresariales.
- **Vigencia (5%):** días ofertados ÷ máxima vigencia × 100.

**Costo evaluado** = suma de cantidades cotizadas × precio unitario × tasa a DOP + ITBIS (si el precio no lo incluye) + flete + instalación. El resultado toma la moneda original y muestra los valores en DOP. El total se considera no comparable cuando las cantidades no coinciden con la solicitud, falta una partida o falta una tasa de cambio.

**Importante:** El prototipo no ajusta automáticamente Incoterms, aduanas, retenciones, desgravaciones, moneda de facturación, seguro, impuestos especiales ni costos de ciclo de vida. Estos deben revisarse antes de adjudicar.

## 4. Qué incluye el repositorio

```
ComparIA_Grupo_Ramos_GitHub/
├── index.html                    # Interfaz y estructura visual
├── styles.css                    # Colores y diseño Grupo Ramos, responsive, impresión
├── app.js                        # Estado, evaluaciones, edición, PDF y Excel
├── parser.js                     # Lectura heurística de PDF, Excel, Word, OCR
├── assets/
│   ├── grupo-ramos.png           # Logo proporcionado por el usuario
│   ├── formatos-grupo-ramos.png  # Marcas de formatos, extraídas de la imagen proporcionada
│   └── identidad-grupo-ramos-original.png
├── ejemplos/
│   ├── 01_Frio_Caribe.pdf
│   ├── 02_Equipos_del_Norte.xlsx
│   └── 03_Comercial_Costa_Azul.pdf
├── .nojekyll
└── README.md
```

## 5. Seguridad y límites importantes

- **GitHub Pages no ofrece un inicio de sesión empresarial privado**, y los repositorios públicos son visibles. **NO cargues cotizaciones reales, contratos, documentos de proveedores o información confidencial sin autorización de TI y Cumplimiento.**
- Los documentos se procesan **dentro del navegador**. El trabajo solo queda guardado entre dispositivos si se configura Supabase y un comprador autorizado pulsa **Guardar y compartir**. Sin conexión al historial, descarga Excel/PDF antes de salir.
- Se usan bibliotecas alojadas en CDNs externos; si la red las bloquea, la demostración y la edición manual pueden seguir disponibles, pero no se podrá importar o exportar en los formatos que dependan de ellas.
- Los archivos de prueba y los nombres de proveedores del prototipo son **ficticios**. No hay integración con SAP, OneDrive ni repositorios empresariales.
- La coincidencia automática de artículos es heurística, no verificación de fichas técnicas ni IA universal. El comprador debe validar descripción, modelo, capacidad, potencia, fabricación, cotización y comparación técnica.
- Las tasas obtenidas de una fuente pública deben ser verificadas y **congeladas a la fecha de aprobación** de un análisis real.
- La recomendación es preliminar y **no aprueba una compra**; requiere revisión, firma y controles establecidos por la empresa.

## 6. Personalización

Los colores principales se controlan en `styles.css`: `--ramos`, `--blue`, `--navy`, `--dark`. Los pesos por defecto y los proveedores ficticios están definidos al inicio de `app.js`.

La marca Grupo Ramos y sus logos se incluyen **solo porque fueron proporcionados para este trabajo**. Deben utilizarse con autorización de la organización.

## 7. Historial compartido (novedad)

Lee `CONFIGURAR_HISTORIAL.md`. Los SQL están en `supabase/`. Se guardan versiones inmutables de **datos estructurados**, visibles para otros compradores con el enlace. Para uso interno, ejecuta el SQL 01 seguido inmediatamente del SQL 02, que restringe la lectura a correos autorizados y permite separar lectores y editores.

**Limitación del plan Free**: Supabase puede pausar el proyecto por inactividad. Su SMTP predeterminado solo sirve para pruebas con restricciones importantes, por lo que el acceso por GitHub se incluye como alternativa.
