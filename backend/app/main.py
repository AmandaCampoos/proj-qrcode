"""
Ponto de entrada da aplicação FastAPI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.connection import Base, engine

# Importamos os modelos para que o SQLAlchemy
# conheça as tabelas que precisam ser criadas.
from app.models.sala import Sala
from app.models.chamado import Chamado

# Importamos nossas rotas
from app.routes import salas
from app.routes import chamados


# Cria as tabelas automaticamente
# caso elas ainda não existam.
Base.metadata.create_all(bind=engine)


# Criação da aplicação
app = FastAPI(
    title="QR da Sala API",
    description="API para registro e gerenciamento de problemas em salas.",
    version="0.1.0"
)


# Permite que o frontend converse com o backend.
# Durante o desenvolvimento deixaremos liberado.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Registra as rotas
app.include_router(salas.router)
app.include_router(chamados.router)


@app.get("/")
def home():
    """
    Endpoint inicial para verificar se a API está funcionando.
    """

    return {
        "message": "QR da Sala API funcionando!",
        "version": "0.1.0"
    }


@app.get("/health")
def health_check():
    """
    Endpoint utilizado para verificar a saúde da aplicação.

    No futuro esse endpoint poderá ser utilizado
    por serviços de monitoramento da AWS.
    """

    return {
        "status": "healthy"
    }