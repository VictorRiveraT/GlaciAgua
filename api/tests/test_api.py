import pytest
from fastapi.testclient import TestClient

from glaciagua.api import crear_app
from glaciagua.entrenamiento import entrenar, guardar
from glaciagua.simulacion import simular

PELIGROSA = dict(temporada='seca', area_km2=60, roca_expuesta_km2=18, pct_sulfuros=55,
                 pct_carbonatos=2, lluvia_mm=100, pct_bofedal=0.5, pct_veg_humeda_est=2)
SEGURA = dict(temporada='seca', area_km2=60, roca_expuesta_km2=1, pct_sulfuros=3,
              pct_carbonatos=50, lluvia_mm=100, pct_bofedal=12, pct_veg_humeda_est=25)


@pytest.fixture(scope='module')
def cliente(tmp_path_factory):
    d = tmp_path_factory.mktemp('modelo')
    pipe, meta = entrenar(simular(n_microcuencas=40), 'simulado', n_arboles=60)
    guardar(pipe, meta, d)
    return TestClient(crear_app(d))


def test_salud_y_modelo(cliente):
    r = cliente.get('/salud').json()
    assert r['modelo_cargado'] and r['modelo_demo'] is True
    m = cliente.get('/modelo').json()
    assert m['fuente_datos'] == 'simulado' and 'metricas_validacion' in m


def test_predecir_un_caso_marca_demo(cliente):
    r = cliente.post('/predecir', json={'microcuencas': [{**PELIGROSA, 'id': 'a'}]})
    assert r.status_code == 200
    j = r.json()
    assert j['modelo_demo'] is True and j['aviso']
    res = j['resultados'][0]
    assert res['id'] == 'a' and res['nivel_riesgo'] in ('Alto', 'Medio', 'Bajo')


def test_mas_acido_donde_hay_mas_sulfuros_y_menos_carbonatos(cliente):
    r = cliente.post('/predecir', json={'microcuencas': [PELIGROSA, SEGURA]}).json()['resultados']
    assert r[0]['ph_estimado'] < r[1]['ph_estimado']


def test_acepta_datos_faltantes_y_avisa(cliente):
    r = cliente.post('/predecir', json={'microcuencas': [{'temporada': 'humeda', 'pct_sulfuros': 30}]})
    assert r.status_code == 200
    assert any('Faltan datos' in a for a in r.json()['resultados'][0]['advertencias'])


def test_avisa_si_un_valor_sale_del_rango(cliente):
    r = cliente.post('/predecir', json={'microcuencas': [{**SEGURA, 'area_km2': 15000}]}).json()
    assert any('fuera del rango' in a for a in r['resultados'][0]['advertencias'])


@pytest.mark.parametrize('malo', [
    {**SEGURA, 'temporada': 'otoño'},
    {**SEGURA, 'pct_sulfuros': 130},
    {**SEGURA, 'lluvia_mm': -5},
])
def test_rechaza_entradas_invalidas(cliente, malo):
    assert cliente.post('/predecir', json={'microcuencas': [malo]}).status_code == 422


def test_rechaza_lista_vacia(cliente):
    assert cliente.post('/predecir', json={'microcuencas': []}).status_code == 422


def test_sin_modelo_responde_503(tmp_path):
    c = TestClient(crear_app(tmp_path / 'no_existe'))
    assert c.get('/salud').json()['estado'] == 'sin_modelo'
    assert c.post('/predecir', json={'microcuencas': [SEGURA]}).status_code == 503


def test_api_key(tmp_path, monkeypatch):
    pipe, meta = entrenar(simular(n_microcuencas=20), 'simulado', n_arboles=30)
    guardar(pipe, meta, tmp_path)
    monkeypatch.setenv('GLACIAGUA_API_KEY', 'secreto')
    c = TestClient(crear_app(tmp_path))
    cuerpo = {'microcuencas': [SEGURA]}
    assert c.post('/predecir', json=cuerpo).status_code == 401
    assert c.post('/predecir', json=cuerpo, headers={'X-API-Key': 'mala'}).status_code == 401
    assert c.post('/predecir', json=cuerpo, headers={'X-API-Key': 'secreto'}).status_code == 200
    assert c.get('/salud').status_code == 200          # la salud no pide clave
