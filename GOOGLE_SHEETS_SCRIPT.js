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
    const sheet = usersSS.getSheetByName("BBDD Promotores") || 
                  usersSS.getSheetByName("usuarios") || 
                  usersSS.getSheetByName("Usuarios") || 
                  usersSS.getSheets()[0];
    if (!sheet) return [];

    const rows = sheet.getDataRange().getValues();
    if (rows.length < 2) return [];

    // Mapeo exacto según especificación:
    // Columna B (idx 1): Nombre de la persona
    // Columna C (idx 2): Usuario / Email
    // Columna D (idx 3): Contraseña
    // Columna E (idx 4): Rol
    // Columna F (idx 5): Nombre del GPV -> centros asignados para él
    // Columna G (idx 6): Nombre del AM -> centros asignados para él
    // Columna J (idx 9): Nombre de la Administradora -> centros asignados para ella
    // Columna K (idx 10): Centro asignado (para promotores)
    const COL_NOMBRE = 1;
    const COL_EMAIL = 2;
    const COL_PASS = 3;
    const COL_ROL = 4;
    const COL_GPV = 5;
    const COL_AM = 6;
    const COL_ADMIN = 9;
    const COL_CENTRO = 10;

    // Diccionarios acumuladores para recopilar todos los centros asignados a cada GPV, AM, Admin y Promotor
    const gpvCentersMap = {};   // clave: nombre en minúsculas -> array de nombres de centros
    const amCentersMap = {};    // clave: nombre en minúsculas -> array de nombres de centros
    const adminCentersMap = {}; // clave: nombre en minúsculas -> array de nombres de centros
    const promotorCentersMap = {}; // clave: email en minúsculas -> array de nombres de centros

    function addCenter(map, key, center) {
      if (!key || !center) return;
      const cleanKey = String(key).trim().toLowerCase();
      const cleanCenter = String(center).trim();
      if (!cleanKey || !cleanCenter) return;
      if (!map[cleanKey]) map[cleanKey] = [];
      if (map[cleanKey].indexOf(cleanCenter) === -1) {
        map[cleanKey].push(cleanCenter);
      }
    }

    // PASO 1: Recorrer todas las filas para construir los catálogos de centros por responsable
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const centro = row[COL_CENTRO] ? String(row[COL_CENTRO]).trim() : "";
      if (!centro) continue;

      const email = row[COL_EMAIL] ? String(row[COL_EMAIL]).trim().toLowerCase() : "";
      const gpv = row[COL_GPV] ? String(row[COL_GPV]).trim() : "";
      const am = row[COL_AM] ? String(row[COL_AM]).trim() : "";
      const admin = row[COL_ADMIN] ? String(row[COL_ADMIN]).trim() : "";

      if (email) addCenter(promotorCentersMap, email, centro);
      if (gpv) addCenter(gpvCentersMap, gpv, centro);
      if (am) addCenter(amCentersMap, am, centro);
      if (admin) addCenter(adminCentersMap, admin, centro);
    }

    // Función auxiliar para recuperar centros buscando por coincidencia con el nombre o email
    function findCentersForName(map, personName, personEmail) {
      const result = [];
      const cleanName = String(personName || "").trim().toLowerCase();
      const cleanEmail = String(personEmail || "").trim().toLowerCase();

      for (const key in map) {
        if (!key) continue;
        if ((cleanName && (key.indexOf(cleanName) !== -1 || cleanName.indexOf(key) !== -1)) ||
            (cleanEmail && (key.indexOf(cleanEmail) !== -1 || cleanEmail.indexOf(key) !== -1))) {
          map[key].forEach(function(c) {
            if (result.indexOf(c) === -1) result.push(c);
          });
        }
      }
      return result;
    }

    // PASO 2: Construir la lista de usuarios únicos deduciendo roles y asociando sus centros
    const usersMap = {};
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const email = String(row[COL_EMAIL] || "").trim();
      if (!email || email.indexOf("@") === -1) continue;

      const emailLower = email.toLowerCase();
      if (usersMap[emailLower]) {
        // Si el usuario ya existe en otra fila, añadir centro si no lo tiene
        const centro = row[COL_CENTRO] ? String(row[COL_CENTRO]).trim() : "";
        if (centro && usersMap[emailLower].centrosAsignados.indexOf(centro) === -1) {
          usersMap[emailLower].centrosAsignados.push(centro);
          usersMap[emailLower].tiendaAsignadaId = usersMap[emailLower].centrosAsignados.join(", ");
        }
        continue;
      }

      const nombre = String(row[COL_NOMBRE] || "").trim() || email.split("@")[0].toUpperCase();
      const password = String(row[COL_PASS] || "").trim();
      const rawRol = String(row[COL_ROL] || "").trim().toLowerCase();

      // Normalizar rol canónico
      let rol = "Promotor";
      if (rawRol.indexOf("admin") !== -1 || rawRol.indexOf("coordin") !== -1 || rawRol.indexOf("director") !== -1 || emailLower.indexOf("admin") !== -1) {
        rol = "SuperAdmin";
      } else if (rawRol === "am" || rawRol.indexOf("area") !== -1 || rawRol.indexOf("trainer") !== -1 || rawRol.indexOf("formador") !== -1 || emailLower.indexOf("am") !== -1) {
        rol = "AM";
      } else if (rawRol === "gpv" || emailLower.indexOf("gpv") !== -1) {
        rol = "GPV";
      } else {
        rol = "Promotor";
      }

      // Obtener lista de centros asignados según rol y columnas F, G, J o K
      let centrosAsignados = [];
      const centroFila = row[COL_CENTRO] ? String(row[COL_CENTRO]).trim() : "";

      if (rol === "GPV") {
        centrosAsignados = findCentersForName(gpvCentersMap, nombre, emailLower);
        if (centrosAsignados.length === 0 && centroFila) centrosAsignados.push(centroFila);
      } else if (rol === "AM") {
        centrosAsignados = findCentersForName(amCentersMap, nombre, emailLower);
        if (centrosAsignados.length === 0 && centroFila) centrosAsignados.push(centroFila);
      } else if (rol === "SuperAdmin") {
        centrosAsignados = findCentersForName(adminCentersMap, nombre, emailLower);
        if (centrosAsignados.length === 0 && centroFila) centrosAsignados.push(centroFila);
      } else {
        // Promotor: centro asignado en Columna K
        centrosAsignados = promotorCentersMap[emailLower] || (centroFila ? [centroFila] : []);
      }

      const cUpper = String(centroFila).toUpperCase();
      let userRetailer = "MediaMarkt";
      if (cUpper.indexOf("ECI") !== -1 || cUpper.indexOf("CORTE") !== -1) userRetailer = "El Corte Inglés";
      else if (cUpper.indexOf("FNAC") !== -1) userRetailer = "FNAC";
      else if (cUpper.indexOf("CRF") !== -1 || cUpper.indexOf("CARREFOUR") !== -1) userRetailer = "Carrefour";
      else if (cUpper.indexOf("ALCAMPO") !== -1 || cUpper.indexOf("ALCP") !== -1 || cUpper.indexOf("UTEBO") !== -1) userRetailer = "Alcampo";

      usersMap[emailLower] = {
        email: email,
        password: password,
        nombre: nombre,
        rol: rol,
        retailer: userRetailer,
        zona: "Cataluña",
        region: "Noreste",
        tiendaAsignadaId: centrosAsignados.length > 0 ? centrosAsignados.join(", ") : centroFila,
        centrosAsignados: centrosAsignados,
        gpv: row[COL_GPV] ? String(row[COL_GPV]).trim() : undefined,
        am: row[COL_AM] ? String(row[COL_AM]).trim() : undefined,
        administradora: row[COL_ADMIN] ? String(row[COL_ADMIN]).trim() : undefined
      };
    }

    const usersList = [];
    for (const em in usersMap) {
      usersList.push(usersMap[em]);
    }
    return usersList;
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
      const nameUpper = String(name).toUpperCase();
      const codeUpper = String(code).toUpperCase();
      const planUpper = String(planogram).toUpperCase();

      if (nameUpper.indexOf("ECI") !== -1 || nameUpper.indexOf("CORTE") !== -1 || codeUpper.indexOf("ECI") !== -1) {
        retailer = "El Corte Inglés";
      } else if (nameUpper.indexOf("FNAC") !== -1 || codeUpper.indexOf("FNAC") !== -1) {
        retailer = "FNAC";
      } else if (nameUpper.indexOf("CRF") !== -1 || nameUpper.indexOf("CARREFOUR") !== -1 || codeUpper.indexOf("CRF") !== -1) {
        retailer = "Carrefour";
      } else if (
        nameUpper.indexOf("ALCAMPO") !== -1 || 
        nameUpper.indexOf("ALCP") !== -1 || 
        nameUpper.indexOf("UTEBO") !== -1 || 
        codeUpper.indexOf("ALCP") !== -1 || 
        planUpper.indexOf("ALCAMPO") !== -1
      ) {
        retailer = "Alcampo";
      }

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

    // 3. Obtener lista única de modelos desde la pestaña "Planogramas" (Columna D = index 3)
    let devices = [];
    try {
      const planSheet = ss.getSheetByName("Planogramas") || ss.getSheetByName("Plantilla de planogramas");
      if (planSheet) {
        const pValues = planSheet.getDataRange().getValues();
        const devSet = {};
        for (let p = 1; p < pValues.length; p++) {
          const d = pValues[p][3]; // Columna D (índice 3)
          if (d && String(d).trim()) {
            devSet[String(d).trim()] = true;
          }
        }
        devices = Object.keys(devSet).sort();
      }
    } catch (pErr) {
      Logger.log("Aviso leyendo dispositivos de planogramas: " + pErr.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({ stores: stores, users: users, devices: devices }))
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

      // NOTA: Se ha prescindido de la creación de pestañas por tienda y de Auditorias_Log
      // en la hoja de cálculo principal para maximizar la velocidad de subida (ahorro de 8-10s)
      // y mantener la hoja de centros completamente limpia e inalterada.
      // Toda la información oficial se almacena en Google Drive (archivo Excel formateado y fotos).

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
