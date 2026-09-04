"""
Ponto de entrada da aplicação FastAPI.

Responsável pela inicialização da API, configuração dos middlewares
e registro dos módulos de rotas da aplicação.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, engine

from app.models.sala import Sala
from app.models.chamado import Chamado

from app.routes import salas
from app.routes import chamados
from app.routes import qrcodes


# Inicialização das estruturas persistidas durante o startup
# da aplicação. O SQLite é utilizado no ambiente de MVP.
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="QR da Sala API",
    description="API para registro e gerenciamento de problemas em salas.",
    version="0.1.0"
)


# Permite a comunicação entre o frontend estático e a API
# durante o desenvolvimento local.
#
# Em produção, a política deverá ser restringida aos domínios
# autorizados da aplicação.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Registro dos módulos responsáveis pelos recursos da API.
app.include_router(salas.router)
app.include_router(chamados.router)
app.include_router(qrcodes.router)


@app.get("/")
def home():
    """
    Endpoint de identificação da aplicação.
    """

    return {
        "message": "QR da Sala API funcionando!",
        "version": "0.1.0"
    }


@app.get("/health")
def health_check():
    """
    Endpoint destinado a health checks e monitoramento da aplicação.

    A rota pode ser integrada posteriormente a mecanismos de
    observabilidade e verificação de disponibilidade na infraestrutura.
    """

    return {
        "status": "healthy"
    }