"""
Modelo da tabela de salas.

Cada sala terá um QR Code próprio.
"""

from sqlalchemy import Column, Integer, String

from app.database.connection import Base


class Sala(Base):
    """
    Representa uma sala cadastrada no sistema.
    """

    __tablename__ = "salas"

    # Identificador único da sala
    id = Column(Integer, primary_key=True, index=True)

    # Nome da sala
    # Exemplo: "Sala 204"
    nome = Column(String, nullable=False)

    # Bloco ou prédio
    # Exemplo: "Bloco B"
    bloco = Column(String, nullable=True)

    # Descrição opcional
    # Exemplo: "Laboratório de informática"
    descricao = Column(String, nullable=True)

    # Identificador utilizado no QR Code
    # Exemplo: "sala-204"
    qr_code = Column(String, unique=True, nullable=False, index=True)