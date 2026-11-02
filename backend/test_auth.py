"""Pruebas aisladas: python -m unittest test_auth -v."""
import os
import tempfile
import unittest
from contextlib import closing

from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient

import auth
from services import db


class AuthTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.previo = db.DB_PATH
        db.DB_PATH = os.path.join(self.tmp.name, "test.db")
        db.init_db()
        auth.init_auth_db()
        auth.init_auth_db()
        with closing(db.get_connection()) as conn, conn:
            for rol in ("admin", "investigador"):
                conn.execute("INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?)",
                             (rol, f"{rol}@example.test", auth.hash_password("Prueba-segura-123"), rol))
        app = FastAPI()
        app.include_router(auth.router)

        @app.get("/privado")
        def privado(usuario=Depends(auth.exigir_admin)):
            return {"id": usuario["id"]}

        self.client = TestClient(app)

    def tearDown(self):
        self.client.close()
        db.DB_PATH = self.previo
        self.tmp.cleanup()

    def acceder(self, rol="admin"):
        respuesta = self.client.post("/auth/login", json={"correo": f"{rol}@example.test", "password": "Prueba-segura-123"})
        self.assertEqual(respuesta.status_code, 200)
        return {"Authorization": "Bearer " + respuesta.json()["access_token"]}

    def test_login_me_logout(self):
        headers = self.acceder()
        respuesta = self.client.get("/auth/me", headers=headers)
        self.assertEqual(respuesta.status_code, 200)
        self.assertNotIn("password_hash", respuesta.json())
        token = headers["Authorization"].split()[1]
        with closing(db.get_connection()) as conn:
            self.assertNotEqual(conn.execute("SELECT token_hash FROM sesiones").fetchone()[0], token)
        self.assertEqual(self.client.post("/auth/logout", headers=headers).status_code, 200)
        self.assertEqual(self.client.get("/auth/me", headers=headers).status_code, 401)

    def test_permisos_y_suspension(self):
        headers = self.acceder("investigador")
        self.assertEqual(self.client.get("/privado", headers=headers).status_code, 403)
        self.assertEqual(self.client.get("/privado", headers=self.acceder()).status_code, 200)
        with closing(db.get_connection()) as conn, conn:
            conn.execute("UPDATE usuarios SET estado='suspendido' WHERE rol='investigador'")
        self.assertEqual(self.client.get("/auth/me", headers=headers).status_code, 401)
        self.assertEqual(self.client.post("/auth/login", json={"correo": "investigador@example.test", "password": "Prueba-segura-123"}).status_code, 401)

    def test_caducidad_y_token_invalido(self):
        headers = self.acceder()
        with closing(db.get_connection()) as conn, conn:
            conn.execute("UPDATE sesiones SET expira_en='2000-01-01 00:00:00'")
        self.assertEqual(self.client.get("/auth/me", headers=headers).status_code, 401)
        self.assertEqual(self.client.get("/auth/me").status_code, 401)
        self.assertEqual(self.client.get("/auth/me", headers={"Authorization": "Bearer falso"}).status_code, 401)

    def test_bloqueo_y_desbloqueo(self):
        datos = {"correo": "admin@example.test", "password": "incorrecta"}
        for _ in range(5):
            self.assertEqual(self.client.post("/auth/login", json=datos).status_code, 401)
        self.assertEqual(self.client.post("/auth/login", json=datos).status_code, 429)
        with closing(db.get_connection()) as conn, conn:
            conn.execute("UPDATE intentos_login SET bloqueado_hasta=1")
        self.acceder()
        with closing(db.get_connection()) as conn:
            self.assertEqual(conn.execute("SELECT COUNT(*) FROM intentos_login").fetchone()[0], 0)


if __name__ == "__main__":
    unittest.main()
