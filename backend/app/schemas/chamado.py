"""
Schemas utilizados para criação e retorno dos chamados.
"""

from datetime import datetime

from pydantic import BaseModel


class ChamadoCreate(BaseModel):
    """
    Dados necessários para criar um chamado.
    """

    sala_id: int
    categoria: str
    descricao: str | None = None


class ChamadoResponse(BaseModel):
    """
    Dados retornados pela API.
    """

    id: int
    sala_id: int
    categoria: str
    descricao: str | None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ChamadoStatusUpdate(BaseModel):
    """
    Utilizado para alterar o status de um chamado.
    """

    status: str