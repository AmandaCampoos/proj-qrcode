"""
Rotas relacionadas às salas.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.sala import Sala
from app.schemas.sala import SalaCreate, SalaResponse


# Criação do router
router = APIRouter(
    prefix="/salas",
    tags=["Salas"]
)


@router.post("/", response_model=SalaResponse)
def criar_sala(
    sala: SalaCreate,
    db: Session = Depends(get_db)
):
    """
    Cria uma nova sala no sistema.
    """

    # Verifica se já existe uma sala com o mesmo QR Code
    sala_existente = (
        db.query(Sala)
        .filter(Sala.qr_code == sala.qr_code)
        .first()
    )

    if sala_existente:
        raise HTTPException(
            status_code=400,
            detail="Já existe uma sala com esse QR Code."
        )

    # Cria o objeto da sala
    nova_sala = Sala(
        nome=sala.nome,
        bloco=sala.bloco,
        descricao=sala.descricao,
        qr_code=sala.qr_code
    )

    # Adiciona ao banco
    db.add(nova_sala)

    # Salva
    db.commit()

    # Atualiza o objeto com o ID gerado
    db.refresh(nova_sala)

    return nova_sala


@router.get("/", response_model=list[SalaResponse])
def listar_salas(
    db: Session = Depends(get_db)
):
    """
    Retorna todas as salas cadastradas.
    """

    return db.query(Sala).all()


@router.get("/{sala_id}", response_model=SalaResponse)
def buscar_sala(
    sala_id: int,
    db: Session = Depends(get_db)
):
    """
    Busca uma sala pelo ID.
    """

    sala = (
        db.query(Sala)
        .filter(Sala.id == sala_id)
        .first()
    )

    if not sala:
        raise HTTPException(
            status_code=404,
            detail="Sala não encontrada."
        )

    return sala