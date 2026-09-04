"""
Endpoints responsáveis pela geração dos QR Codes das salas.

O QR Code encapsula a URL pública da interface associada à sala,
permitindo que o identificador da sala seja transportado diretamente
para o frontend sem necessidade de entrada manual pelo usuário.
"""

from io import BytesIO

import qrcode
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.models.sala import Sala


router = APIRouter(
    prefix="/qrcodes",
    tags=["QR Codes"]
)


# URL base da interface utilizada para acesso às salas.
# Em ambientes produtivos, este valor deverá ser externalizado
# por variável de ambiente ou configuração de deployment.
FRONTEND_URL = "http://127.0.0.1:5500/frontend/sala.html"


@router.get("/sala/{sala_id}")
def gerar_qr_code(
    sala_id: int,
    db: Session = Depends(get_db)
):
    """
    Gera o QR Code associado a uma sala existente.

    O conteúdo codificado corresponde à URL da interface da sala,
    incluindo seu identificador como parâmetro de consulta.
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

    # A URL é construída a partir do identificador persistido,
    # garantindo que o QR Code direcione para o recurso correto.
    sala_url = f"{FRONTEND_URL}?sala={sala.id}"

    qr_code = qrcode.QRCode(
        version=1,
        box_size=10,
        border=4
    )

    qr_code.add_data(sala_url)
    qr_code.make(fit=True)

    imagem = qr_code.make_image(
        fill_color="black",
        back_color="white"
    )

    # A imagem é mantida em memória para evitar a criação
    # de arquivos temporários no filesystem da aplicação.
    buffer = BytesIO()
    imagem.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="image/png"
    )