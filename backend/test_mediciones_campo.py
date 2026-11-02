"""Pruebas de autoría científica, acceso y migración sin aprobación administrativa."""
import json
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
        db.DB_PATH = os.path.join(self.tmp.name, 'test.db')
        db.init_db()
        auth.init_auth_db()
        mediciones_campo.init_mediciones_db()
        mediciones_campo.init_mediciones_db()
        self.ids = {}
        with closing(db.get_connection()) as conn, conn:
            for nombre, rol in (('admin', 'admin'), ('uno', 'investigador'), ('dos', 'investigador')):
                cursor = conn.execute('INSERT INTO usuarios (nombre, correo, password_hash, rol, institucion) VALUES (?, ?, ?, ?, ?)',
                    (nombre, f'{nombre}@example.test', auth.hash_password('Prueba-segura-123'), rol, 'UPCH'))
                self.ids[nombre] = cursor.lastrowid
        app = FastAPI()
        app.include_router(auth.router)
        app.include_router(mediciones_campo.router)
        self.client = TestClient(app)
        self.headers = {}
        for nombre in self.ids:
            r = self.client.post('/auth/login', json={'correo': f'{nombre}@example.test', 'password': 'Prueba-segura-123'})
            self.headers[nombre] = {'Authorization': 'Bearer ' + r.json()['access_token']}
        self.datos = {
            'cuenca_id': 'quillcay', 'quebrada': 'Shallap', 'periodo': '2025-seca', 'temporada': 'seca',
            'fecha_medicion': '2025-07-15', 'fuente': 'Datos ficticios de prueba',
            'metodo': 'Valores ficticios para verificar el sistema',
            'area_km2': 249.5, 'roca_expuesta_km2': 35.2, 'pct_sulfuros': 48,
            'pct_carbonatos': 10, 'lluvia_mm': 110, 'pct_bofedal': 2.5,
            'pct_veg_humeda_est': 8, 'ph_min': 4.1, 'es_prueba': True,
        }

    def tearDown(self):
        self.client.close()
        db.DB_PATH = self.previo
        self.tmp.cleanup()

    def crear(self, nombre='uno'):
        r = self.client.post('/admin/mediciones', headers=self.headers[nombre], json=self.datos)
        self.assertEqual(r.status_code, 201, r.text)
        return r.json()

    def test_autoria_nombre_y_pruebas(self):
        datos = self.crear()
        self.assertEqual(datos['creado_por'], self.ids['uno'])
        self.assertEqual(datos['cientifico_nombre'], 'uno')
        self.assertEqual(datos['cientifico_institucion'], 'UPCH')
        self.assertEqual(datos['estado'], 'registrado')
        self.assertTrue(datos['es_prueba'])
        self.assertNotIn('revisado_por', datos)
        self.assertNotIn('correo', datos)
        with closing(db.get_connection()) as conn:
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM revisiones_mediciones').fetchone()[0], 0)

    def test_aislamiento_listado_y_detalle(self):
        uno = self.crear()
        self.crear('dos')
        for nombre, total in (('uno', 1), ('dos', 1), ('admin', 2)):
            r = self.client.get('/admin/mediciones', headers=self.headers[nombre])
            self.assertEqual(r.status_code, 200)
            self.assertEqual(r.json()['total'], total)
            self.assertIn('cientifico_nombre', r.json()['mediciones'][0])
        self.assertEqual(self.client.get(f"/admin/mediciones/{uno['id']}", headers=self.headers['dos']).status_code, 404)
        self.assertEqual(self.client.get(f"/admin/mediciones/{uno['id']}", headers=self.headers['admin']).status_code, 200)
        self.assertEqual(self.client.get('/admin/mediciones?cuenca_id=pachacoto', headers=self.headers['admin']).json()['total'], 0)
        self.assertEqual(len(self.client.get('/admin/mediciones?por_pagina=1', headers=self.headers['admin']).json()['mediciones']), 1)

    def test_validaciones_y_autoria_no_suplantable(self):
        invalidos = (
            ('ph_min', 15), ('lluvia_mm', -1), ('pct_bofedal', 101), ('area_km2', 0),
            ('roca_expuesta_km2', 1000), ('pct_sulfuros', 'NaN'), ('fuente', ' '),
            ('metodo', ''), ('periodo', '2025-humeda'),
            ('fecha_medicion', (date.today() + timedelta(days=1)).isoformat()),
            ('creado_por', self.ids['admin']), ('estado', 'aprobado'), ('cientifico_nombre', 'Otra persona'),
        )
        for campo, valor in invalidos:
            with self.subTest(campo=campo):
                r = self.client.post('/admin/mediciones', headers=self.headers['uno'], json={**self.datos, campo: valor})
                self.assertEqual(r.status_code, 422, r.text)
        self.assertEqual(self.client.post('/admin/mediciones', headers=self.headers['uno'], json={**self.datos, 'cuenca_id': 'inexistente'}).status_code, 404)

    def test_solo_cientificos_cargan_y_suspension(self):
        self.assertEqual(self.client.post('/admin/mediciones', json=self.datos).status_code, 401)
        self.assertEqual(self.client.get('/admin/mediciones').status_code, 401)
        self.assertEqual(self.client.post('/admin/mediciones', headers=self.headers['admin'], json=self.datos).status_code, 403)
        with closing(db.get_connection()) as conn, conn:
            conn.execute("UPDATE usuarios SET estado='suspendido' WHERE id=?", (self.ids['uno'],))
        self.assertEqual(self.client.post('/admin/mediciones', headers=self.headers['uno'], json=self.datos).status_code, 401)

    def test_no_hay_operacion_de_revision(self):
        datos = self.crear()
        ruta = f"/admin/mediciones/{datos['id']}/revision"
        for nombre in ('admin', 'uno'):
            self.assertEqual(self.client.patch(ruta, headers=self.headers[nombre], json={'estado': 'aprobado'}).status_code, 404)
        self.assertEqual(self.client.get('/admin/mediciones/inexistente', headers=self.headers['admin']).status_code, 404)

    def test_filtro_datos_de_prueba(self):
        self.crear()
        self.datos['es_prueba'] = False
        self.crear()
        r = self.client.get('/admin/mediciones?estado=registrado&es_prueba=false', headers=self.headers['uno'])
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()['total'], 1)
        self.assertFalse(r.json()['mediciones'][0]['es_prueba'])
        self.assertEqual(self.client.get('/admin/mediciones?estado=aprobado', headers=self.headers['uno']).status_code, 422)

    def test_migracion_preserva_rechazo_e_historial(self):
        with closing(db.get_connection()) as conn, conn:
            conn.execute('DROP TABLE revisiones_mediciones')
            conn.execute('DROP TABLE mediciones_campo')
            conn.execute('''CREATE TABLE mediciones_campo (
                id TEXT PRIMARY KEY, cuenca_id TEXT NOT NULL, periodo TEXT NOT NULL,
                datos_json TEXT NOT NULL, creado_por INTEGER NOT NULL REFERENCES usuarios(id),
                estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
                creado_en TEXT DEFAULT CURRENT_TIMESTAMP, revisado_por INTEGER,
                revisado_en TEXT, observacion_revision TEXT)''')
            payload = {k: v for k, v in self.datos.items() if k not in ('cuenca_id', 'periodo', 'es_prueba')}
            conn.execute('''INSERT INTO mediciones_campo
                (id, cuenca_id, periodo, datos_json, creado_por, estado, revisado_por, observacion_revision)
                VALUES ('historico', 'quillcay', '2025-seca', ?, ?, 'rechazado', ?, 'Prueba ficticia')''',
                (json.dumps(payload), self.ids['uno'], self.ids['admin']))
            conn.execute('''CREATE TABLE revisiones_mediciones (
                id INTEGER PRIMARY KEY, medicion_id TEXT NOT NULL UNIQUE,
                revisor_id INTEGER NOT NULL, estado TEXT NOT NULL,
                observacion TEXT, creado_en TEXT DEFAULT CURRENT_TIMESTAMP)''')
            conn.execute("INSERT INTO revisiones_mediciones VALUES (1, 'historico', ?, 'rechazado', 'Prueba ficticia', CURRENT_TIMESTAMP)", (self.ids['admin'],))
        mediciones_campo.init_mediciones_db()
        mediciones_campo.init_mediciones_db()
        r = self.client.get('/admin/mediciones/historico', headers=self.headers['uno'])
        self.assertEqual(r.status_code, 200, r.text)
        self.assertEqual(r.json()['estado'], 'excluido')
        with closing(db.get_connection()) as conn:
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM revisiones_mediciones').fetchone()[0], 1)
            self.assertEqual(conn.execute('SELECT observacion_revision FROM mediciones_campo').fetchone()[0], 'Prueba ficticia')


if __name__ == '__main__':
    unittest.main()
