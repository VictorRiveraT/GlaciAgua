from typing import List, Dict, Any, Optional
from models.schemas import CuencaResumen, MedicionResponse, GeoJSONFeatureCollection

# Cuencas piloto consensuadas en GlaciAgua
CUENCAS_DATA = [
    {
        "id": "quillcay",
        "slug": "quillcay",
        "nombre": "Quillcay",
        "provincia": "Huaraz",
        "distrito": "Huaraz e Independencia",
        "area_km2": 249.5,
        "glaciares": ["Vallunaraju", "Ranrapalca", "Shallap", "San Juan"],
        "quebradas": ["Cojup", "Quilcayhuanca", "Shallap"],
        "poblacion_dependiente": "125,000 hab. (Ciudad de Huaraz e Independencia - EPS Chavín capta en Cojup)",
        "nivel_riesgo": {"seca": "Alto", "humeda": "Alto"},
        "score_riesgo": {"seca": 88, "humeda": 94},
        "factores": {
            "seca": {"roca_expuesta": 92.0, "potencial_acido": 78.0, "lluvia": 35.0, "bofedal_depuracion": 28.0},
            "humeda": {"roca_expuesta": 92.0, "potencial_acido": 78.0, "lluvia": 86.0, "bofedal_depuracion": 32.0}
        },
        "ultima_medicion": {
            "ph": 4.1,
            "conductividad": 540,
            "metal_dominante": "Hierro (Fe: 4.8 mg/L) y Aluminio (Al: 3.2 mg/L)",
            "fecha": "2026-10-15",
            "fuente": "Estudio Hidroquímico INAIGEM / UPCH"
        },
        "centroide": {"lat": -9.485, "lng": -77.420},
        # Coordenadas geográficas [lon, lat] según formato GeoJSON estándar
        "coordenadas_geojson": [
            [-77.5305, -9.5285],
            [-77.5210, -9.5080],
            [-77.5090, -9.4890],
            [-77.4920, -9.4680],
            [-77.4750, -9.4450],
            [-77.4560, -9.4220],
            [-77.4160, -9.4140],
            [-77.3880, -9.3920],
            [-77.3750, -9.3880],
            [-77.3620, -9.4050],
            [-77.3420, -9.4480],
            [-77.3380, -9.4620],
            [-77.3320, -9.4810],
            [-77.3450, -9.5080],
            [-77.3480, -9.5310],
            [-77.3820, -9.5440],
            [-77.4380, -9.5520],
            [-77.4720, -9.5480],
            [-77.5210, -9.5340],
            [-77.5305, -9.5285]
        ]
    },
    {
        "id": "pachacoto",
        "slug": "pachacoto",
        "nombre": "Pachacoto",
        "provincia": "Recuay",
        "distrito": "Cátac",
        "area_km2": 202.8,
        "glaciares": ["Pastoruri", "Raria", "Tuco"],
        "quebradas": ["Quebrada Pastoruri", "Pampa de Pumapampa", "Río Pachacoto"],
        "poblacion_dependiente": "14,800 hab. (Comunidades campesinas de Cátac, regantes y turismo Pastoruri)",
        "nivel_riesgo": {"seca": "Medio", "humeda": "Alto"},
        "score_riesgo": {"seca": 58, "humeda": 74},
        "factores": {
            "seca": {"roca_expuesta": 65.0, "potencial_acido": 62.0, "lluvia": 30.0, "bofedal_depuracion": 45.0},
            "humeda": {"roca_expuesta": 65.0, "potencial_acido": 62.0, "lluvia": 79.0, "bofedal_depuracion": 48.0}
        },
        "ultima_medicion": {
            "ph": 5.4,
            "conductividad": 380,
            "metal_dominante": "Hierro (Fe: 2.1 mg/L) y Manganeso (Mn: 0.6 mg/L)",
            "fecha": "2026-10-08",
            "fuente": "Red de Monitoreo Glaciológico INAIGEM"
        },
        "centroide": {"lat": -9.880, "lng": -77.295},
        "coordenadas_geojson": [
            [-77.4300, -9.7950],
            [-77.3750, -9.8050],
            [-77.3350, -9.8220],
            [-77.2900, -9.8410],
            [-77.2180, -9.8820],
            [-77.1850, -9.9210],
            [-77.2150, -9.9580],
            [-77.2750, -9.9450],
            [-77.3620, -9.8950],
            [-77.4210, -9.8320],
            [-77.4300, -9.7950]
        ]
    },
    {
        "id": "canray-chico",
        "slug": "canray-chico",
        "nombre": "Canray Chico",
        "provincia": "Huaraz",
        "distrito": "Olleros",
        "area_km2": 94.2,
        "glaciares": ["Rurec", "Uruashraju"],
        "quebradas": ["Quebrada Rurec", "Río Canray Chico"],
        "poblacion_dependiente": "8,200 hab. (Comunidades de Olleros y regantes del río Santa)",
        "nivel_riesgo": {"seca": "Medio", "humeda": "Medio"},
        "score_riesgo": {"seca": 46, "humeda": 60},
        "factores": {
            "seca": {"roca_expuesta": 52.0, "potencial_acido": 48.0, "lluvia": 33.0, "bofedal_depuracion": 42.0},
            "humeda": {"roca_expuesta": 52.0, "potencial_acido": 48.0, "lluvia": 75.0, "bofedal_depuracion": 44.0}
        },
        "ultima_medicion": {
            "ph": 5.8,
            "conductividad": 290,
            "metal_dominante": "Hierro (Fe: 1.4 mg/L)",
            "fecha": "2026-09-28",
            "fuente": "Evaluación Hidroquímica Canray Chico (INAIGEM)"
        },
        "centroide": {"lat": -9.670, "lng": -77.400},
        "coordenadas_geojson": [
            [-77.5100, -9.6600],
            [-77.4400, -9.6400],
            [-77.3500, -9.5800],
            [-77.3200, -9.6400],
            [-77.3500, -9.7000],
            [-77.4400, -9.6800],
            [-77.5100, -9.6600]
        ]
    },
    {
        "id": "rio-blanco",
        "slug": "rio-blanco",
        "nombre": "Río Blanco",
        "provincia": "Huaylas",
        "distrito": "Caraz y Santa Cruz",
        "area_km2": 178.4,
        "glaciares": ["Alpamayo", "Santa Cruz"],
        "quebradas": ["Quebrada Santa Cruz", "Río Blanco"],
        "poblacion_dependiente": "26,000 hab. (Valle agrícola de Huaylas y caseríos rurales)",
        "nivel_riesgo": {"seca": "Bajo", "humeda": "Bajo"},
        "score_riesgo": {"seca": 22, "humeda": 29},
        "factores": {
            "seca": {"roca_expuesta": 24.0, "potencial_acido": 18.0, "lluvia": 32.0, "bofedal_depuracion": 62.0},
            "humeda": {"roca_expuesta": 24.0, "potencial_acido": 18.0, "lluvia": 72.0, "bofedal_depuracion": 65.0}
        },
        "ultima_medicion": {
            "ph": 7.2,
            "conductividad": 110,
            "metal_dominante": "Parámetros normales dentro del ECA",
            "fecha": "2026-09-20",
            "fuente": "Estudios de Línea Base ANA"
        },
        "centroide": {"lat": -8.960, "lng": -77.680},
        "coordenadas_geojson": [
            [-77.8100, -9.0500],
            [-77.7200, -9.0000],
            [-77.6500, -8.9400],
            [-77.6000, -8.8700],
            [-77.5600, -8.9300],
            [-77.6200, -8.9800],
            [-77.8100, -9.0500]
        ]
    }
]

# Mediciones hidroquímicas reales (Etiquetas de contraste INAIGEM / UPCH)
MEDICIONES_DATA = [
    {
        "id": "meas-01",
        "cuenca_id": "quillcay",
        "quebrada": "Quebrada Shallap (Quillcay)",
        "punto": "P-SH-01 Naciente Shallap",
        "lat": -9.518,
        "lng": -77.382,
        "fecha": "2026-08-14",
        "temporada": "seca",
        "fuente": "INAIGEM 2023",
        "ph": 3.85,
        "conductividad": 620.0,
        "hierro": 6.4,
        "aluminio": 4.8,
        "manganeso": 0.95,
        "plomo": 0.024,
        "cumple_eca": False,
        "notas": "Agua fuertemente anaranjada por óxidos de hierro. Supera ampliamente los ECA para consumo y riego."
    },
    {
        "id": "meas-02",
        "cuenca_id": "quillcay",
        "quebrada": "Quebrada Cojup (Quillcay)",
        "punto": "P-CO-02 Captación EPS Chavín",
        "lat": -9.489,
        "lng": -77.441,
        "fecha": "2026-09-02",
        "temporada": "seca",
        "fuente": "INAIGEM 2023",
        "ph": 4.45,
        "conductividad": 480.0,
        "hierro": 3.2,
        "aluminio": 2.1,
        "manganeso": 0.52,
        "plomo": 0.015,
        "cumple_eca": False,
        "notas": "Punto estratégico de captación para la planta de agua potable de Huaraz."
    },
    {
        "id": "meas-03",
        "cuenca_id": "quillcay",
        "quebrada": "Quebrada Quilcayhuanca (Quillcay)",
        "punto": "P-QH-01 Laguna Tullpacocha",
        "lat": -9.497,
        "lng": -77.375,
        "fecha": "2026-07-28",
        "temporada": "seca",
        "fuente": "UPCH 2021",
        "ph": 4.20,
        "conductividad": 510.0,
        "hierro": 4.5,
        "aluminio": 3.4,
        "manganeso": 0.72,
        "plomo": 0.018,
        "cumple_eca": False,
        "notas": "Color turquesa lechoso por coloides de aluminio en suspensión."
    },
    {
        "id": "meas-04",
        "cuenca_id": "pachacoto",
        "quebrada": "Quebrada Pastoruri (Pachacoto)",
        "punto": "P-PA-01 Naciente Pastoruri",
        "lat": -9.921,
        "lng": -77.195,
        "fecha": "2026-08-20",
        "temporada": "seca",
        "fuente": "INAIGEM 2023",
        "ph": 4.15,
        "conductividad": 440.0,
        "hierro": 3.9,
        "aluminio": 2.8,
        "manganeso": 0.65,
        "plomo": 0.012,
        "cumple_eca": False,
        "notas": "Afloramiento en la morena frontal del glaciar Pastoruri. Litologías con pirita oxidada."
    },
    {
        "id": "meas-05",
        "cuenca_id": "pachacoto",
        "quebrada": "Pampa de Pumapampa (Pachacoto)",
        "punto": "P-PA-03 Salida del Bofedal",
        "lat": -9.882,
        "lng": -77.291,
        "fecha": "2026-09-18",
        "temporada": "seca",
        "fuente": "INAIGEM 2023",
        "ph": 5.65,
        "conductividad": 310.0,
        "hierro": 1.2,
        "aluminio": 0.75,
        "manganeso": 0.35,
        "plomo": 0.006,
        "cumple_eca": True,
        "notas": "Efecto depurador evidente del bofedal de Pumapampa: aumento de pH y retención de metales."
    },
    {
        "id": "meas-06",
        "cuenca_id": "canray-chico",
        "quebrada": "Quebrada Rurec (Canray Chico)",
        "punto": "P-CR-01 Confluencia Olleros",
        "lat": -9.664,
        "lng": -77.412,
        "fecha": "2026-06-15",
        "temporada": "seca",
        "fuente": "INAIGEM 2023",
        "ph": 5.85,
        "conductividad": 285.0,
        "hierro": 1.35,
        "aluminio": 0.88,
        "manganeso": 0.28,
        "plomo": 0.007,
        "cumple_eca": False,
        "notas": "Evaluación hidroquímica Canray Chico. Ligera superación en hierro."
    },
    {
        "id": "meas-07",
        "cuenca_id": "rio-blanco",
        "quebrada": "Quebrada Santa Cruz (Río Blanco)",
        "punto": "P-RB-01 Laguna Grande",
        "lat": -8.948,
        "lng": -77.632,
        "fecha": "2026-07-10",
        "temporada": "seca",
        "fuente": "ANA / OEFA",
        "ph": 7.25,
        "conductividad": 115.0,
        "hierro": 0.18,
        "aluminio": 0.09,
        "manganeso": 0.04,
        "plomo": 0.002,
        "cumple_eca": True,
        "notas": "Cuenca control o línea base. Cumple todos los parámetros ECA para consumo y riego."
    },
    {
        "id": "meas-08",
        "cuenca_id": "quillcay",
        "quebrada": "Río Quillcay (Puente Comercio - Huaraz)",
        "punto": "P-QU-04 Desembocadura en Río Santa",
        "lat": -9.528,
        "lng": -77.531,
        "fecha": "2026-09-25",
        "temporada": "seca",
        "fuente": "UPCH 2021",
        "ph": 5.10,
        "conductividad": 410.0,
        "hierro": 2.8,
        "aluminio": 1.6,
        "manganeso": 0.48,
        "plomo": 0.011,
        "cumple_eca": False,
        "notas": "El río Quillcay atraviesa la ciudad de Huaraz y aporta alta carga de metales al río Santa."
    }
]

class DataService:
    @staticmethod
    def listar_cuencas() -> List[Dict[str, Any]]:
        return CUENCAS_DATA

    @staticmethod
    def obtener_cuenca(cuenca_id: str) -> Optional[Dict[str, Any]]:
        for c in CUENCAS_DATA:
            if c["id"] == cuenca_id or c["slug"] == cuenca_id:
                return c
        return None

    @staticmethod
    def listar_mediciones(cuenca_id: Optional[str] = None, solo_afectadas: bool = False) -> List[Dict[str, Any]]:
        result = MEDICIONES_DATA
        if cuenca_id and cuenca_id != "todos":
            result = [m for m in result if m["cuenca_id"] == cuenca_id]
        if solo_afectadas:
            result = [m for m in result if not m["cumple_eca"]]
        return result

    @staticmethod
    def generar_geojson(temporada: str = "seca") -> Dict[str, Any]:
        """
        Genera un FeatureCollection GeoJSON estándar (RFC 7946) con las geometrías de las cuencas
        y los indicadores de riesgo para consumo en Leaflet, MapLibre o QGIS.
        """
        features = []
        for c in CUENCAS_DATA:
            nivel = c["nivel_riesgo"].get(temporada, "Medio")
            score = c["score_riesgo"].get(temporada, 50)
            factores = c["factores"].get(temporada, {})

            feature = {
                "type": "Feature",
                "properties": {
                    "id": c["id"],
                    "nombre": c["nombre"],
                    "provincia": c["provincia"],
                    "distrito": c["distrito"],
                    "area_km2": c["area_km2"],
                    "temporada": temporada,
                    "nivel_riesgo": nivel,
                    "score_riesgo": score,
                    "ph_ultimo": c["ultima_medicion"]["ph"],
                    "roca_expuesta": factores.get("roca_expuesta", 0),
                    "potencial_acido": factores.get("potencial_acido", 0),
                    "lluvia": factores.get("lluvia", 0),
                    "bofedal_depuracion": factores.get("bofedal_depuracion", 0)
                },
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [c["coordenadas_geojson"]]
                }
            }
            features.append(feature)

        return {
            "type": "FeatureCollection",
            "metadata": {
                "proyecto": "GlaciAgua",
                "zona": "Cordillera Blanca, Áncash",
                "temporada": temporada,
                "version": "2.4"
            },
            "features": features
        }
