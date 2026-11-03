"""Pruebas aisladas: python -m unittest test_auth test_admin_usuarios -v."""
import os
import tempfile
import unittest
from contextlib import closing

from fastapi import FastAPI
from fastapi.testclient import TestClient

import auth
import admin_usuarios
from services import db


class AdminUsuariosTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.previo = db.DB_PATH
        db.DB_PATH = os.path.join(self.tmp.name, "test.db")
        db.init_db()
        auth.init_auth_db()
        admin_usuarios.init_admin_db()
        admin_usuarios.init_admin_db()
        with closing(db.get_connection()) as conn, conn:
            cursor = conn.execute("""
                INSERT INTO usuarios (nombre, correo, password_hash, rol)
                VALUES ('Admin', 'admin@example.test', ?, 'admin')
            """, (auth.hash_password("Prueba-segura-123"),))
            self.admin_id = cursor.lastrowid
        app = FastAPI()
        app.include_router(auth.router)
        app.include_router(admin_usuarios.router)
        self.client = TestClient(app)
        self.headers = self.acceder("admin@example.test")

    def tearDown(self):
        self.client.close()
        db.DB_PATH = self.previo
        self.tmp.cleanup()

    def acceder(self, correo):
        respuesta = self.client.post("/auth/login", json={"correo": correo, "password": "Prueba-segura-123"})
        self.assertEqual(respuesta.status_code, 200, respuesta.text)
        return {"Authorization": "Bearer " + respuesta.json()["access_token"]}

    def crear(self):
        respuesta = self.client.post("/admin/usuarios", headers=self.headers, json={
            "nombre": "Investigador", "correo": "campo@example.test",
            "password": "Prueba-segura-123", "institucion": "UPCH",
        })
        self.assertEqual(respuesta.status_code, 201, respuesta.text)
        self.assertNotIn("password_hash", respuesta.json())
        return respuesta.json()["id"]

    def test_creacion_duplicados_y_auditoria(self):
        usuario_id = self.crear()
        respuesta = self.client.post("/admin/usuarios", headers=self.headers, json={
            "nombre": "Otro", "correo": "CAMPO@example.test", "password": "Prueba-segura-123",
        })
        self.assertEqual(respuesta.status_code, 409)
        with closing(db.get_connection()) as conn:
            usuario = conn.execute("SELECT * FROM usuarios WHERE id = ?", (usuario_id,)).fetchone()
            self.assertEqual(usuario["creado_por"], self.admin_id)
            self.assertEqual(usuario["rol"], "investigador")
            self.assertNotEqual(usuario["password_hash"], "Prueba-segura-123")
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM auditoria").fetchone()[0], 1)

    def test_listado_detalle_y_validaciones(self):
        usuario_id = self.crear()
        pagina = self.client.get("/admin/usuarios?rol=investigador&por_pagina=1", headers=self.headers)
        self.assertEqual(pagina.status_code, 200)
        self.assertEqual(pagina.json()["total"], 1)
        self.assertEqual(pagina.json()["usuarios"][0]["id"], usuario_id)
        detalle = self.client.get(f"/admin/usuarios/{usuario_id}", headers=self.headers)
        self.assertEqual(detalle.status_code, 200)
        self.assertNotIn("password_hash", detalle.json())
        self.assertEqual(self.client.get("/admin/usuarios/9999", headers=self.headers).status_code, 404)
        self.assertEqual(self.client.get("/admin/usuarios?por_pagina=1000", headers=self.headers).status_code, 422)
        for campo, valor in (("nombre", "   "), ("correo", "sin-correo"),
                             ("password", "corta"), ("rol", "admin")):
            datos = {"nombre": "Campo", "correo": "otro@example.test", "password": "Prueba-segura-123"}
            datos[campo] = valor
            self.assertEqual(self.client.post("/admin/usuarios", headers=self.headers, json=datos).status_code, 422)

    def test_permisos(self):
        usuario_id = self.crear()
        investigador = self.acceder("campo@example.test")
        for headers, esperado in (({}, 401), (investigador, 403)):
            self.assertEqual(self.client.get("/admin/usuarios", headers=headers).status_code, esperado)
            self.assertEqual(self.client.get(f"/admin/usuarios/{usuario_id}", headers=headers).status_code, esperado)
            self.assertEqual(self.client.post("/admin/usuarios", headers=headers, json={
                "nombre": "Otro", "correo": "otro@example.test", "password": "Prueba-segura-123",
            }).status_code, esperado)
            self.assertEqual(self.client.patch(f"/admin/usuarios/{usuario_id}/estado", headers=headers,
                                             json={"estado": "suspendido"}).status_code, esperado)

    def test_suspension_reactivacion_y_revocacion(self):
        usuario_id = self.crear()
        tokens = [self.acceder("campo@example.test"), self.acceder("campo@example.test")]
        ruta = f"/admin/usuarios/{usuario_id}/estado"
        for _ in range(2):
            self.assertEqual(self.client.patch(ruta, headers=self.headers, json={"estado": "suspendido"}).status_code, 200)
        for headers in tokens:
            self.assertEqual(self.client.get("/auth/me", headers=headers).status_code, 401)
        self.assertEqual(self.client.post("/auth/login", json={
            "correo": "campo@example.test", "password": "Prueba-segura-123",
        }).status_code, 401)
        self.assertEqual(self.client.patch(ruta, headers=self.headers, json={"estado": "activo"}).status_code, 200)
        for headers in tokens:
            self.assertEqual(self.client.get("/auth/me", headers=headers).status_code, 401)
        self.acceder("campo@example.test")
        with closing(db.get_connection()) as conn:
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM auditoria").fetchone()[0], 3)

    def test_proteccion_admin_y_no_encontrado(self):
        self.assertEqual(self.client.patch(f"/admin/usuarios/{self.admin_id}/estado", headers=self.headers,
                                         json={"estado": "suspendido"}).status_code, 409)
        self.assertEqual(self.client.patch("/admin/usuarios/9999/estado", headers=self.headers,
                                         json={"estado": "activo"}).status_code, 404)

    def test_envio_credenciales_por_correo(self):
        from unittest.mock import patch
        with patch("services.email_service.EmailService.enviar_bienvenida_investigador") as mock_envio:
            mock_envio.return_value = {"enviado": True, "modo": "simulado"}
            respuesta = self.client.post("/admin/usuarios", headers=self.headers, json={
                "nombre": "Dra. Valenzuela",
                "correo": "valenzuela@inaigem.gob.pe",
                "password": "Password-Segura-2026!",
                "institucion": "INAIGEM",
            })
            self.assertEqual(respuesta.status_code, 201)
            mock_envio.assert_called_once()
            kwargs = mock_envio.call_args.kwargs
            self.assertEqual(kwargs["correo"], "valenzuela@inaigem.gob.pe")
            self.assertEqual(kwargs["nombre"], "Dra. Valenzuela")
            self.assertEqual(kwargs["password"], "Password-Segura-2026!")
            self.assertEqual(kwargs["institucion"], "INAIGEM")


if __name__ == "__main__":
    unittest.main()
