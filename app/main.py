from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
from pathlib import Path
from app.core.config import settings
from app.core.database import init_db
from app.api.endpoints import router
from app.core.logging import logger

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicialização
    logger.info("Iniciando Encurtador de URL...")
    init_db()
    yield
    # Desligamento
    logger.info("Desligando Encurtador de URL...")

app = FastAPI(
    title=settings.PROJECT_NAME, 
    lifespan=lifespan
)

# Montar arquivos estáticos
static_path = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

# Incluir rotas da API
app.include_router(router)

@app.get("/")
def home():
    """Serve a página inicial"""
    return FileResponse(static_path / "index.html")

