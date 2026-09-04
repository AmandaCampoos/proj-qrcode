"""
Schemas utilizados para validar os dados das salas.
"""

from pydantic import BaseModel


class SalaBase(BaseModel):
    """
    Campos básicos de uma sala.
    """

    nome: str
    bloco: str | None = None
    descricao: str | None = None
    qr_code: str


class SalaCreate(SalaBase):
    """
    Schema utilizado quando criamos uma sala.
    """

    pass


class SalaResponse(SalaBase):
    """
    Schema devolvido pela API.
    """

    id: int

    class Config:
        from_attributes = True