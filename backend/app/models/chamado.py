"""
Modelo dos chamados registrados pelos usuários.
"""

from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String

from app.database.connection import Base


class Chamado(Base):
    """
    Representa um problema informado por um usuário.
    """

    __tablename__ = "chamados"

    # ID único do chamado
    id = Column(Integer, primary_key=True, index=True)

    # ID da sala onde o problema aconteceu
    sala_id = Column(
        Integer,
        ForeignKey("salas.id"),
        nullable=False
    )

    # Categoria do problema
    # Exemplos:
    # projetor, internet, iluminação...
    categoria = Column(String, nullable=False)

    # Descrição fornecida pelo usuário
    descricao = Column(String, nullable=True)

    # Status inicial do chamado
    # Valores esperados:
    # aberto
    # em_atendimento
    # resolvido
    status = Column(
        String,
        default="aberto",
        nullable=False
    )

    # Data e horário de criação
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # Data e horário da última atualização
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )