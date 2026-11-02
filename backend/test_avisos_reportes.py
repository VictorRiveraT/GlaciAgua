"""Prueba la conexión con el correo del equipo, sin enviar mensajes reales."""
import os
import tempfile
import unittest
from contextlib import closing
from unittest.mock import patch

import auth
import avisos_reportes
from models.schemas import EmailAlertaResponse
from services import db


class AvisosReportesTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.previo = db.DB_PATH
        db.DB_PATH = os.path.join(self.tmp.name, 'test.db')
        db.init_db()
        auth.init_auth_db()
        avisos_reportes.init_avisos_reportes_db()
        avisos_reportes.init_avisos_reportes_db()
        with closing(db.get_connection()) as conn, conn:
            for nombre, rol, estado in (('admin', 'admin', 'activo'), ('cientifico', 'investigador', 'activo'), ('suspendido', 'investigador', 'suspendido')):
                conn.execute('INSERT INTO usuarios (nombre, correo, password_hash, rol, estado) VALUES (?, ?, ?, ?, ?)',
                             (nombre, f'{nombre}@example.test', auth.hash_password('Prueba-segura-123'), rol, estado))
        db.insertar_reporte({'id': 'reporte-1', 'cuenca_id': 'quillcay', 'quebrada': '<script>sector</script>',
            'lat': -9.4, 'lng': -77.4, 'color_agua': 'amarillo', 'simulado': True})

    def tearDown(self):
        db.DB_PATH = self.previo
        self.tmp.cleanup()

    def resultado(self, modo):
        return EmailAlertaResponse(enviado=True, modo=modo, mensaje='Prueba', destinatario='cientifico@example.test',
                                  id_envio='id-prueba', fecha_envio='2026-01-01T00:00:00')

    def test_destinatarios_idempotencia_y_simulacion(self):
        ids = avisos_reportes.preparar_avisos('reporte-1')
        self.assertEqual(len(ids), 1)
        self.assertEqual(avisos_reportes.preparar_avisos('reporte-1'), ids)
        with patch.object(avisos_reportes.EmailService, 'enviar_oficio_alerta', return_value=self.resultado('simulado')) as enviar:
            avisos_reportes.enviar_aviso(ids[0])
            avisos_reportes.enviar_aviso(ids[0])
            enviar.assert_called_once()
            solicitud = enviar.call_args.args[0]
            self.assertEqual(solicitud.destinatario, 'cientifico@example.test')
            self.assertNotIn('<script>', solicitud.cuerpo_texto)
        self.assertEqual(avisos_reportes.preparar_avisos('reporte-1'), [])
        with closing(db.get_connection()) as conn:
            self.assertEqual(conn.execute('SELECT estado FROM avisos_reportes').fetchone()[0], 'simulado')

    def test_envio_delegado_y_fallo_sin_perder_reporte(self):
        aviso_id = avisos_reportes.preparar_avisos('reporte-1')[0]
        with patch.object(avisos_reportes.EmailService, 'enviar_oficio_alerta', side_effect=RuntimeError('error privado')):
            avisos_reportes.enviar_aviso(aviso_id)
        with closing(db.get_connection()) as conn:
            fila = conn.execute('SELECT estado, error FROM avisos_reportes').fetchone()
            self.assertEqual(tuple(fila), ('fallido', 'RuntimeError'))
            self.assertEqual(conn.execute('SELECT COUNT(*) FROM reportes').fetchone()[0], 1)
        with closing(db.get_connection()) as conn, conn:
            conn.execute("UPDATE avisos_reportes SET estado='pendiente' WHERE id=?", (aviso_id,))
        with patch.object(avisos_reportes.EmailService, 'enviar_oficio_alerta', return_value=self.resultado('resend')):
            avisos_reportes.enviar_aviso(aviso_id)
        with closing(db.get_connection()) as conn:
            self.assertEqual(conn.execute('SELECT estado, modo FROM avisos_reportes').fetchone()[:], ('enviado', 'resend'))

    def test_suspension_antes_de_enviar(self):
        aviso_id = avisos_reportes.preparar_avisos('reporte-1')[0]
        with closing(db.get_connection()) as conn, conn:
            conn.execute("UPDATE usuarios SET estado='suspendido' WHERE nombre='cientifico'")
        with patch.object(avisos_reportes.EmailService, 'enviar_oficio_alerta') as enviar:
            avisos_reportes.enviar_aviso(aviso_id)
            enviar.assert_not_called()
        with closing(db.get_connection()) as conn:
            self.assertEqual(conn.execute('SELECT estado FROM avisos_reportes').fetchone()[0], 'cancelado')


if __name__ == '__main__':
    unittest.main()
