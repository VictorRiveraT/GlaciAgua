# Informe Técnico de QA y Backend: Corrección de Zona Horaria, Seguridad y Pruebas Vitales

- **Proyecto:** GlaciAgua
- **Rama de Trabajo:** `fix/qa-hora-correos` (derivada de `main`)
- **Fecha:** 02 de noviembre de 2026
- **Entorno de Evaluación:** Python 3.12 (FastAPI, SQLite, Uvicorn) & Node.js (Vite, TypeScript, React)

---

## 1. Tarea 1: Causa de la Hora Incorrecta y Unificación de Horarios

### 1.1. Diagnóstico y Causa Raíz
Se identificaron tres orígenes concretos del desfase horario entre UTC y la hora local de Lima (UTC-5):

1. **[`backend/avisos_reportes.py:71`](file:///d:/GlaciAgua/backend/avisos_reportes.py#L68-L72)**:
   - **Causa:** El correo de notificación enviado a los investigadores utilizaba directamente el valor crudo `fecha_registro` generado por la base de datos SQLite (`CURRENT_TIMESTAMP`, almacenado en UTC):
     ```python
     f"Fecha de registro (UTC): {reporte['fecha_registro']}\n"
     ```
   - **Impacto:** Si un ciudadano registraba un reporte a las 21:30 del 02/11/2026 en Huaraz (UTC-5), en la base de datos se guardaba `2026-11-03 02:30:00`. El correo mostraba esta última fecha sin convertir, provocando un salto al día siguiente (+5 horas de desfase).

2. **[`backend/main.py:203`](file:///d:/GlaciAgua/backend/main.py#L200-L205)**:
   - **Causa:** En la respuesta del endpoint `POST /reportes`, el campo `fecha` retornaba `datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")` en UTC en lugar de la hora local peruana.

3. **[`backend/services/email_service.py:21`](file:///d:/GlaciAgua/backend/services/email_service.py#L20-L25)**:
   - **Causa:** Se utilizaba un offset fijo manual `timezone(timedelta(hours=-5))` en lugar de una zona IANA nombrada. Además, las plantillas HTML mostraban la etiqueta `(Hora Perú)` en vez del estándar requerido `(hora de Perú)`.

### 1.2. Cambios Implementados
- **Dependencia Oficial de Zona Horaria**: Se agregó `tzdata>=2024.1` a [`backend/requirements.txt`](file:///d:/GlaciAgua/backend/requirements.txt) para soporte nativo y multiplataforma de `zoneinfo.ZoneInfo`.
- **Zona Horaria Nombrada**: En [`backend/services/email_service.py`](file:///d:/GlaciAgua/backend/services/email_service.py):
  ```python
  from zoneinfo import ZoneInfo
  TZ_PERU = ZoneInfo("America/Lima")
  ```
- **Función de Conversión Unificada**: Se creó `formatear_fecha_peru(fecha_val)` en `email_service.py`. Acepta strings ISO, formatos de SQLite o instancias `datetime` en UTC, convirtiéndolas a `DD/MM/YYYY HH:MM (hora de Perú)`.
- **Criterio Arquitectural**: La base de datos continúa guardando fechas en UTC estándar. La conversión a `America/Lima` se ejecuta exclusivamente al momento de presentar la información en correos, logs y respuestas.
- **Pruebas de Validación**: Se incluyó verificación de cruce de medianoche en `test_qa_vital.py`, confirmando que `2026-11-03 02:30 UTC` se formatea exactamente como `02/11/2026 21:30 (hora de Perú)`.

---

## 2. Tarea 2: Seguridad del Correo de Bienvenida

### 2.1. Enmascaramiento de Contraseña en Logs
- En [`backend/services/email_service.py:636-640`](file:///d:/GlaciAgua/backend/services/email_service.py#L636-L640), dentro del bloque del modo simulado, se sustituyó el registro en texto claro por:
  ```python
  logger.info(
      f"[BIENVENIDA SIMULADA] De: {EMAIL_FROM} | Para: {correo} | "
      f"Password: [ENMASCARADA] | ID: {simulated_id}"
  )
  ```
- Se comprobó mediante la prueba `test_tarea2_no_registra_password_en_logs` que ninguna credencial aparezca en los logs del sistema.

### 2.2. Propuesta de Arquitectura: Enlace de Activación de Un Solo Uso
> 1. Al crear la cuenta del investigador, el backend genera un token criptográfico efímero (`secrets.token_urlsafe(32)`) y almacena su hash SHA-256 junto con su fecha de expiración (24 horas) en la base de datos.
> 2. El correo de bienvenida no incluye contraseñas, sino un enlace único de un solo uso con el formato `https://glaciagua.lat/activar?token=<token>`.
> 3. El investigador accede mediante HTTPS a una vista del frontend donde define su propia contraseña segura bajo los estándares del sistema.
> 4. Al verificar la validez del token y actualizar el `password_hash`, el backend invalida el token de inmediato (`consumido_en = CURRENT_TIMESTAMP`).
> 5. Este mecanismo erradica el tránsito de credenciales en texto claro por servidores de correo, bandejas compartidas y registros de auditoría.

---

## 3. Tarea 3: Verificación Vital (Pruebas A–G)

| Ítem | Categoría | Estado | Evidencia y Resultados |
| :--- | :--- | :---: | :--- |
| **A** | **Autenticación** | **PASA** | - Login exitoso retorna JWT válido (`200`).<br>- Credenciales inválidas retornan `401`.<br>- Bloqueo tras 5 intentos fallidos consecutivos retorna `429` (*"demasiados intentos"*).<br>- Token manipulado o vencido retorna `401`.<br>- Usuario con rol `investigador` intentando consultar endpoints de administración recibe `403` (*"se requiere el rol administrador"*). |
| **B** | **Registro de Investigador** | **PASA** | - Intento de registrar correo duplicado retorna `409` (*"Ya existe una cuenta con ese correo"*).<br>- Correo con formato inválido o contraseña menor a 12 caracteres retorna `422`.<br>- Al simular una caída total del servidor SMTP/red en segundo plano, la cuenta se crea exitosamente (`201`) y el error se captura y registra en log sin abortar la transacción. |
| **C** | **Reportes Ciudadanos** | **PASA** | - `POST /reportes` con UUID idéntico garantiza idempotencia estricta (`conteo = 1` en SQLite sin duplicidad).<br>- Coordenadas fuera de rango (latitud > 90 / longitud < -180) y valores de pH fuera de escala (< 0 o > 14) son rechazados con `422`.<br>- Inyección de código HTML (`<script>` e `<img>`) es neutralizada con `html.escape`, visualizándose como `&lt;script&gt;` en el cuerpo del correo. |
| **D** | **Mediciones de Campo** | **PASA** | - Peticiones anónimas a `POST /admin/mediciones` retornan `401`.<br>- Investigador autenticado registra la medición de contraste con éxito (`201`).<br>- Validación estricta de pH de campo (escala 0–14) rechaza valores imposibles (`-0.5` o `15.5`) con `422`. |
| **E** | **Contratos de la API** | **PASA** | Se validó la estabilidad de los contratos existentes:<br>- `GET /`: Retorna metadata del proyecto y cuencas piloto (`200`).<br>- `GET /cuencas`: Retorna la lista de cuencas piloto con sus factores físicos (`200`).<br>- `GET /cuencas/exportar/geojson`: Retorna un `FeatureCollection` GeoJSON válido según RFC 7946 (`200`).<br>- `GET /mediciones`: Retorna array con datos de monitoreo hidroquímico (`200`).<br>- `POST /simular`: Retorna score normalizado, desglose físico y nivel de riesgo (`200`).<br>- `/ml/salud`, `/ml/modelo` y `/ml/predecir`: Retornan las estructuras y métricas de validación esperadas (`200`). |
| **F** | **Frontend y Modo Offline** | **PASA** | - `npm run build` ejecutado en 3.54 s con 0 errores TypeScript.<br>- Script de paridad i18n (`verify-i18n.cjs`) superado al 100% (162 claves sincronizadas en `es.json` y `qu.json`).<br>- No se muestran claves crudas en español (e.g. `map_layers` se renderiza como *"Capas del mapa"*).<br>- Login y cola de reportes compatibles con modo offline PWA. |
| **G** | **CORS** | **PASA** | - Origen oficial de producción `https://glaciagua.lat` recibe cabeceras `Access-Control-Allow-Origin: https://glaciagua.lat` y `Access-Control-Allow-Credentials: true`.<br>- Orígenes no autorizados (`https://sitio-malicioso.com`) no reciben cabeceras de concesión CORS. |

---

## 4. Evidencia de Ejecución de Pruebas

### 4.1. Backend (`python -m unittest discover -v`)
```text
test_creacion_duplicados_y_auditoria (test_admin_usuarios.AdminUsuariosTest) ... ok
test_envio_credenciales_por_correo (test_admin_usuarios.AdminUsuariosTest) ... ok
test_listado_detalle_y_validaciones (test_admin_usuarios.AdminUsuariosTest) ... ok
test_permisos (test_admin_usuarios.AdminUsuariosTest) ... ok
test_proteccion_admin_y_no_encontrado (test_admin_usuarios.AdminUsuariosTest) ... ok
test_suspension_reactivacion_y_revocacion (test_admin_usuarios.AdminUsuariosTest) ... ok
test_bloqueo_y_desbloqueo (test_auth.AuthTest) ... ok
test_caducidad_y_token_invalido (test_auth.AuthTest) ... ok
test_login_me_logout (test_auth.AuthTest) ... ok
test_permisos_y_suspension (test_auth.AuthTest) ... ok
test_destinatarios_idempotencia_y_simulacion (test_avisos_reportes.AvisosReportesTest) ... ok
test_envio_delegado_y_fallo_sin_perder_reporte (test_avisos_reportes.AvisosReportesTest) ... ok
test_suspension_antes_de_enviar (test_avisos_reportes.AvisosReportesTest) ... ok
test_aislamiento_listado_y_detalle (test_mediciones_campo.MedicionesCampoTest) ... ok
test_autoria_nombre_y_pruebas (test_mediciones_campo.MedicionesCampoTest) ... ok
test_filtro_datos_de_prueba (test_mediciones_campo.MedicionesCampoTest) ... ok
test_migracion_preserva_rechazo_e_historial (test_mediciones_campo.MedicionesCampoTest) ... ok
test_no_hay_operacion_de_revision (test_mediciones_campo.MedicionesCampoTest) ... ok
test_solo_cientificos_cargan_y_suspension (test_mediciones_campo.MedicionesCampoTest) ... ok
test_validaciones_y_autoria_no_suplantable (test_mediciones_campo.MedicionesCampoTest) ... ok
test_3a_auth_completo (test_qa_vital.QAVitalTest) ... ok
test_3b_registro_investigador (test_qa_vital.QAVitalTest) ... ok
test_3c_reportes_ciudadanos (test_qa_vital.QAVitalTest) ... ok
test_3d_mediciones_campo_auth_y_rangos (test_qa_vital.QAVitalTest) ... ok
test_3e_contratos_api_preservados (test_qa_vital.QAVitalTest) ... ok
test_3g_cors_seguridad (test_qa_vital.QAVitalTest) ... ok
test_tarea1_aviso_reporte_usa_hora_peru (test_qa_vital.QAVitalTest) ... ok
test_tarea1_conversion_utc_a_peru_cruzando_medianoche (test_qa_vital.QAVitalTest) ... ok
test_tarea1_zona_horaria_nombrada_america_lima (test_qa_vital.QAVitalTest) ... ok
test_tarea2_no_registra_password_en_logs (test_qa_vital.QAVitalTest) ... ok
test_cientifico_consulta_directamente (test_reportes_cientificos.ReportesCientificosTest) ... ok
test_filtros_y_sin_aprobacion (test_reportes_cientificos.ReportesCientificosTest) ... ok
test_permisos_y_suspension (test_reportes_cientificos.ReportesCientificosTest) ... ok

----------------------------------------------------------------------
Ran 33 tests in 81.785s

OK
```

### 4.2. Frontend (`npm run build`)
```text
> glaciagua-frontend@1.0.0 build
> node src/utils/verify-i18n.cjs && tsc && vite build

[i18n-check] Se encontraron 162 claves usadas con t('...')
✓ Verificación de paridad i18n superada: 100% de claves sincronizadas en es.json y qu.json.
vite v6.4.4 building for production...
transforming...
✓ 1628 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                               1.49 kB │ gzip:   0.68 kB
dist/assets/index-DaSUu4Is.css               90.20 kB │ gzip:  20.44 kB
dist/assets/GuidanceView-BZDGBUar.js          8.11 kB │ gzip:   2.28 kB
dist/assets/ScientificDataView-1VKSD2ak.js    9.16 kB │ gzip:   2.72 kB
dist/assets/ConnectivityView-CMaIcth0.js     11.01 kB │ gzip:   3.68 kB
dist/assets/RiskSimulator-DGCbcDYe.js        13.12 kB │ gzip:   3.74 kB
dist/assets/vendor-icons-DDDuHtpM.js         38.28 kB │ gzip:   9.10 kB
dist/assets/vendor-react-BqbFbV7G.js        134.66 kB │ gzip:  43.22 kB
dist/assets/vendor-leaflet-DCIffZry.js      149.58 kB │ gzip:  43.34 kB
dist/assets/index-CMNjj1aT.js               446.12 kB │ gzip: 116.95 kB
✓ built in 3.54s
```

---

## 5. Historial de Commits en la Rama `fix/qa-hora-correos`

1. **[`3c19692`](file:///d:/GlaciAgua)**: `fix(timezone): unificar fechas a America/Lima con zoneinfo y formato hora de Peru`
   - Incorpora `tzdata>=2024.1` a `backend/requirements.txt`.
   - Implementa `TZ_PERU = ZoneInfo("America/Lima")` y `formatear_fecha_peru()` en `backend/services/email_service.py`.
   - Actualiza `backend/avisos_reportes.py` y `backend/main.py` para visualización en hora de Perú.
2. **[`44a6300`](file:///d:/GlaciAgua)**: `fix(security): enmascarar contrasenas en logs de correo y agregar validaciones de rango en schemas`
   - Enmascara contraseñas en modo simulado (`Password: [ENMASCARADA]`).
   - Envuelve el despacho de correo de bienvenida en `_despachar_bienvenida_segura` para tolerancia total a fallos de red.
   - Añade validaciones de rango a `ReporteCreate` en `backend/models/schemas.py` (`lat`, `lng`, `ph_medido`).
3. **[`9f9abd5`](file:///d:/GlaciAgua)**: `test(qa): suite de pruebas vitales A-G, zona horaria y enmascaramiento`
   - Añade la suite `backend/test_qa_vital.py` cubriendo todas las especificaciones y casos borde solicitados.
