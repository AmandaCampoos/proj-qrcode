"""
Rotas relacionadas aos chamados.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.chamado import Chamado
from app.models.sala import Sala
from app.schemas.chamado import (
    ChamadoCreate,
    ChamadoResponse,
    ChamadoStatusUpdate
)


router = APIRouter(
    prefix="/chamados",
    tags=["Chamados"]
)


@router.post(
    "/",
    response_model=ChamadoResponse
)
def criar_chamado(
    chamado: ChamadoCreate,
    db: Session = Depends(get_db)
):
    """
    Cria um novo chamado.
    """

    # Primeiro verificamos se a sala existe
    sala = (
        db.query(Sala)
        .filter(Sala.id == chamado.sala_id)
        .first()
    )

    if not sala:
        raise HTTPException(
            status_code=404,
            detail="Sala não encontrada."
        )

    # Criamos o chamado
    novo_chamado = Chamado(
        sala_id=chamado.sala_id,
        categoria=chamado.categoria,
        descricao=chamado.descricao,
        status="aberto"
    )

    db.add(novo_chamado)
    db.commit()
    db.refresh(novo_chamado)

    return novo_chamado


@router.get(
    "/",
    response_model=list[ChamadoResponse]
)
def listar_chamados(
    db: Session = Depends(get_db)
):
    """
    Lista todos os chamados.
    """

    return (
        db.query(Chamado)
        .order_by(Chamado.created_at.desc())
        .all()
    )


@router.get(
    "/{chamado_id}",
    response_model=ChamadoResponse
)
def buscar_chamado(
    chamado_id: int,
    db: Session = Depends(get_db)
):
    """
    Busca um chamado específico.
    """

    chamado = (
        db.query(Chamado)
        .filter(Chamado.id == chamado_id)
        .first()
    )

    if not chamado:
        raise HTTPException(
            status_code=404,
            detail="Chamado não encontrado."
        )

    return chamado


@router.patch(
    "/{chamado_id}/status",
    response_model=ChamadoResponse
)
def atualizar_status(
    chamado_id: int,
    dados: ChamadoStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza o status de um chamado.
    """

    # Status permitidos
    status_validos = [
        "aberto",
        "em_atendimento",
        "resolvido"
    ]

    if dados.status not in status_validos:
        raise HTTPException(
            status_code=400,
            detail="Status inválido."
        )

    chamado = (
        db.query(Chamado)
        .filter(Chamado.id == chamado_id)
        .first()
    )

    if not chamado:
        raise HTTPException(
            status_code=404,
            detail="Chamado não encontrado."
        )

    # Atualiza o status
    chamado.status = dados.status

    db.commit()
    db.refresh(chamado)

    return chamado