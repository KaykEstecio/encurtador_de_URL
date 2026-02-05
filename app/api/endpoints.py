from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.schemas.schemas import URLCreate, URLResponse, StatsResponse
from app.core.database import get_session
from app.services import shortener, stats
from app.services.cache import cache
from app.core.logging import logger
from app.models.models import URL
from app.core.config import settings
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/shorten", response_model=URLResponse, status_code=201)
def shorten_url(url_in: URLCreate, db: Session = Depends(get_session)):
    """
    Cria uma URL encurtada.
    """
    # Lógica de expiração
    expires_at = None
    if url_in.expires_in_days:
        expires_at = datetime.utcnow() + timedelta(days=url_in.expires_in_days)

    db_url = shortener.create_short_url(db=db, target_url=str(url_in.target_url), expires_at=expires_at)
    
    # Pre-cache (otimização opcional)
    # await cache.set_url(db_url.key, db_url.target_url) 
    
    return URLResponse(
        target_url=db_url.target_url,
        short_url=f"{settings.BASE_URL}/{db_url.key}",
        admin_url=f"{settings.BASE_URL}/stats/{db_url.key}",
        expires_at=db_url.expires_at
    )

@router.get("/stats/{short_code}", response_model=StatsResponse)
def get_stats(short_code: str, db: Session = Depends(get_session)):
    """
    Obtém estatísticas de uma URL curta.
    """
    url_entry = db.query(URL).filter(URL.key == short_code).first()
    if not url_entry:
        raise HTTPException(status_code=404, detail="URL não encontrada")

    # Esta é uma implementação de agregação básica.
    # Para alta escala, use SQL puro ou tabelas pré-agregadas.
    # visits = url_entry.visits # acesso via relacionamento se definido, senão query separada
    
    # Consultando visitas manualmente se o relacionamento não estiver estritamente definido no modelo (abordagem preguiçosa)
    # Adicionar relacionamento no models.py seria mais limpo, mas por enquanto podemos consultar a tabela Visit diretamente
    from app.models.models import Visit
    all_visits = db.query(Visit).filter(Visit.url_id == url_entry.id).all()
    
    browsers = {}
    countries = {}
    os_dict = {}

    for v in all_visits:
        browsers[v.browser] = browsers.get(v.browser, 0) + 1
        countries[v.country or "Desconhecido"] = countries.get(v.country or "Desconhecido", 0) + 1
        os_dict[v.os] = os_dict.get(v.os, 0) + 1

    return StatsResponse(
        total_clicks=url_entry.clicks,
        browsers=browsers,
        countries=countries,
        os=os_dict
    )

@router.get("/{short_code}")
async def redirect_to_url(
    short_code: str, 
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_session)
):
    """
    Redireciona para a URL original.
    """
    # 1. Tentar Cache
    cached_target = await cache.get_url(short_code)
    if cached_target:
        # Estatísticas em segundo plano
        background_tasks.add_task(
            stats.track_visit, 
            db, 
            short_code, 
            request.headers.get("user-agent", ""),
            request.client.host if request.client else "localhost"
        )
        # Incrementar estatística no Redis
        await cache.increment_stats(short_code)
        return RedirectResponse(cached_target)

    # 2. Fallback para Banco de Dados
    url_entry = db.query(URL).filter(URL.key == short_code).first()
    
    if not url_entry or not url_entry.is_active:
        raise HTTPException(status_code=404, detail="URL não encontrada")
        
    # Verificar expiração
    if url_entry.expires_at and url_entry.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="URL expirada")

    # 3. Cachear para a próxima vez
    await cache.set_url(short_code, url_entry.target_url)

    # 4. Estatísticas em segundo plano
    background_tasks.add_task(
        stats.track_visit, 
        db, 
        short_code, 
        request.headers.get("user-agent", ""),
            request.client.host if request.client else "localhost"
    )

    return RedirectResponse(url_entry.target_url)
