from models.schemas import RiskLevelEnum, SimulacionResponse

class RiskEngine:
    """
    Motor de riesgo físico para estimación de Drenaje Ácido de Roca (DAR)
    basado en las 4 variables acordadas con el asesor de Ingeniería Ambiental:
    1. Retroceso glaciar / Roca recién expuesta
    2. Litología reactiva con sulfuros
    3. Volumen de lluvia y estacionalidad
    4. Depuración natural por bofedales
    """

    @staticmethod
    def calcular_riesgo(
        roca_expuesta: float,
        potencial_acido: float,
        lluvia: float,
        bofedal: float,
        alpha: float = 0.75,
    ) -> SimulacionResponse:
        # Normalizar 0 a 1
        r_exp = max(0.0, min(100.0, roca_expuesta)) / 100.0
        p_aci = max(0.0, min(100.0, potencial_acido)) / 100.0
        lluv = max(0.0, min(100.0, lluvia)) / 100.0
        bof = max(0.0, min(100.0, bofedal)) / 100.0
        w_alpha = max(0.0, min(1.0, alpha))

        # 1. Generación = roca expuesta × potencial reactivo
        generacion = r_exp * p_aci

        # 2. Factor de amortiguación del bofedal
        amortiguacion = max(0.0, 1.0 - (w_alpha * bof))

        # 3. Riesgo bruto = generación × lluvia × amortiguación
        # Si no hay roca o no hay pirita, el riesgo es nulo aunque llueva mucho
        riesgo_bruto = generacion * lluv * amortiguacion

        # Normalizar a escala 0 - 100
        score = min(100, int(round(riesgo_bruto * 160)))

        # Clasificación en semáforo
        if score >= 65:
            nivel = RiskLevelEnum.ALTO
            diagnostico = (
                "Alto riesgo de drenaje ácido de roca. Las aguas presentan alta probabilidad "
                "de pH ácido (< 4.5) y metales disueltos (Fe, Al, Mn) que superan los Estándares "
                "de Calidad Ambiental (ECA Agua)."
            )
        elif score >= 35:
            nivel = RiskLevelEnum.MEDIO
            diagnostico = (
                "Riesgo moderado. Se observa potencial de lixiviación de sulfatos, amortiguado "
                "parcialmente por humedales o temporada de estiaje."
            )
        else:
            nivel = RiskLevelEnum.BAJO
            diagnostico = (
                "Bajo riesgo. Litología neutra o cobertura de bofedal suficiente para neutralizar "
                "la acidez natural. Parámetros dentro del rango ECA."
            )

        formula = (
            f"generacion ({round(generacion*100, 1)}%) = roca ({roca_expuesta}%) × sulfuros ({potencial_acido}%) | "
            f"amortiguacion = 1 - ({alpha} × {bofedal}%) = {round(amortiguacion*100, 1)}% | "
            f"riesgo = generacion × lluvia ({lluvia}%) × amortiguacion"
        )

        return SimulacionResponse(
            generacion_potencial=round(generacion, 4),
            amortiguacion_factor=round(amortiguacion, 4),
            riesgo_bruto=round(riesgo_bruto, 4),
            score_normalizado=score,
            nivel_riesgo=nivel,
            formula_desglose=formula,
            diagnostico=diagnostico,
        )
