"""Pruebas aisladas de registro, privacidad y revisión de mediciones."""
import os
import tempfile
import unittest
from contextlib import closing
from datetime import date, timedelta

from fastapi import FastAPI
from fastapi.testclient import TestClient

import auth
import mediciones_campo
from services import db


class MedicionesCampoTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.previo = db.DB_PATH
        db.DB_PATH = os.path.join(self.tmp.name, "test.db")
        db.init_db()
        auth.init_auth_db()
        mediciones_campo.init_mediciones_db()
        mediciones_campo.init_mediciones_db()
        self.ids = {}
        with closing(db.get_connection()) as conn, conn:
            for nombre, rol in (("admin", "admin"), ("uno", "investigador"), ("dos", "investigador")):
                cursor = conn.execute("INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?)",
                                      (nombre, f"{nombre}@example.test", auth.hash_password("Prueba-segura-123"), rol))
                self.ids[nombre] = cursor.lastrowid
        app = FastAPI()
        app.include_router(auth.router)
        app.include_router(mediciones_campo.router)
        self.client = TestClient(app)
        self.headers = {}
        for nombre in self.ids:
            r = self.client.post("/auth/login", json={"correo": f"{nombre}@example.test", "password": "Prueba-segura-123"})
            self.headers[nombre] = {"Authorization": "Bearer " + r.json()["access_token"]}
        self.datos = {
            "cuenca_id": "quillcay", "quebrada": "Shallap", "periodo": "2025-seca", "temporada": "seca",
            "fecha_medicion": "2025-07-15", "fuente": "Registro de campo de prueba",
            "metodo": "Medición de pH con equipo calibrado; coberturas según SIG",
            "area_km2": 249.5, "roca_expuesta_km2": 35.2, "pct_sulfuros": 48,
            "pct_carbonatos": 10, "lluvia_mm": 110, "pct_bofedal": 2.5,
            "pct_veg_humeda_est": 8, "ph_min": 4.1,
        }

    def tearDown(self):
        self.client.close()
        db.DB_PATH = self.previo
        self.tmp.cleanup()

    def crear(self, nombre="uno"):
        r = self.client.post("/admin/mediciones", headers=self.headers[nombre], json=self.datos)
        self.assertEqual(r.status_code, 201, r.text)
        return r.json()

    def test_autoria_y_persistencia(self):
        datos = self.crear()
        self.assertEqual(datos["creado_por"], self.ids["uno"])
        self.assertEqual(datos["estado"], "pendiente")
        self.assertIsNone(datos["conductividad"])
        with closing(db.get_connection()) as conn:
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM mediciones_campo").fetchone()[0], 1)
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM reportes").fetchone()[0], 0)
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM revisiones_mediciones").fetchone()[0], 0)

    def test_aislamiento_y_filtros(self):
        uno = self.crear()
        self.crear("dos")
        self.crear("admin")
        for nombre, total in (("uno", 1), ("dos", 1), ("admin", 3)):
            r = self.client.get("/admin/mediciones", headers=self.headers[nombre])
            self.assertEqual(r.status_code, 200)
            self.assertEqual(r.json()["total"], total)
        self.assertEqual(self.client.get(f"/admin/mediciones/{uno['id']}", headers=self.headers["dos"]).status_code, 404)
        self.assertEqual(self.client.get(f"/admin/mediciones/{uno['id']}", headers=self.headers["admin"]).status_code, 200)
        r = self.client.get("/admin/mediciones?cuenca_id=pachacoto", headers=self.headers["admin"])
        self.assertEqual(r.json()["total"], 0)
        r = self.client.get("/admin/mediciones?por_pagina=1", headers=self.headers["admin"])
        self.assertEqual(r.json()["total"], 3)
        self.assertEqual(len(r.json()["mediciones"]), 1)

    def test_validaciones(self):
        invalidos = (
            ("ph_min", 15), ("lluvia_mm", -1), ("pct_bofedal", 101),
            ("area_km2", 0), ("roca_expuesta_km2", 1000), ("pct_sulfuros", "NaN"),
            ("fuente", " "), ("metodo", ""), ("periodo", "2025-humeda"),
            ("fecha_medicion", (date.today() + timedelta(days=1)).isoformat()),
            ("creado_por", self.ids["admin"]), ("estado", "aprobado"),
        )
        for campo, valor in invalidos:
            with self.subTest(campo=campo):
                r = self.client.post("/admin/mediciones", headers=self.headers["uno"], json={**self.datos, campo: valor})
                self.assertEqual(r.status_code, 422, r.text)
        r = self.client.post("/admin/mediciones", headers=self.headers["uno"], json={**self.datos, "cuenca_id": "inexistente"})
        self.assertEqual(r.status_code, 404)

    def test_sin_sesion_y_suspension(self):
        self.assertEqual(self.client.post("/admin/mediciones", json=self.datos).status_code, 401)
        self.assertEqual(self.client.get("/admin/mediciones").status_code, 401)
        with closing(db.get_connection()) as conn, conn:
            conn.execute("UPDATE usuarios SET estado='suspendido' WHERE id = ?", (self.ids["uno"],))
        self.assertEqual(self.client.post("/admin/mediciones", headers=self.headers["uno"], json=self.datos).status_code, 401)

    def test_aprobacion_y_revision_unica(self):
        datos = self.crear()
        ruta = f"/admin/mediciones/{datos['id']}/revision"
        r = self.client.patch(ruta, headers=self.headers["uno"], json={"estado": "aprobado"})
        self.assertEqual(r.status_code, 403)
        self.assertEqual(self.client.patch(ruta, json={"estado": "aprobado"}).status_code, 401)
        r = self.client.patch(ruta, headers=self.headers["admin"], json={"estado": "aprobado", "observacion": "Fuente y método revisados"})
        self.assertEqual(r.status_code, 200, r.text)
        self.assertEqual(r.json()["revisado_por"], self.ids["admin"])
        self.assertIsNotNone(r.json()["revisado_en"])
        self.assertEqual(self.client.patch(ruta, headers=self.headers["admin"], json={"estado": "rechazado", "observacion": "Otro motivo"}).status_code, 409)
        r = self.client.get("/admin/mediciones?estado=aprobado", headers=self.headers["admin"])
        self.assertEqual(r.json()["total"], 1)
        with closing(db.get_connection()) as conn:
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM revisiones_mediciones").fetchone()[0], 1)

    def test_rechazo_y_no_encontrado(self):
        datos = self.crear()
        ruta = f"/admin/mediciones/{datos['id']}/revision"
        self.assertEqual(self.client.patch(ruta, headers=self.headers["admin"], json={"estado": "rechazado"}).status_code, 422)
        r = self.client.patch(ruta, headers=self.headers["admin"], json={"estado": "rechazado", "observacion": "Falta evidencia de la fuente"})
        self.assertEqual(r.status_code, 200)
        r = self.client.get("/admin/mediciones?estado=aprobado", headers=self.headers["admin"])
        self.assertEqual(r.json()["total"], 0)
        self.assertEqual(self.client.get("/admin/mediciones/inexistente", headers=self.headers["admin"]).status_code, 404)
        self.assertEqual(self.client.patch("/admin/mediciones/inexistente/revision", headers=self.headers["admin"], json={"estado": "aprobado"}).status_code, 404)


if __name__ == "__main__":
    unittest.main()
