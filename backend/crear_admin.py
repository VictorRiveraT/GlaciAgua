"""Ejecutar desde backend: python crear_admin.py. No expone un registro público."""
import getpass
import sqlite3
from contextlib import closing

from auth import hash_password, init_auth_db
from services.db import get_connection


def main():
    init_auth_db()
    with closing(get_connection()) as conn:
        if conn.execute("SELECT 1 FROM usuarios WHERE rol = 'admin' LIMIT 1").fetchone():
            print("Ya existe un administrador. No se creó otra cuenta.")
            return
    nombre = input("Nombre: ").strip()
    correo = input("Correo: ").strip().lower()
    password = getpass.getpass("Contraseña (mínimo 12 caracteres): ")
    confirmacion = getpass.getpass("Repite la contraseña: ")
    if not nombre or len(nombre) > 150 or "@" not in correo or len(correo) > 254:
        raise SystemExit("Nombre o correo inválido.")
    if not 12 <= len(password) <= 256 or password != confirmacion:
        raise SystemExit("La contraseña no cumple la longitud o no coincide.")
    password_hash = hash_password(password)
    try:
        with closing(get_connection()) as conn, conn:
            conn.execute("BEGIN IMMEDIATE")
            if conn.execute("SELECT 1 FROM usuarios WHERE rol = 'admin' LIMIT 1").fetchone():
                print("Ya existe un administrador.")
                return
            conn.execute("INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES (?, ?, ?, 'admin')",
                         (nombre, correo, password_hash))
    except sqlite3.IntegrityError:
        raise SystemExit("No se creó la cuenta: el correo ya existe o los datos no son válidos.")
    print("Administrador creado correctamente.")


if __name__ == "__main__":
    main()
