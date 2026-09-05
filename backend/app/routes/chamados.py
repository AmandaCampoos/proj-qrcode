"""
Endpoints relacionados ao ciclo de vida dos chamados.

O módulo concentra as operações de criação, consulta e atualização
das ocorrências registradas pelos usuários.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.chamado import Chamado


router = APIRouter(
    prefix="/chamados",
    tags=["Chamados"]
)


@router.post("/")
def criar_chamado(
    chamado_data: dict,
    db: Session = Depends(get_db)
):
    """
    Registra uma nova ocorrência associada a uma sala.
    """

    chamado = Chamado(
        sala_id=chamado_data["sala_id"],
        categoria=chamado_data["categoria"],
        descricao=chamado_data.get("descricao"),
        status="aberto"
    )

    db.add(chamado)
    db.commit()
    db.refresh(chamado)

    return chamado


@router.get("/")
def listar_chamados(
    db: Session = Depends(get_db)
):
    """
    Retorna os chamados registrados em ordem decrescente
    de criação, priorizando as ocorrências mais recentes.
    """

    return (
        db.query(Chamado)
        .order_by(Chamado.id.desc())
        .all()
    )


@router.get("/{chamado_id}")
def obter_chamado(
    chamado_id: int,
    db: Session = Depends(get_db)
):
    """
    Retorna os dados de um chamado específico.
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


@router.patch("/{chamado_id}/status")
def atualizar_status(
    chamado_id: int,
    status_data: dict,
    db: Session = Depends(get_db)
):
    """
    Atualiza o estado operacional de um chamado.

    O endpoint utiliza PATCH por representar uma alteração parcial
    do recurso, preservando os demais atributos persistidos.
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


    novo_status = status_data.get("status")


    # Estados suportados pelo fluxo operacional do sistema.
    status_validos = {
        "aberto",
        "em_atendimento",
        "resolvido"
    }


    if novo_status not in status_validos:

        raise HTTPException(
            status_code=400,
            detail="Status inválido."
        )


    chamado.status = novo_status

    db.commit()
    db.refresh(chamado)

    return chamado