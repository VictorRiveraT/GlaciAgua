"""Gestión y creación inicial del administrador del sistema GlaciAgua.
Permite ejecución interactiva, vía argumentos CLI o variables de entorno.
"""
import argparse
import getpass
import os
import sqlite3
import sys
from contextlib import closing

from auth import hash_password, init_auth_db
from services.db import get_connection


def crear_o_actualizar_admin(
    nombre: str,
    correo: str,
    password: str,
    institucion: str = "GlaciAgua Central",
    forzar_si_existe: bool = False,
) -> bool:
    """Crea el usuario administrador si no existe, o actualiza su contraseña si forzar_si_existe es True."""
    init_auth_db()
    nombre = nombre.strip()
    correo = correo.strip().lower()

    if not nombre or len(nombre) > 150 or "@" not in correo or len(correo) > 254:
        raise ValueError("Nombre o correo inválido.")
    if len(password) < 8 or len(password) > 256:
        raise ValueError("La contraseña debe tener entre 8 y 256 caracteres.")

    password_hash = hash_password(password)

    with closing(get_connection()) as conn, conn:
        conn.execute("BEGIN IMMEDIATE")
        admin_existente = conn.execute(
            "SELECT id, correo FROM usuarios WHERE rol = 'admin' LIMIT 1"
        ).fetchone()

        if admin_existente:
            if forzar_si_existe:
                conn.execute(
                    "UPDATE usuarios SET nombre=?, correo=?, password_hash=?, institucion=?, estado='activo', actualizado_en=CURRENT_TIMESTAMP WHERE id=?",
                    (nombre, correo, password_hash, institucion, admin_existente["id"]),
                )
                return True
            return False

        # Si el correo existe como otro rol, actualizar a admin
        usuario_correo = conn.execute("SELECT id FROM usuarios WHERE correo = ?", (correo,)).fetchone()
        if usuario_correo:
            conn.execute(
                "UPDATE usuarios SET nombre=?, password_hash=?, rol='admin', institucion=?, estado='activo', actualizado_en=CURRENT_TIMESTAMP WHERE id=?",
                (nombre, password_hash, institucion, usuario_correo["id"]),
            )
            return True

        conn.execute(
            "INSERT INTO usuarios (nombre, correo, password_hash, rol, institucion, estado) VALUES (?, ?, ?, 'admin', ?, 'activo')",
            (nombre, correo, password_hash, institucion),
        )
        return True


def garantizar_admin_por_defecto() -> bool:
    """Garantiza que exista al menos un administrador en la base de datos."""
    init_auth_db()
    with closing(get_connection()) as conn:
        if conn.execute("SELECT 1 FROM usuarios WHERE rol = 'admin' LIMIT 1").fetchone():
            return False

    nombre = os.getenv("ADMIN_NOMBRE", "Administrador GlaciAgua")
    correo = os.getenv("ADMIN_CORREO", os.getenv("ADMIN_EMAIL", "admin@glaciagua.lat"))
    password = os.getenv("ADMIN_PASSWORD", "glaciagua2026!")
    institucion = os.getenv("ADMIN_INSTITUCION", "Equipo Central GlaciAgua")

    return crear_o_actualizar_admin(nombre, correo, password, institucion)


def main():
    parser = argparse.ArgumentParser(description="Crear o verificar administrador de GlaciAgua")
    parser.add_argument("--nombre", help="Nombre completo del administrador")
    parser.add_argument("--correo", help="Correo electrónico")
    parser.add_argument("--password", help="Contraseña (mínimo 8 caracteres)")
    parser.add_argument("--institucion", default="GlaciAgua Central", help="Institución del administrador")
    parser.add_argument("--forzar", action="store_true", help="Actualizar credenciales si el admin ya existe")
    args = parser.parse_args()

    init_auth_db()

    # Prioridad 1: Argumentos CLI o Variables de Entorno
    nombre = args.nombre or os.getenv("ADMIN_NOMBRE")
    correo = args.correo or os.getenv("ADMIN_CORREO") or os.getenv("ADMIN_EMAIL")
    password = args.password or os.getenv("ADMIN_PASSWORD")
    institucion = args.institucion or os.getenv("ADMIN_INSTITUCION", "GlaciAgua Central")

    # Prioridad 2: Si no hay argumentos y es TTY interactiva, solicitar por consola
    if not (nombre and correo and password) and sys.stdin.isatty():
        with closing(get_connection()) as conn:
            if conn.execute("SELECT 1 FROM usuarios WHERE rol = 'admin' LIMIT 1").fetchone() and not args.forzar:
                print("Ya existe un administrador en el sistema.")
                return

        print("=== Inicialización de Administrador GlaciAgua ===")
        nombre = input("Nombre: ").strip()
        correo = input("Correo: ").strip().lower()
        password = getpass.getpass("Contraseña (mínimo 8 caracteres): ")
        confirmacion = getpass.getpass("Repite la contraseña: ")
        if password != confirmacion:
            raise SystemExit("Las contraseñas no coinciden.")

    if not (nombre and correo and password):
        # Modo desatendido con valores por defecto de seguridad
        creado = garantizar_admin_por_defecto()
        if creado:
            print("Administrador por defecto inicializado con éxito (admin@glaciagua.lat).")
        else:
            print("Ya existe un administrador. No se realizaron cambios.")
        return

    try:
        creado = crear_o_actualizar_admin(nombre, correo, password, institucion, forzar_si_existe=args.forzar)
        if creado:
            print(f"Administrador '{correo}' guardado correctamente.")
        else:
            print("Ya existe un administrador. Usa --forzar para actualizarlo.")
    except Exception as exc:
        raise SystemExit(f"Error al registrar administrador: {exc}")


if __name__ == "__main__":
    main()
