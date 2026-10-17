# 📱 VISUAL APPS AUDITS · Retail Brand Spaces PWA (Salesland / Xiaomi)

PWA de grado corporativo desarrollada en **React 18 + Vite + TypeScript + Tailwind CSS + Three.js** para la auditoría de espacios y planogramas retail (smartphones, wearables y tablets).

---

## 📲 Instalación en Smartphone como App Nativa (PWA)

Esta aplicación está optimizada con **Service Workers** y **Web App Manifest** para funcionar como aplicación nativa en smartphones:

### En Android (Google Chrome):
1. Abre la URL de la web en tu navegador Chrome.
2. Verás el botón flotante **"Instalar App"** en la parte inferior o el banner superior.
3. Pulsa **"Instalar"** y la app se añadirá directamente a tu pantalla de inicio con su icono y ejecución a pantalla completa sin barra de navegación.

### En iPhone / iPad (Safari):
1. Abre la URL en Safari.
2. Pulsa el botón **Compartir** (icono de cuadrado con flecha hacia arriba en la barra inferior).
3. Selecciona **"Añadir a pantalla de inicio"** (icono con el símbolo `+`).
4. Pulsa **"Añadir"** en la esquina superior derecha.

---

## 🚀 Cómo ejecutar en local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# La app estará disponible en:
# http://localhost:5173/
```

Para generar la versión de producción estática:
```bash
npm run build
# Los archivos optimizados listos para desplegar se generan en /dist
```

---

## 🏗️ Arquitectura y Pantallas Implementadas

1. **Pantalla 1 — Acceso y Autenticación RBAC:**  
   Inicio con credenciales corporativas sincronizadas con Google Sheets.
2. **Pantalla 2 — Selector de Centros y Tiendas:**  
   Filtros inteligentes por retailer (MediaMarkt, El Corte Inglés, Alcampo, Carrefour, FNAC), buscador en vivo y estado de auditoría.
3. **Pantalla 3 — Planograma Interactivo de Tienda:**  
   Renders fidedignos de mesas y murales (Table 1, Table 2 Cara A/B, Wall de 11 posiciones, Lineal Wearables con alternancia superior/inferior).
4. **Pantalla 4 — Identificación de Terminal y Evidencias:**  
   - Distinción LDU vs Maqueta.
   - Formato IMEI (15 dígitos) para smartphones y formato Serial (`68707/EFAPBS6QD00345`) para wearables/tablets con teclado alfanumérico.
   - Foto de evidencia obligatoria con encuadre guiado antes de finalizar.
5. **Pantalla 5 — Resumen con Desglose Categórico y Google Drive:**  
   - Conteo y desglose sobre el total por smartphones, wearables y ecosistema.
   - Generación directa y descarga del informe oficial en Excel (`.xlsx`).
   - Sincronización automática de fotos y Excel en la carpeta de Google Drive: `1RNmY0KnIqtOV6zU0mu080bJKAFFEhRyD`.
   - Vista en tiempo real reflejando el formato Google Sheets.

---

## 📊 Integración con Google Sheets y Google Drive

El archivo `GOOGLE_SHEETS_SCRIPT.js` contiene el backend de **Google Apps Script** listo para desplegar como Web App:
- **Carpeta de Google Drive**: `1RNmY0KnIqtOV6zU0mu080bJKAFFEhRyD`
- **Jerarquía automática**: `[Retailer]` ➔ `[Nombre de Centro]` ➔ `[Año]` ➔ `[Fecha]`.
- Almacena el Excel corporativo junto con todas las evidencias fotográficas con nomenclatura trazable (`[Modelo]_[IMEI_o_Pos].jpg`).

---

## 🌐 Despliegue en GitHub Pages / Vercel / Netlify

1. Sube este proyecto al repositorio `https://github.com/antoniobenitoh-web/VISUALAPPAUDITS`.
2. En GitHub (`Settings > Pages`), activa el despliegue mediante **GitHub Actions** o conecta el repositorio a Vercel/Netlify.
3. `vite.config.ts` cuenta con `base: './'`, permitiendo carga estática en cualquier dominio o subcarpeta.

