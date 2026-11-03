"""Servicio de envío de correos electrónicos para GlaciAgua (alertas, oficios y notificaciones).
Soporta proveedores SMTP estándar (Resend, Brevo, Google Workspace, Zoho),
envío directo vía Resend REST API (HTTPS puerto 443)
y modo simulado/local para desarrollo sin credenciales configuradas.
"""
import os
import smtplib
import uuid
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
from typing import Dict, Any
import httpx

from models.schemas import EmailAlertaRequest, EmailAlertaResponse

logger = logging.getLogger(__name__)

# Configuración leída de variables de entorno
SMTP_HOST = os.getenv("SMTP_HOST", "").strip()
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "").strip()
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "").strip()
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()
EMAIL_FROM = os.getenv("EMAIL_FROM", "alertas@glaciagua.lat").strip()
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() in ("true", "1", "yes")
SMTP_USE_SSL = os.getenv("SMTP_USE_SSL", "false").lower() in ("true", "1", "yes") or SMTP_PORT == 465

# Si SMTP_PASSWORD comienza con re_, también sirve como RESEND_API_KEY
if not RESEND_API_KEY and SMTP_PASSWORD.startswith("re_"):
    RESEND_API_KEY = SMTP_PASSWORD


class EmailService:
    @staticmethod
    def _construir_html_oficio(solicitud: EmailAlertaRequest) -> str:
        """Genera una plantilla HTML profesional y accesible para el oficio formal."""
        color_riesgo = "#16a34a"  # verde
        if solicitud.nivel_riesgo and "alto" in solicitud.nivel_riesgo.lower():
            color_riesgo = "#dc2626"  # rojo
        elif solicitud.nivel_riesgo and "medio" in solicitud.nivel_riesgo.lower():
            color_riesgo = "#d97706"  # ámbar

        cuerpo_html = solicitud.cuerpo_texto.replace("\n", "<br/>")

        return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Oficio Comunitario - GlaciAgua</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
      margin: 0;
      padding: 24px;
    }}
    .container {{
      max-width: 640px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }}
    .header {{
      background: linear-gradient(135deg, #0369a1 0%, #0284c7 100%);
      color: #ffffff;
      padding: 24px 32px;
    }}
    .header h1 {{
      margin: 0 0 6px 0;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }}
    .header p {{
      margin: 0;
      font-size: 13px;
      color: #e0f2fe;
    }}
    .badge {{
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 700;
      background-color: {color_riesgo};
      color: #ffffff;
      margin-top: 12px;
    }}
    .content {{
      padding: 32px;
    }}
    .meta-box {{
      background-color: #f1f5f9;
      border-left: 4px solid #0284c7;
      padding: 14px 18px;
      border-radius: 6px;
      margin-bottom: 24px;
      font-size: 14px;
    }}
    .meta-box p {{
      margin: 4px 0;
    }}
    .letter-body {{
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 24px;
      font-size: 14px;
      line-height: 1.7;
      color: #334155;
      white-space: normal;
    }}
    .footer {{
      background-color: #f8fafc;
      padding: 20px 32px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
      text-align: center;
    }}
    .disclaimer {{
      margin-top: 10px;
      font-size: 11px;
      color: #94a3b8;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GlaciAgua</h1>
      <p>Sistema Comunitario de Alerta Temprana de Calidad de Agua - Cordillera Blanca, Áncash</p>
      <span class="badge">Nivel de Riesgo Referencial: {solicitud.nivel_riesgo or 'Atención Preventiva'}</span>
    </div>

    <div class="content">
      <div class="meta-box">
        <p><strong>Destinatario:</strong> {solicitud.destinatario_nombre or solicitud.destinatario}</p>
        <p><strong>Solicitante:</strong> {solicitud.remitente_nombre} ({solicitud.remitente_rol or 'Comunero'})</p>
        <p><strong>Microcuenca / Sector:</strong> {solicitud.cuenca_nombre}</p>
        <p><strong>Motivo Observado:</strong> {solicitud.motivo}</p>
        <p><strong>Fecha:</strong> {datetime.now().strftime('%d/%m/%Y %H:%M')}</p>
      </div>

      <div class="letter-body">
        {cuerpo_html}
      </div>
    </div>

    <div class="footer">
      <p>Este oficio fue generado y tramitado formalmente a través de la plataforma <strong>GlaciAgua</strong> ({EMAIL_FROM}).</p>
      <p class="disclaimer">
        Aviso importante: Los datos e índices generados por la plataforma comunitaria GlaciAgua tienen carácter preventivo y referencial para alertar a las JASS, regantes y autoridades de salud. No reemplazan análisis oficiales de laboratorio acreditado por INACAL.
      </p>
    </div>
  </div>
</body>
</html>
"""

    @classmethod
    def enviar_oficio_alerta(cls, req: EmailAlertaRequest) -> EmailAlertaResponse:
        """
        Envía el oficio de alerta por correo electrónico.
        Prioriza la API REST de Resend si RESEND_API_KEY está configurada (más rápida y sin bloqueos de puerto).
        Si no, utiliza el servidor SMTP configurado (Resend, Brevo, Gmail, etc.).
        Si no hay credenciales, opera de forma simulada para desarrollo local.
        """
        asunto = req.asunto or f"[GlaciAgua] Solicitud Comunitaria de Inspección de Calidad de Agua - Microcuenca {req.cuenca_nombre}"
        fecha_actual = datetime.now().isoformat()
        remitente_display = f"GlaciAgua Alertas <{EMAIL_FROM}>"

        # 1. Enviar vía Resend REST API (HTTPS puerto 443)
        if RESEND_API_KEY:
            try:
                html_contenido = cls._construir_html_oficio(req)
                with httpx.Client(timeout=10.0) as client:
                    resp = client.post(
                        "https://api.resend.com/emails",
                        headers={
                            "Authorization": f"Bearer {RESEND_API_KEY}",
                            "Content-Type": "application/json"
                        },
                        json={
                            "from": remitente_display,
                            "to": [req.destinatario],
                            "subject": asunto,
                            "html": html_contenido,
                        }
                    )
                    if resp.status_code in (200, 201):
                        data = resp.json()
                        envio_id = data.get("id", f"resend-{uuid.uuid4().hex[:10]}")
                        logger.info(f"[RESEND API EXITO] Enviado a {req.destinatario} ID {envio_id}")
                        return EmailAlertaResponse(
                            enviado=True,
                            modo="resend",
                            mensaje=f"Oficio formal enviado exitosamente a {req.destinatario} desde {EMAIL_FROM}.",
                            destinatario=req.destinatario,
                            id_envio=envio_id,
                            fecha_envio=fecha_actual
                        )
                    else:
                        logger.warning(f"[RESEND API FALLO {resp.status_code}] {resp.text}. Intentando fallback SMTP...")
            except Exception as e:
                logger.warning(f"[RESEND API EXCEPCION] {str(e)}. Intentando fallback SMTP...")

        # 2. Si no hay SMTP_HOST configurado, operamos en modo simulado
        if not SMTP_HOST:
            simulated_id = f"sim-{uuid.uuid4().hex[:10]}"
            logger.info(
                f"[SIMULADOR EMAIL GLACIAGUA] De: {EMAIL_FROM} | Para: {req.destinatario} | "
                f"Asunto: {asunto} | Id: {simulated_id}"
            )
            return EmailAlertaResponse(
                enviado=True,
                modo="simulado",
                mensaje="Oficio registrado exitosamente en modo simulado. Para envíos reales hacia buzones, configure RESEND_API_KEY o SMTP_HOST en el servidor.",
                destinatario=req.destinatario,
                id_envio=simulated_id,
                fecha_envio=fecha_actual
            )

        # 3. Enviar vía servidor SMTP estándar
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = asunto
            msg["From"] = remitente_display
            msg["To"] = req.destinatario
            msg["Reply-To"] = EMAIL_FROM

            texto_plano = (
                f"GLACIAGUA - ALERTA Y SOLICITUD COMUNITARIA DE AGUA\n\n"
                f"Destinatario: {req.destinatario_nombre or req.destinatario}\n"
                f"Solicitante: {req.remitente_nombre} ({req.remitente_rol})\n"
                f"Microcuenca: {req.cuenca_nombre}\n"
                f"Motivo: {req.motivo}\n\n"
                f"--------------------------------------------------\n"
                f"{req.cuerpo_texto}\n"
                f"--------------------------------------------------\n"
                f"Mensaje preventivo generado por la plataforma GlaciAgua ({EMAIL_FROM})."
            )
            html_contenido = cls._construir_html_oficio(req)

            msg.attach(MIMEText(texto_plano, "plain", "utf-8"))
            msg.attach(MIMEText(html_contenido, "html", "utf-8"))

            if SMTP_USE_SSL:
                with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=12) as server:
                    if SMTP_USER and SMTP_PASSWORD:
                        server.login(SMTP_USER, SMTP_PASSWORD)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=12) as server:
                    if SMTP_USE_TLS:
                        server.starttls()
                    if SMTP_USER and SMTP_PASSWORD:
                        server.login(SMTP_USER, SMTP_PASSWORD)
                    server.send_message(msg)

            envio_id = f"smtp-{uuid.uuid4().hex[:12]}"
            logger.info(f"[EMAIL ENVIADO SMTP] Exitoso a {req.destinatario} con ID {envio_id}")

            return EmailAlertaResponse(
                enviado=True,
                modo="smtp",
                mensaje=f"Oficio formal enviado exitosamente por correo a {req.destinatario}.",
                destinatario=req.destinatario,
                id_envio=envio_id,
                fecha_envio=fecha_actual
            )

        except Exception as e:
            logger.error(f"[ERROR ENVIO EMAIL] Falló envío a {req.destinatario}: {str(e)}")
            raise RuntimeError(f"Error al enviar correo electrónico: {str(e)}")

    @classmethod
    def obtener_estado(cls) -> Dict[str, Any]:
        """Informa sobre la configuración activa del servicio de correo electrónico."""
        proveedor = "simulado"
        if RESEND_API_KEY:
            proveedor = "resend"
        elif SMTP_HOST:
            proveedor = "smtp"

        return {
            "activo": True,
            "configurado": bool(RESEND_API_KEY or SMTP_HOST),
            "proveedor": proveedor,
            "remitente": EMAIL_FROM,
            "servidor_smtp": SMTP_HOST if SMTP_HOST else None,
            "puerto_smtp": SMTP_PORT if SMTP_HOST else None,
            "soporta_tls": SMTP_USE_TLS,
        }

    @staticmethod
    def _construir_html_bienvenida_investigador(
        nombre: str,
        correo: str,
        password: str,
        institucion: str | None = None,
        admin_nombre: str = "Administrador de Plataforma",
    ) -> str:
        """Genera plantilla HTML formal para notificación de credenciales y bienvenida."""
        institucion_texto = f" por la adscripción institucional <strong>{institucion}</strong>" if institucion else ""
        return f"""<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenida a GlaciAgua - Credenciales de Acceso</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background-color: #f8fafc;
      margin: 0;
      padding: 24px;
    }}
    .container {{
      max-width: 640px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    }}
    .header {{
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      color: #ffffff;
      padding: 28px 32px;
    }}
    .header h1 {{
      margin: 0 0 6px 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }}
    .header p {{
      margin: 0;
      font-size: 13px;
      color: #bfdbfe;
    }}
    .badge {{
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      background-color: #059669;
      color: #ffffff;
      margin-top: 12px;
    }}
    .content {{
      padding: 32px;
    }}
    .greeting {{
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
    }}
    .card-credentials {{
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      padding: 20px 24px;
      margin: 24px 0;
    }}
    .card-credentials h3 {{
      margin: 0 0 14px 0;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1e293b;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }}
    .field-row {{
      margin: 10px 0;
      font-size: 13px;
    }}
    .field-label {{
      display: inline-block;
      width: 150px;
      font-weight: 700;
      color: #475569;
    }}
    .field-value {{
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-weight: 700;
      color: #0f172a;
    }}
    .cta-btn {{
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 10px;
      font-weight: 800;
      font-size: 14px;
      margin: 16px 0;
      text-align: center;
    }}
    .steps {{
      background-color: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 16px 20px;
      border-radius: 8px;
      margin: 20px 0;
      font-size: 13px;
      color: #1e40af;
    }}
    .steps ol {{
      margin: 8px 0 0 16px;
      padding: 0;
    }}
    .steps li {{
      margin-bottom: 6px;
    }}
    .footer {{
      background-color: #f8fafc;
      padding: 20px 32px;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
      text-align: center;
    }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GlaciAgua</h1>
      <p>Sistema de Alerta Temprana de Drenaje Ácido de Roca (DAR) - Cordillera Blanca, Áncash</p>
      <span class="badge">Acreditación Científica Registrada</span>
    </div>

    <div class="content">
      <p class="greeting">Estimado/a {nombre},</p>
      <p>
        Le damos la bienvenida a la plataforma <strong>GlaciAgua</strong>. Su cuenta con rol de <strong>Investigador Científico</strong> ha sido creada satisfactoriamente{institucion_texto} por {admin_nombre}.
      </p>
      <p>
        A través de su cuenta podrá registrar mediciones fisicoquímicas de campo (pH, conductividad, porcentaje de sulfuros y roca desglaciada), contrastar predicciones de riesgo hídrico y consultar los avisos de monitoreo comunitario en las microcuencas piloto (Quillcay, Pachacoto, Canray Chico y Río Blanco).
      </p>

      <div class="card-credentials">
        <h3>Sus Credenciales de Acceso</h3>
        <div class="field-row">
          <span class="field-label">Portal Web:</span>
          <span class="field-value"><a href="https://glaciagua.lat" style="color: #2563eb; text-decoration: underline;">https://glaciagua.lat</a></span>
        </div>
        <div class="field-row">
          <span class="field-label">Usuario / Correo:</span>
          <span class="field-value">{correo}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Contraseña Temporal:</span>
          <span class="field-value" style="background:#e2e8f0; padding:2px 8px; border-radius:4px;">{password}</span>
        </div>
        <div class="field-row">
          <span class="field-label">Rol Asignado:</span>
          <span class="field-value">Investigador Científico (PBKDF2)</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="https://glaciagua.lat" class="cta-btn" target="_blank">
          Ingresar al Portal GlaciAgua &rarr;
        </a>
      </div>

      <div class="steps">
        <strong>Instrucciones para iniciar sesión:</strong>
        <ol>
          <li>Haga clic en el botón superior o visite <code>https://glaciagua.lat</code>.</li>
          <li>En la barra de navegación o menú lateral, seleccione <strong>"Portal de Especialistas"</strong>.</li>
          <li>Ingrese con su correo electrónico y su contraseña indicados arriba.</li>
          <li>En la pestaña <strong>"2. Mediciones Campo"</strong> podrá registrar muestreos con autoría certificada y en <strong>"6. Bandeja Reportes"</strong> contrastar observaciones ciudadanas.</li>
        </ol>
      </div>

      <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
        <em>Nota de seguridad:</em> Esta contraseña es estrictamente confidencial. Por política de trazabilidad, sus mediciones quedarán firmadas bajo su autoría profesional e institucional.
      </p>
    </div>

    <div class="footer">
      <p>Notificación oficial emitida por el equipo de ingeniería y monitoreo ambiental de <strong>GlaciAgua</strong>.</p>
      <p style="font-size: 11px; color: #94a3b8; margin-top: 6px;">
        Huaraz, Cordillera Blanca, Áncash &bull; alertas@glaciagua.lat
      </p>
    </div>
  </div>
</body>
</html>
"""

    @classmethod
    def enviar_bienvenida_investigador(
        cls,
        nombre: str,
        correo: str,
        password: str,
        institucion: str | None = None,
        admin_nombre: str = "Administrador de Plataforma",
    ) -> Dict[str, Any]:
        """
        Envía credenciales de acceso y enlace directo al portal para nuevos investigadores.
        Soporta Resend API HTTPS, servidor SMTP y modo simulado para desarrollo.
        """
        asunto = "[GlaciAgua] Credenciales de Acceso - Portal de Especialistas e Investigadores"
        remitente_display = f"GlaciAgua Credenciales <{EMAIL_FROM}>"
        fecha_actual = datetime.now().isoformat()
        portal_url = "https://glaciagua.lat"

        texto_plano = (
            f"GLACIAGUA - BIENVENIDA Y CREDENCIALES DE ACCESO\n\n"
            f"Estimado/a {nombre}:\n\n"
            f"Le damos la bienvenida a la plataforma GlaciAgua. Ha sido registrado/a como Investigador/a Científico/a"
            f"{f' ({institucion})' if institucion else ''} por {admin_nombre}.\n\n"
            f"SUS CREDENCIALES DE ACCESO:\n"
            f"- Portal de Acceso: {portal_url}\n"
            f"- Usuario / Correo: {correo}\n"
            f"- Contraseña Temporal: {password}\n"
            f"- Rol Asignado: Investigador Científico (PBKDF2)\n\n"
            f"INSTRUCCIONES DE ACCESO:\n"
            f"1. Visite {portal_url} desde su navegador.\n"
            f"2. En la barra superior, seleccione 'Portal de Especialistas'.\n"
            f"3. Ingrese con su correo y contraseña.\n"
            f"4. Podrá ingresar a '2. Mediciones Campo' para registrar datos hidroquímicos y a '6. Bandeja Reportes' para contrastar observaciones ciudadanas.\n\n"
            f"Nota de seguridad: Esta contraseña es de uso personal y confidencial. Por política de trazabilidad, sus mediciones quedarán firmadas bajo su autoría.\n\n"
            f"Equipo GlaciAgua - Monitoreo Hídrico de la Cordillera Blanca\n"
            f"{EMAIL_FROM}"
        )

        html_contenido = cls._construir_html_bienvenida_investigador(
            nombre=nombre,
            correo=correo,
            password=password,
            institucion=institucion,
            admin_nombre=admin_nombre,
        )

        # 1. Enviar vía Resend REST API (HTTPS puerto 443)
        if RESEND_API_KEY:
            try:
                with httpx.Client(timeout=10.0) as client:
                    resp = client.post(
                        "https://api.resend.com/emails",
                        headers={
                            "Authorization": f"Bearer {RESEND_API_KEY}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "from": remitente_display,
                            "to": [correo],
                            "subject": asunto,
                            "html": html_contenido,
                            "text": texto_plano,
                        },
                    )
                    if resp.status_code in (200, 201):
                        data = resp.json()
                        envio_id = data.get("id", f"resend-{uuid.uuid4().hex[:10]}")
                        logger.info(f"[BIENVENIDA RESEND OK] Enviado a {correo} ID {envio_id}")
                        return {
                            "enviado": True,
                            "modo": "resend",
                            "destinatario": correo,
                            "id_envio": envio_id,
                            "fecha_envio": fecha_actual,
                        }
                    else:
                        logger.warning(f"[BIENVENIDA RESEND FAIL {resp.status_code}] {resp.text}. Probando fallback SMTP...")
            except Exception as e:
                logger.warning(f"[BIENVENIDA RESEND EXCEPTION] {str(e)}. Probando fallback SMTP...")

        # 2. Modo simulado si no hay SMTP configurado
        if not SMTP_HOST:
            simulated_id = f"sim-{uuid.uuid4().hex[:10]}"
            logger.info(
                f"[BIENVENIDA SIMULADA] De: {EMAIL_FROM} | Para: {correo} | "
                f"Password: {password} | ID: {simulated_id}"
            )
            return {
                "enviado": True,
                "modo": "simulado",
                "destinatario": correo,
                "id_envio": simulated_id,
                "fecha_envio": fecha_actual,
            }

        # 3. Servidor SMTP estándar
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = asunto
            msg["From"] = remitente_display
            msg["To"] = correo
            msg["Reply-To"] = EMAIL_FROM

            msg.attach(MIMEText(texto_plano, "plain", "utf-8"))
            msg.attach(MIMEText(html_contenido, "html", "utf-8"))

            if SMTP_USE_SSL:
                with smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT, timeout=12) as server:
                    if SMTP_USER and SMTP_PASSWORD:
                        server.login(SMTP_USER, SMTP_PASSWORD)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=12) as server:
                    if SMTP_USE_TLS:
                        server.starttls()
                    if SMTP_USER and SMTP_PASSWORD:
                        server.login(SMTP_USER, SMTP_PASSWORD)
                    server.send_message(msg)

            envio_id = f"smtp-{uuid.uuid4().hex[:12]}"
            logger.info(f"[BIENVENIDA SMTP OK] Enviado a {correo} ID {envio_id}")
            return {
                "enviado": True,
                "modo": "smtp",
                "destinatario": correo,
                "id_envio": envio_id,
                "fecha_envio": fecha_actual,
            }
        except Exception as e:
            logger.error(f"[BIENVENIDA ERROR] Falló envío a {correo}: {str(e)}")
            return {
                "enviado": False,
                "modo": "error",
                "error": str(e),
                "destinatario": correo,
            }
