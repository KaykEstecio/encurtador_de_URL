from fastapi import FastAPI
from contextlib import asynccontextmanager
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

app.include_router(router)

@app.get("/")
def health_check():
    return {"status": "ok", "service": settings.PROJECT_NAME}
