"""La bandeja de científicos consulta reportes sin aprobarlos ni usarlos como mediciones."""
import os
import tempfile
import unittest
from contextlib import closing

from fastapi import FastAPI
from fastapi.testclient import TestClient

import auth
import reportes_cientificos
from services import db


class ReportesCientificosTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.previo = db.DB_PATH
        db.DB_PATH = os.path.join(self.tmp.name, 'test.db')
        db.init_db()
        auth.init_auth_db()
        with closing(db.get_connection()) as conn, conn:
            for nombre, rol in (('admin', 'admin'), ('cientifico', 'investigador')):
                conn.execute('INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?)',
                             (nombre, f'{nombre}@example.test', auth.hash_password('Prueba-segura-123'), rol))
        self.reporte = {'id': 'reporte-prueba', 'cuenca_id': 'quillcay', 'quebrada': 'Shallap',
            'lat': -9.4, 'lng': -77.4, 'color_agua': 'amarillo', 'usos_afectados': ['riego'],
            'simulado': True, 'comentarios': 'Aviso ciudadano de prueba',
            'tiene_foto': True, 'foto_base64': 'imagen-de-prueba'}
        self.assertTrue(db.insertar_reporte(self.reporte))
        self.assertFalse(db.insertar_reporte(self.reporte))
        app = FastAPI()
        app.include_router(auth.router)
        app.include_router(reportes_cientificos.router)
        self.client = TestClient(app)
        self.headers = {}
        for nombre in ('admin', 'cientifico'):
            r = self.client.post('/auth/login', json={'correo': f'{nombre}@example.test', 'password': 'Prueba-segura-123'})
            self.headers[nombre] = {'Authorization': 'Bearer ' + r.json()['access_token']}

    def tearDown(self):
        self.client.close()
        db.DB_PATH = self.previo
        self.tmp.cleanup()

    def test_cientifico_consulta_directamente(self):
        r = self.client.get('/investigacion/reportes', headers=self.headers['cientifico'])
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['total'], 1)
        self.assertNotIn('foto_base64', r.json()['reportes'][0])
        self.assertEqual(r.json()['reportes'][0]['uso'], 'contraste_predicciones')
        r = self.client.get('/investigacion/reportes/reporte-prueba', headers=self.headers['cientifico'])
        self.assertEqual(r.json()['foto_base64'], 'imagen-de-prueba')
        self.assertEqual(r.json()['usos_afectados'], ['riego'])

    def test_permisos_y_suspension(self):
        for headers, estado in (({}, 401), (self.headers['admin'], 403)):
            self.assertEqual(self.client.get('/investigacion/reportes', headers=headers).status_code, estado)
            self.assertEqual(self.client.get('/investigacion/reportes/reporte-prueba', headers=headers).status_code, estado)
        with closing(db.get_connection()) as conn, conn:
            conn.execute("UPDATE usuarios SET estado='suspendido' WHERE rol='investigador'")
        self.assertEqual(self.client.get('/investigacion/reportes', headers=self.headers['cientifico']).status_code, 401)

    def test_filtros_y_sin_aprobacion(self):
        for query in ('cuenca_id=pachacoto', 'simulado=false'):
            self.assertEqual(self.client.get('/investigacion/reportes?' + query, headers=self.headers['cientifico']).json()['total'], 0)
        self.assertEqual(self.client.get('/investigacion/reportes/inexistente', headers=self.headers['cientifico']).status_code, 404)
        self.assertEqual(self.client.patch('/investigacion/reportes/reporte-prueba', headers=self.headers['admin'], json={'estado': 'rechazado'}).status_code, 405)
        self.assertEqual(len(db.obtener_reportes()), 1)


if __name__ == '__main__':
    unittest.main()
