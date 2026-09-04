"""
Configuração da conexão com o banco de dados.

Neste primeiro MVP vamos utilizar SQLite porque:
- é simples;
- não exige servidor de banco;
- facilita os testes locais;
- permite desenvolver rapidamente.

Posteriormente podemos trocar por PostgreSQL ou DynamoDB
quando levarmos o projeto para a AWS.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Arquivo do banco que será criado dentro da pasta backend
DATABASE_URL = "sqlite:///./qr_sala.db"

# Criação da engine do SQLAlchemy
# check_same_thread=False é necessário para o SQLite funcionar
# corretamente com o FastAPI.
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

# Cria as sessões utilizadas para conversar com o banco
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Classe base utilizada pelos nossos modelos
Base = declarative_base()


def get_db():
    """
    Cria uma sessão com o banco para cada requisição.

    O yield permite que o FastAPI utilize a sessão
    e depois a feche automaticamente.
    """

    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()