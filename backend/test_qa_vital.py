"""Suite integral de pruebas QA para GlaciAgua:
- Tarea 1: Verificación de zona horaria America/Lima (hora de Perú), conversión UTC y cruce de medianoche.
- Tarea 2: Enmascaramiento de contraseñas en logs (seguridad de correo).
- Tarea 3: Verificación vital A-G (Auth, Registro, Reportes, Mediciones, Contratos, CORS).
"""
import os
import tempfile
import unittest
import json
import logging
from contextlib import closing
from datetime import datetime, timezone
from unittest.mock import patch
from zoneinfo import ZoneInfo

from fastapi import FastAPI
from fastapi.testclient import TestClient

import auth
import admin_usuarios
import mediciones_campo
import avisos_reportes
import reportes_cientificos
from main import app as main_app
from models.schemas import EmailAlertaResponse
from services import db
from services.email_service import EmailService, obtener_ahora_peru, formatear_fecha_peru, TZ_PERU


class QAVitalTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.prev_db = db.DB_PATH
        db.DB_PATH = os.path.join(self.tmp.name, "test_qa.db")
        db.init_db()
        auth.init_auth_db()
        admin_usuarios.init_admin_db()
        mediciones_campo.init_mediciones_db()
        avisos_reportes.init_avisos_reportes_db()

        # Crear usuarios base: admin e investigador
        with closing(db.get_connection()) as conn, conn:
            cursor = conn.execute(
                "INSERT INTO usuarios (nombre, correo, password_hash, rol, institucion, estado) VALUES (?, ?, ?, ?, ?, ?)",
                ("Administrador", "admin@glaciagua.lat", auth.hash_password("Password-Admin-123!"), "admin", "GlaciAgua", "activo")
            )
            self.admin_id = cursor.lastrowid
            cursor2 = conn.execute(
                "INSERT INTO usuarios (nombre, correo, password_hash, rol, institucion, estado) VALUES (?, ?, ?, ?, ?, ?)",
                ("Dr. Investigador", "investigador@inaigem.gob.pe", auth.hash_password("Password-Invest-123!"), "investigador", "INAIGEM", "activo")
            )
            self.investigador_id = cursor2.lastrowid

        self.client = TestClient(main_app)

    def tearDown(self):
        self.client.close()
        db.DB_PATH = self.prev_db
        self.tmp.cleanup()

    def login(self, correo, password):
        return self.client.post("/auth/login", json={"correo": correo, "password": password})

    # =========================================================================
    # TAREA 1: HORA EN LOS CORREOS (TIMEZONE America/Lima Y CRUCE DE MEDIANOCHE)
    # =========================================================================
    def test_tarea1_zona_horaria_nombrada_america_lima(self):
        """Verifica que TZ_PERU sea una zona nombrada ZoneInfo('America/Lima') y no un offset fijo."""
        self.assertIsInstance(TZ_PERU, ZoneInfo)
        self.assertEqual(TZ_PERU.key, "America/Lima")

    def test_tarea1_conversion_utc_a_peru_cruzando_medianoche(self):
        """Verifica que 2026-11-03 02:30 UTC se muestre como 02/11/2026 21:30 (hora de Perú)."""
        # Caso cruce de medianoche: 3 de nov a las 02:30 UTC -> 2 de nov a las 21:30 en Lima
        dt_utc = datetime(2026, 11, 3, 2, 3, tzinfo=timezone.utc)
        resultado = formatear_fecha_peru(dt_utc)
        self.assertIn("02/11/2026 21:03", resultado)
        self.assertIn("hora de Perú", resultado)

        # Caso exacto de la consigna: 2026-11-03 02:30 UTC -> 02/11/2026 21:30
        dt_utc_consigna = datetime(2026, 11, 3, 2, 30, tzinfo=timezone.utc)
        resultado_consigna = formatear_fecha_peru(dt_utc_consigna)
        self.assertIn("02/11/2026 21:30", resultado_consigna)
        self.assertIn("hora de Perú", resultado_consigna)

        # Formato ISO string desde base de datos SQLite (UTC por defecto)
        iso_sqlite = "2026-11-03 02:30:00"
        resultado_str = formatear_fecha_peru(iso_sqlite)
        self.assertIn("02/11/2026 21:30", resultado_str)
        self.assertIn("hora de Perú", resultado_str)

        # Medianoche exacta: 2026-11-03 05:00 UTC -> 2026-11-03 00:00 hora de Perú
        dt_medianoche = datetime(2026, 11, 3, 5, 0, tzinfo=timezone.utc)
        res_med = formatear_fecha_peru(dt_medianoche)
        self.assertIn("03/11/2026 00:00", res_med)

    def test_tarea1_aviso_reporte_usa_hora_peru(self):
        """Verifica que el correo de aviso de reporte contenga la fecha convertida a hora de Perú."""
        with closing(db.get_connection()) as conn, conn:
            conn.execute(
                "INSERT INTO reportes (id, cuenca_id, quebrada, lat, lng, color_agua, comentarios, simulado, fecha_registro) "
                "VALUES ('rep-hora-test', 'quillcay', 'Shallap', -9.45, -77.40, 'amarillo', 'Observación', 1, '2026-11-03 02:30:00')"
            )

        avisos = avisos_reportes.preparar_avisos("rep-hora-test")
        self.assertEqual(len(avisos), 1)

        with patch.object(avisos_reportes.EmailService, "enviar_oficio_alerta") as mock_envio:
            mock_envio.return_value = EmailAlertaResponse(
                enviado=True, modo="simulado", mensaje="OK", destinatario="investigador@inaigem.gob.pe",
                id_envio="id-test", fecha_envio="2026-11-02T21:30:00-05:00"
            )
            avisos_reportes.enviar_aviso(avisos[0])
            mock_envio.assert_called_once()
            cuerpo = mock_envio.call_args.args[0].cuerpo_texto
            self.assertIn("02/11/2026 21:30", cuerpo)
            self.assertIn("hora de Perú", cuerpo)
            self.assertNotIn("(UTC)", cuerpo)

    # =========================================================================
    # TAREA 2: ENMASCARAMIENTO DE CONTRASEÑA EN LOGS DE MODO SIMULADO
    # =========================================================================
    def test_tarea2_no_registra_password_en_logs(self):
        """Verifica que la contraseña no aparezca en texto claro en los logs del modo simulado."""
        pwd_secreta = "ClaveUltraSecreta123!"
        with self.assertLogs("services.email_service", level="INFO") as log_capture:
            EmailService.enviar_bienvenida_investigador(
                nombre="Dra. Perez",
                correo="perez@inaigem.gob.pe",
                password=pwd_secreta,
                institucion="INAIGEM",
                admin_nombre="Administrador",
            )
            logs_text = "\n".join(log_capture.output)
            self.assertNotIn(pwd_secreta, logs_text, "¡La contraseña no debe aparecer en los logs!")
            self.assertIn("Password: [ENMASCARADA]", logs_text)

    # =========================================================================
    # TAREA 3.A: AUTENTICACIÓN (LOGIN, INTENTOS FALLIDOS, BLOQUEO, EXPIRACIÓN, 403)
    # =========================================================================
    def test_3a_auth_completo(self):
        # 1. Login correcto
        r_ok = self.login("admin@glaciagua.lat", "Password-Admin-123!")
        self.assertEqual(r_ok.status_code, 200)
        token_admin = r_ok.json()["access_token"]
        self.assertTrue(bool(token_admin))

        # 2. Login incorrecto -> 401
        r_fail = self.login("admin@glaciagua.lat", "Password-Erronea-000")
        self.assertEqual(r_fail.status_code, 401)

        # 3. Bloqueo tras 5 fallos (auth.py MAX_INTENTOS = 5 -> HTTP 429)
        for _ in range(4):  # 1 fallo previo + 4 fallos = 5 fallos
            self.login("admin@glaciagua.lat", "Password-Erronea-000")
        r_bloqueado = self.login("admin@glaciagua.lat", "Password-Erronea-000")
        self.assertEqual(r_bloqueado.status_code, 429)
        self.assertIn("intentos", r_bloqueado.json()["detail"].lower())

        # 4. Sesión expirada / token inválido -> 401
        r_invalido = self.client.get("/auth/me", headers={"Authorization": "Bearer token_invalido_xyz"})
        self.assertEqual(r_invalido.status_code, 401)

        # 5. Investigador no puede acceder a rutas de administración -> 403
        r_inv_login = self.login("investigador@inaigem.gob.pe", "Password-Invest-123!")
        self.assertEqual(r_inv_login.status_code, 200)
        token_inv = r_inv_login.json()["access_token"]
        h_inv = {"Authorization": f"Bearer {token_inv}"}

        r_admin_forbidden = self.client.get("/admin/usuarios", headers=h_inv)
        self.assertEqual(r_admin_forbidden.status_code, 403)
        self.assertIn("administrador", r_admin_forbidden.json()["detail"].lower())

    # =========================================================================
    # TAREA 3.B: REGISTRO DE INVESTIGADOR (DUPLICADO 409, 422, BACKGROUND EMAIL)
    # =========================================================================
    def test_3b_registro_investigador(self):
        r_admin = self.login("admin@glaciagua.lat", "Password-Admin-123!")
        token_admin = r_admin.json()["access_token"]
        h_admin = {"Authorization": f"Bearer {token_admin}"}

        # 1. Correo duplicado -> 409
        r_dup = self.client.post("/admin/usuarios", headers=h_admin, json={
            "nombre": "Duplicado", "correo": "investigador@inaigem.gob.pe",
            "password": "Password-Fuerte-2026!", "institucion": "INAIGEM"
        })
        self.assertEqual(r_dup.status_code, 409)

        # 2. Correo inválido -> 422
        r_bad_email = self.client.post("/admin/usuarios", headers=h_admin, json={
            "nombre": "Invalido", "correo": "correo-no-valido",
            "password": "Password-Fuerte-2026!", "institucion": "INAIGEM"
        })
        self.assertEqual(r_bad_email.status_code, 422)

        # 3. Contraseña débil (< 12 caracteres) -> 422
        r_weak_pwd = self.client.post("/admin/usuarios", headers=h_admin, json={
            "nombre": "Nuevo", "correo": "nuevo@inaigem.gob.pe",
            "password": "corta", "institucion": "UPCH"
        })
        self.assertEqual(r_weak_pwd.status_code, 422)

        # 4. Fallo de envío de correo en segundo plano NO impide la creación de cuenta (201)
        with patch.object(EmailService, "enviar_bienvenida_investigador", side_effect=RuntimeError("Servidor SMTP caído")):
            r_crear = self.client.post("/admin/usuarios", headers=h_admin, json={
                "nombre": "Lic. Robusto", "correo": "robusto@inaigem.gob.pe",
                "password": "Password-Fuerte-2026!", "institucion": "INAIGEM"
            })
            self.assertEqual(r_crear.status_code, 201)
            self.assertEqual(r_crear.json()["correo"], "robusto@inaigem.gob.pe")

        # Verificar que el usuario existe en base de datos
        with closing(db.get_connection()) as conn:
            usuario = conn.execute("SELECT correo FROM usuarios WHERE correo = 'robusto@inaigem.gob.pe'").fetchone()
            self.assertIsNotNone(usuario)

    # =========================================================================
    # TAREA 3.C: REPORTES CIUDADANOS (IDEMPOTENCIA, RANGOS 422, ANTI-INYECCIÓN)
    # =========================================================================
    def test_3c_reportes_ciudadanos(self):
        uuid_test = "rep-idempotencia-uuid-1234"
        payload_base = {
            "id": uuid_test,
            "cuenca_id": "quillcay",
            "quebrada": "Shallap",
            "lat": -9.42,
            "lng": -77.45,
            "color_agua": "amarillo_ferroso",
            "ph_medido": 4.2,
            "comentarios": "Agua de color óxido observada cerca de bocatoma",
            "simulado": True
        }

        # 1. Primer envío -> 201 Created
        r1 = self.client.post("/reportes", json=payload_base)
        self.assertEqual(r1.status_code, 201)
        self.assertIn("exitosamente", r1.json()["mensaje"])

        # 2. Segundo envío con el mismo UUID -> 201 Idempotente (sin duplicar en BD)
        r2 = self.client.post("/reportes", json=payload_base)
        self.assertEqual(r2.status_code, 201)
        self.assertIn("idempotente", r2.json()["mensaje"])
        with closing(db.get_connection()) as conn:
            conteo = conn.execute("SELECT COUNT(*) FROM reportes WHERE id = ?", (uuid_test,)).fetchone()[0]
            self.assertEqual(conteo, 1)

        # 3. Valores fuera de rango (lat/lng, pH) -> 422
        # Lat fuera de rango (> 90)
        r_bad_lat = self.client.post("/reportes", json={**payload_base, "id": "uuid-bad-lat", "lat": 105.0})
        self.assertEqual(r_bad_lat.status_code, 422)

        # Lng fuera de rango (< -180)
        r_bad_lng = self.client.post("/reportes", json={**payload_base, "id": "uuid-bad-lng", "lng": -250.0})
        self.assertEqual(r_bad_lng.status_code, 422)

        # pH fuera de rango (> 14)
        r_bad_ph = self.client.post("/reportes", json={**payload_base, "id": "uuid-bad-ph", "ph_medido": 16.5})
        self.assertEqual(r_bad_ph.status_code, 422)

        # pH fuera de rango (< 0)
        r_bad_ph_neg = self.client.post("/reportes", json={**payload_base, "id": "uuid-bad-ph-neg", "ph_medido": -1.0})
        self.assertEqual(r_bad_ph_neg.status_code, 422)

        # 4. Anti-inyección: el aviso por correo escapa HTML en campos del público
        xss_payload = {
            **payload_base,
            "id": "uuid-xss-test",
            "quebrada": "<script>alert('xss')</script>Sector",
            "comentarios": "Observación comunitaria sin scripts"
        }
        with patch.object(avisos_reportes.EmailService, "enviar_oficio_alerta") as mock_envio:
            mock_envio.return_value = EmailAlertaResponse(
                enviado=True, modo="simulado", mensaje="OK", destinatario="investigador@inaigem.gob.pe",
                id_envio="id-test", fecha_envio="2026-11-02T21:30:00-05:00"
            )
            r_xss = self.client.post("/reportes", json=xss_payload)
            self.assertEqual(r_xss.status_code, 201)
            mock_envio.assert_called_once()
            cuerpo = mock_envio.call_args.args[0].cuerpo_texto
            self.assertNotIn("<script>", cuerpo)
            self.assertIn("&lt;script&gt;", cuerpo)

    # =========================================================================
    # TAREA 3.D: MEDICIONES DE CAMPO (AUTENTICACIÓN Y RANGO PH)
    # =========================================================================
    def test_3d_mediciones_campo_auth_y_rangos(self):
        medicion_base = {
            "cuenca_id": "quillcay",
            "quebrada": "Shallap",
            "periodo": "2026-seca",
            "temporada": "seca",
            "fecha_medicion": "2026-07-15",
            "fuente": "Datos de contraste de campo INAIGEM",
            "metodo": "Sonda multiparamétrica Hanna HI98194",
            "area_km2": 249.5,
            "roca_expuesta_km2": 36.0,
            "pct_sulfuros": 50.0,
            "pct_carbonatos": 10.0,
            "lluvia_mm": 120.0,
            "pct_bofedal": 5.0,
            "pct_veg_humeda_est": 6.0,
            "ph_min": 3.85,
            "es_prueba": True,
        }

        # 1. Sin autenticación -> 401
        r_anon = self.client.post("/admin/mediciones", json=medicion_base)
        self.assertEqual(r_anon.status_code, 401)

        # 2. Con usuario investigador autenticado -> 201
        r_login = self.login("investigador@inaigem.gob.pe", "Password-Invest-123!")
        token_inv = r_login.json()["access_token"]
        h_inv = {"Authorization": f"Bearer {token_inv}"}

        r_ok = self.client.post("/admin/mediciones", headers=h_inv, json=medicion_base)
        self.assertEqual(r_ok.status_code, 201)
        self.assertEqual(r_ok.json()["ph_min"], 3.85)

        # 3. Rango válido de pH (0 a 14) -> fuera de rango da 422
        r_bad_ph_high = self.client.post("/admin/mediciones", headers=h_inv,
                                         json={**medicion_base, "ph_min": 15.5})
        self.assertEqual(r_bad_ph_high.status_code, 422)

        r_bad_ph_neg = self.client.post("/admin/mediciones", headers=h_inv,
                                        json={**medicion_base, "ph_min": -0.5})
        self.assertEqual(r_bad_ph_neg.status_code, 422)

    # =========================================================================
    # TAREA 3.E: CONTRATOS DE LA API (FORMATOS PRESERVADOS)
    # =========================================================================
    def test_3e_contratos_api_preservados(self):
        # GET /
        r_root = self.client.get("/")
        self.assertEqual(r_root.status_code, 200)
        self.assertIn("proyecto", r_root.json())
        self.assertIn("cuencas_piloto", r_root.json())

        # GET /cuencas
        r_cuencas = self.client.get("/cuencas")
        self.assertEqual(r_cuencas.status_code, 200)
        self.assertIsInstance(r_cuencas.json(), list)
        self.assertGreater(len(r_cuencas.json()), 0)
        self.assertIn("id", r_cuencas.json()[0])

        # GET /cuencas/exportar/geojson
        r_geojson = self.client.get("/cuencas/exportar/geojson")
        self.assertEqual(r_geojson.status_code, 200)
        self.assertEqual(r_geojson.json()["type"], "FeatureCollection")
        self.assertIn("features", r_geojson.json())

        # GET /mediciones
        r_med = self.client.get("/mediciones")
        self.assertEqual(r_med.status_code, 200)
        self.assertIsInstance(r_med.json(), list)

        # POST /simular
        r_sim = self.client.post("/simular", json={
            "roca_expuesta": 36.0,
            "potencial_acido": 55.0,
            "bofedal": 24.0,
            "lluvia": 65.0
        })
        self.assertEqual(r_sim.status_code, 200)
        self.assertIn("score_normalizado", r_sim.json())
        self.assertIn("nivel_riesgo", r_sim.json())

        # GET /ml/salud
        r_salud = self.client.get("/ml/salud")
        self.assertEqual(r_salud.status_code, 200)
        self.assertIn("estado", r_salud.json())

        # GET /ml/modelo (con mock de MLClient para validar contrato sin depender del microservicio externo)
        from services.ml_client import MLClient
        with patch.object(MLClient, "obtener_info_modelo") as mock_ml_info:
            mock_ml_info.return_value = {
                "version": "1.0.0",
                "metricas_validacion": {"r2_score": 0.89, "rmse": 0.32},
                "importancia_variables": {"roca_expuesta": 0.42, "potencial_acido": 0.35}
            }
            r_modelo = self.client.get("/ml/modelo")
            self.assertEqual(r_modelo.status_code, 200)
            self.assertIn("version", r_modelo.json())
            self.assertIn("metricas_validacion", r_modelo.json())

        # POST /ml/predecir
        with patch.object(MLClient, "predecir_microcuencas") as mock_ml_pred:
            mock_ml_pred.return_value = {
                "resultados": [{
                    "id": "pred-1",
                    "ph_estimado": 4.12,
                    "incertidumbre_ph": 0.25,
                    "nivel_riesgo": "Alto"
                }]
            }
            r_pred = self.client.post("/ml/predecir", json=[{
                "id": "pred-1",
                "area_km2": 249.5,
                "roca_expuesta_km2": 36.0,
                "pct_sulfuros": 55.0,
                "pct_carbonatos": 8.0,
                "lluvia_mm": 185.0,
                "pct_bofedal": 24.0,
                "pct_veg_humeda_est": 28.8,
                "temporada": "humeda"
            }])
            self.assertEqual(r_pred.status_code, 200)
            self.assertIn("resultados", r_pred.json())

    # =========================================================================
    # TAREA 3.G: CORS (ORIGEN AUTORIZADO VS NO AUTORIZADO)
    # =========================================================================
    def test_3g_cors_seguridad(self):
        # Origen autorizado de producción
        r_auth_origin = self.client.options(
            "/reportes",
            headers={
                "Origin": "https://glaciagua.lat",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type"
            }
        )
        self.assertEqual(r_auth_origin.headers.get("access-control-allow-origin"), "https://glaciagua.lat")
        self.assertEqual(r_auth_origin.headers.get("access-control-allow-credentials"), "true")

        # Origen no autorizado
        r_bad_origin = self.client.options(
            "/reportes",
            headers={
                "Origin": "https://sitio-malicioso.com",
                "Access-Control-Request-Method": "POST"
            }
        )
        self.assertNotEqual(r_bad_origin.headers.get("access-control-allow-origin"), "https://sitio-malicioso.com")
        self.assertIsNone(r_bad_origin.headers.get("access-control-allow-origin"))


if __name__ == "__main__":
    unittest.main()
