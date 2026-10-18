/**
 * GOOGLE APPS SCRIPT: BACKEND MULTI-HOJA PARA LA PWA DE AUDITORÍA DE RETAIL BRAND SPACES
 * 
 * 1. Hoja de Espacios y Planogramas:
 *    ID: 1s9hGfmS7tqvD3hP-QktLyDsTo_fRn7q8r0IMc1Dy-uo
 *    Pestañas: "BBDD_Brand Space", "Planogramas", "Auditorias_Log"
 * 
 * 2. Hoja de Usuarios y Permisos RBAC:
 *    ID: 1HgC4qVTZYbD17pQSiunxptck4C_VIv3_8DCgrYAfAGw
 *    Pestaña: "usuarios"
 * 
 * 3. Carpeta Raíz de Google Drive para Almacenar Auditorías:
 *    ID: 1RNmY0KnIqtOV6zU0mu080bJKAFFEhRyD
 */

const SPREADSHEET_SPACES_ID = "1s9hGfmS7tqvD3hP-QktLyDsTo_fRn7q8r0IMc1Dy-uo";
const SPREADSHEET_USERS_ID = "1HgC4qVTZYbD17pQSiunxptck4C_VIv3_8DCgrYAfAGw";
const GDRIVE_ROOT_FOLDER_ID = "1RNmY0KnIqtOV6zU0mu080bJKAFFEhRyD";

/**
 * =========================================================================
 * PASO 1 (OBLIGATORIO): AUTORIZAR PERMISOS DE GOOGLE DRIVE EN APPS SCRIPT
 * =========================================================================
 * Para que Google permita a esta aplicación crear carpetas y guardar
 * los archivos Excel y Fotos en Drive:
 * 1. En el editor de Apps Script, selecciona la función "testAutorizacionDrive" en la barra superior.
 * 2. Haz clic en "Ejecutar" (icono de Reproducir ▶).
 * 3. Si Google muestra la ventana emergente "Se requiere autorización":
 *    - Pulsa "Revisar permisos".
 *    - Selecciona tu cuenta de Google.
 *    - Pulsa "Avanzada" (o "Configuración avanzada").
 *    - Haz clic en "Ir a Proyecto (no seguro)" abajo del todo.
 *    - Pulsa "Permitir".
 * 4. Verás en el registro de ejecución: "✅ CONEXIÓN EXITOSA CON GOOGLE DRIVE".
 * 5. Por último, haz clic en: Implementar > Gestionar implementaciones > Editar (icono lápiz) >
 *    Versión: "Nueva versión" > Implementar.
 */
function testAutorizacionDrive() {
  try {
    const rootFolder = DriveApp.getFolderById(GDRIVE_ROOT_FOLDER_ID);
    const folderName = rootFolder.getName();
    Logger.log("✅ CONEXIÓN EXITOSA CON GOOGLE DRIVE.");
    Logger.log("Carpeta Raíz: " + folderName + " (ID: " + rootFolder.getId() + ")");
    Logger.log("URL de acceso: " + rootFolder.getUrl());
    return "OK: " + folderName;
  } catch (e) {
    Logger.log("❌ ERROR AL ACCEDER A GOOGLE DRIVE: " + e.toString());
    throw new Error("No se pudo acceder a la carpeta de Google Drive ID " + GDRIVE_ROOT_FOLDER_ID + ". Asegúrate de autorizar los permisos de DriveApp y que la carpeta esté compartida con tu cuenta con permisos de Editor.");
  }
}

function getSpacesSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_SPACES_ID);
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
}

function getUsersFromExternalSheet() {
  try {
    const usersSS = SpreadsheetApp.openById(SPREADSHEET_USERS_ID);
    const sheet = usersSS.getSheetByName("usuarios") || usersSS.getSheetByName("Usuarios") || usersSS.getSheets()[0];
    if (!sheet) return [];

    const rows = sheet.getDataRange().getValues();
    if (rows.length < 2) return [];

    // Por directrices: Columna C (idx 2), Columna D (idx 3), Columna K (idx 10)
    let colEmail = 2;
    let colPass = 3;
    let colCentro = 10;
    let colZona = -1;
    let colNombre = -1;
    let colRol = -1;

    // Escanear cabecera para afinar columnas automáticas
    const headerRow = rows[0];
    for (let c = 0; c < headerRow.length; c++) {
      const h = String(headerRow[c]).toLowerCase().trim();
      if (h.indexOf("zona") !== -1) colZona = c;
      if (h.indexOf("nombre") !== -1 || h.indexOf("apellidos") !== -1) colNombre = c;
      if (h.indexOf("rol") !== -1 || h.indexOf("cargo") !== -1) colRol = c;
    }

    const users = [];
    for (let i = 1; i < rows.length; i++) {
      const email = String(rows[i][colEmail] || "").trim();
      if (!email || email.indexOf("@") === -1) continue;

      const password = String(rows[i][colPass] || "").trim();
      const centro = String(rows[i][colCentro] || "").trim();
      const zona = colZona !== -1 ? String(rows[i][colZona] || "").trim() : "Cataluña";
      const nombre = colNombre !== -1 && rows[i][colNombre]
        ? String(rows[i][colNombre]).trim()
        : email.split("@")[0].replace(/[._]/g, " ").toUpperCase();

      // Deducir rol RBAC normalizado
      let rol = "Promotor";
      const emailLower = email.toLowerCase();
      if (colRol !== -1 && rows[i][colRol]) {
        const rawRol = String(rows[i][colRol]).trim().toLowerCase();
        if (rawRol.indexOf("admin") !== -1 || rawRol.indexOf("coordin") !== -1 || rawRol.indexOf("director") !== -1) {
          rol = "SuperAdmin";
        } else if (rawRol === "am" || rawRol.indexOf("area") !== -1 || rawRol.indexOf("trainer") !== -1 || rawRol.indexOf("formador") !== -1) {
          rol = "AM";
        } else if (rawRol === "gpv") {
          rol = "GPV";
        } else {
          rol = "Promotor";
        }
      } else if (emailLower.indexOf("admin") !== -1) {
        rol = "SuperAdmin";
      } else if (emailLower.indexOf("am") !== -1 || emailLower.indexOf("antonio") !== -1) {
        rol = "AM";
      } else if (emailLower.indexOf("gpv") !== -1 || emailLower.indexOf("ricardo") !== -1 || !centro) {
        rol = "GPV";
      }

      users.push({
        email: email,
        password: password,
        nombre: nombre,
        rol: rol,
        retailer: centro.indexOf("ECI") !== -1 ? "El Corte Inglés" : "MediaMarkt",
        zona: zona,
        region: "Noreste",
        tiendaAsignadaId: centro
      });
    }

    return users;
  } catch (err) {
    Logger.log("Error al leer hoja de usuarios: " + err.toString());
    return [];
  }
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "GET_CATALOG";
  const ss = getSpacesSpreadsheet();

  if (action === "GET_CATALOG") {
    // 1. Obtener tiendas desde BBDD_Brand Space
    const bbddSheet = ss.getSheetByName("BBDD_Brand Space");
    const bbddRows = bbddSheet ? bbddSheet.getDataRange().getValues() : [];
    const stores = [];

    for (let i = 1; i < bbddRows.length; i++) {
      const r = bbddRows[i];
      const code = r[0];
      const name = r[1];
      if (!code || !name) continue;

      const planogram = r[2] ? String(r[2]).trim() : "Table 1";
      const hasPad8Pro = (String(r[3] || "").trim().toUpperCase() === "SI");
      const hasWall = (r[4] !== null && r[4] !== "") || (r[10] !== null && r[10] !== "");
      const hasMiniWall = (r[5] !== null && r[5] !== "");
      const hasLineal = (String(r[20]).trim().toUpperCase() === "SI");
      let linealPositions = r[21] ? String(r[21]).trim() : "";
      let linealPlanogram = "";
      let linealCount = 0;
      if (hasLineal) {
        if (linealPositions.indexOf("ECI") !== -1 || linealPositions === "6" || linealPositions === "6.0") {
          linealPlanogram = (name.indexOf("ECI") !== -1 || name.indexOf("Corte") !== -1) ? "L. Wearables_ECI 6" : "L. Wearables_6.0";
          linealCount = 6;
        } else if (linealPositions === "7" || linealPositions === "7.0") {
          linealPlanogram = "L. Wearables_7.0";
          linealCount = 7;
        } else if (linealPositions === "8" || linealPositions === "8.0") {
          linealPlanogram = "L. Wearables_8.0";
          linealCount = 8;
        } else {
          linealPlanogram = "L. Wearables_9.0";
          linealCount = 9;
        }
      }

      const spaces = [];
      if (r[11]) spaces.push("MESA 1 · Cara 1");
      if (r[12]) spaces.push("MESA 1 · Cara 2");
      if (r[13]) spaces.push("MESA 2 · Cara 1");
      if (r[14]) spaces.push("MESA 2 · Cara 2");
      if (r[15]) spaces.push("MESA 3 · Cara 1");
      if (r[16]) spaces.push("MESA 3 · Cara 2");

      if (spaces.length === 0) {
        if (planogram === "Table 1") {
          spaces.push("MESA 1 · Cara 1", "MESA 1 · Cara 2");
        } else if (planogram === "Table 2") {
          spaces.push("MESA 1 · Cara 1", "MESA 1 · Cara 2", "MESA 2 · Cara 1", "MESA 2 · Cara 2");
        } else if (planogram === "Table 3") {
          spaces.push("MESA 1 · Cara 1", "MESA 1 · Cara 2", "MESA 2 · Cara 1", "MESA 2 · Cara 2", "MESA 3 · Cara 1", "MESA 3 · Cara 2");
        } else {
          spaces.push("MESA 1 · Cara 1", "MESA 1 · Cara 2");
        }
      }

      if (hasWall) spaces.push("WALL");
      if (hasMiniWall) spaces.push("MINIWALL");
      if (hasLineal) spaces.push("LINEAL SMARTWATCH");

      let retailer = "MediaMarkt";
      if (name.indexOf("ECI") !== -1 || name.indexOf("Corte") !== -1) retailer = "El Corte Inglés";
      else if (name.indexOf("FNAC") !== -1 || name.indexOf("Fnac") !== -1) retailer = "FNAC";
      else if (name.indexOf("CRF") !== -1 || name.indexOf("Carrefour") !== -1) retailer = "Carrefour";

      stores.push({
        tiendaId: String(code).trim(),
        retailer: retailer,
        nombreTienda: String(name).trim(),
        tipoEspacioId: planogram,
        hasPad8Pro: hasPad8Pro,
        zona: "Cataluña",
        region: "Noreste",
        totalPuestos: spaces.length * 4,
        availableSpaces: spaces,
        linealWearablesPlanogram: linealPlanogram || undefined,
        linealWearablesCount: linealCount || undefined,
        auditStatus: "Pendiente"
      });
    }

    // 2. Obtener usuarios desde la hoja externa (1HgC4qVTZYbD17pQSiunxptck4C_VIv3_8DCgrYAfAGw)
    let users = getUsersFromExternalSheet();
    if (users.length === 0) {
      // Fallback a usuarios predeterminados si no estuviera disponible la segunda hoja
      users = [
        { email: "mmtarragona@salesland.net", nombre: "Promotor Media Tarragona", rol: "Promotor", retailer: "MediaMarkt", zona: "Cataluña", region: "Noreste", tiendaAsignadaId: "MIESO00043" },
        { email: "ricardo.dahdah@salesland.net", nombre: "Ricardo Dahdah", rol: "GPV", retailer: "MediaMarkt", zona: "Cataluña", region: "Noreste", tiendaAsignadaId: "" },
        { email: "antoniobenitoh@salesland.net", nombre: "Antonio Benito", rol: "AM", retailer: "Todos", zona: "Nacional", region: "Nacional", tiendaAsignadaId: "" },
        { email: "admin@salesland.net", nombre: "SuperAdmin Central Salesland", rol: "SuperAdmin", retailer: "Todos", zona: "Global", region: "Global", tiendaAsignadaId: "" }
      ];
    }

    return ContentService.createTextOutput(JSON.stringify({ stores: stores, users: users }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  if (action === "TEST_DRIVE") {
    try {
      const folderId = (e && e.parameter && e.parameter.folderId) ? e.parameter.folderId : GDRIVE_ROOT_FOLDER_ID;
      const folder = DriveApp.getFolderById(folderId);
      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        folderName: folder.getName(),
        folderId: folder.getId()
      })).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return ContentService.createTextOutput(JSON.stringify({ 
        success: false, 
        error: err.toString() 
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "OK", spacesSheetId: SPREADSHEET_SPACES_ID, usersSheetId: SPREADSHEET_USERS_ID }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder(parentFolder, folderName) {
  const folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = getSpacesSpreadsheet();

    if (data.action === "POST_AUDIT_LOG" || data.action === "SYNC_AUDIT_WITH_DRIVE") {
      const payload = data.payload;
      const positions = payload.positions || [];
      const now = new Date();
      
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = String(now.getFullYear());
      const dateStr = `${day}-${month}-${year}`; // ej. 18-09-2026
      const dateFormatted = `${day}/${month}/${year}`;
      const timeFormatted = String(payload.fechaHora || "").split(" ")[1] || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // ==============================================================
      // 1. GESTIÓN DE GOOGLE DRIVE (Carpetas, Excel y Fotos)
      // ==============================================================
      let driveUrl = "";
      let driveError = "";
      try {
        const rootFolderId = payload.driveFolderId || GDRIVE_ROOT_FOLDER_ID;
        const rootFolder = DriveApp.getFolderById(rootFolderId);

        // Jerarquía oficial: Retailer -> Centro -> Año -> Fecha (DD-MM-YYYY)
        const retailerName = payload.retailer || "Retailer";
        const retailerFolder = getOrCreateFolder(rootFolder, retailerName);

        const storeName = payload.nombreTienda || "Centro";
        const storeFolder = getOrCreateFolder(retailerFolder, storeName);

        const yearFolder = getOrCreateFolder(storeFolder, year);
        const dateFolder = getOrCreateFolder(yearFolder, dateStr);
        driveUrl = dateFolder.getUrl();

        // 1.1 Guardar archivo Excel oficial (.xlsx)
        if (payload.excelFile && payload.excelFile.base64) {
          const cleanExcel = String(payload.excelFile.base64).replace(/^data:.*?;base64,/, '');
          const excelBytes = Utilities.base64Decode(cleanExcel);
          const excelBlob = Utilities.newBlob(
            excelBytes, 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
            payload.excelFile.filename || `Auditoria_${storeName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${dateStr}.xlsx`
          );
          dateFolder.createFile(excelBlob);
        }

        // 1.2 Guardar fotos de evidencia individuales (.jpg)
        if (payload.photos && Array.isArray(payload.photos) && payload.photos.length > 0) {
          payload.photos.forEach(function(photo) {
            if (photo.base64) {
              const cleanBase64 = String(photo.base64).replace(/^data:image\/\w+;base64,/, '').replace(/^data:.*?;base64,/, '');
              const photoBytes = Utilities.base64Decode(cleanBase64);
              const photoBlob = Utilities.newBlob(
                photoBytes, 
                "image/jpeg", 
                photo.filename || `Evidencia_${Date.now()}.jpg`
              );
              dateFolder.createFile(photoBlob);
            }
          });
        }
      } catch (driveErr) {
        Logger.log("Aviso en Drive: " + driveErr.toString());
        driveError = driveErr.toString();
      }

      // ==============================================================
      // 2. PESTAÑA ESPECÍFICA DE LA TIENDA EN GOOGLE SHEETS
      // ==============================================================
      try {
        const storeSheetName = (payload.nombreTienda || "Tienda").slice(0, 30);
        let storeSheet = ss.getSheetByName(storeSheetName);
        
        if (!storeSheet) {
          storeSheet = ss.insertSheet(storeSheetName);
          const headers = [
            "Fecha", "Hora", "Tienda", "Espacio", "Posición", 
            "Modelo esperado", "Modelo detectado", "IMEI", "Estado"
          ];
          storeSheet.appendRow(headers);
          
          const headerRange = storeSheet.getRange(1, 1, 1, headers.length);
          headerRange.setBackground("#009ca6").setFontColor("#FFFFFF").setFontWeight("bold");
          storeSheet.setFrozenRows(1);
        }

        positions.forEach(function(p) {
          const isOk = p.estadoPosicion === 'OK';
          const isInc = p.estadoPosicion === 'Incidencia';
          const estadoLabel = isOk ? 'OK' : isInc ? 'INCIDENCIA' : 'NO AUDITADO';

          const rowNum = storeSheet.getLastRow() + 1;
          storeSheet.appendRow([
            dateFormatted,
            timeFormatted,
            payload.nombreTienda,
            p.mesaId || "Xiaomi",
            String(p.posicionNumero).padStart(2, '0'),
            p.modeloOficial,
            p.modeloDetectado || "-",
            p.imeiSerial || "-",
            estadoLabel
          ]);

          // Colores de estado idénticos a la directriz
          const statusCell = storeSheet.getRange(rowNum, 9);
          if (isOk) {
            statusCell.setBackground("#D1FAE5").setFontColor("#065F46").setFontWeight("bold");
          } else if (isInc) {
            statusCell.setBackground("#FEE2E2").setFontColor("#991B1B").setFontWeight("bold");
          } else {
            statusCell.setBackground("#FEF3C7").setFontColor("#92400E").setFontWeight("bold");
          }
        });
      } catch (sheetErr) {
        Logger.log("Aviso en Pestaña de Tienda: " + sheetErr.toString());
      }

      // ==============================================================
      // 3. LOG CENTRALIZADO EN AUDITORIAS_LOG
      // ==============================================================
      let logSheet = ss.getSheetByName("Auditorias_Log");
      if (!logSheet) {
        logSheet = ss.insertSheet("Auditorias_Log");
        logSheet.appendRow([
          "Audit_ID", "Fecha_Hora", "Usuario_Email", "Tienda_ID", "Tienda_Nombre", 
          "Mesa_Espacio", "Posicion_Numero", "Modelo_Oficial", "Modelo_Detectado", 
          "IMEI_Serial", "Estado_Posicion", "Tipo_Incidencia", "Es_Maqueta", "Comentarios"
        ]);
        logSheet.getRange(1, 1, 1, 14).setBackground("#1F2937").setFontColor("#FFFFFF").setFontWeight("bold");
      }

      positions.forEach(function(p) {
        logSheet.appendRow([
          payload.auditId,
          payload.fechaHora || `${dateFormatted} ${timeFormatted}`,
          payload.usuarioEmail,
          payload.tiendaId,
          payload.nombreTienda,
          p.mesaId,
          p.posicionNumero,
          p.modeloOficial,
          p.modeloDetectado,
          p.imeiSerial || "",
          p.estadoPosicion,
          p.tipoIncidencia || "",
          p.esMaqueta ? "SI" : "NO",
          p.comentarios || ""
        ]);
      });

      return ContentService.createTextOutput(JSON.stringify({ 
        success: true, 
        count: positions.length,
        driveFolderUrl: driveUrl || `https://drive.google.com/drive/folders/${GDRIVE_ROOT_FOLDER_ID}`,
        driveError: driveError || undefined
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Acción no reconocida" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
