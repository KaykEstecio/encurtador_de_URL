import redis.asyncio as redis
from app.core.config import settings
from app.core.logging import logger

class CacheService:
    def __init__(self):
        self.redis = None
        self.redis_available = False
        try:
            self.redis = redis.from_url(
                settings.REDIS_URL, 
                encoding="utf-8", 
                decode_responses=True,
                socket_connect_timeout=2,  # Timeout rápido
                socket_timeout=2
            )
            self.redis_available = True
            logger.info("Redis conectado com sucesso")
        except Exception as e:
            logger.warning(f"Redis não disponível, rodando sem cache: {e}")
            self.redis_available = False

    async def get_url(self, key: str) -> str | None:
        if not self.redis_available:
            return None
        try:
            return await self.redis.get(f"url:{key}")
        except Exception as e:
            logger.error(f"Erro Redis ao buscar chave {key}: {e}")
            self.redis_available = False
            return None

    async def set_url(self, key: str, url: str, expire: int = 3600):
        if not self.redis_available:
            return
        try:
            await self.redis.set(f"url:{key}", url, ex=expire)
        except Exception as e:
            logger.error(f"Erro Redis ao definir chave {key}: {e}")
            self.redis_available = False

    async def increment_stats(self, key: str):
        if not self.redis_available:
            return
        try:
           await self.redis.incr(f"stats:{key}:clicks")
        except Exception as e:
            logger.error(f"Erro Redis incr stats {key}: {e}")
            self.redis_available = False

cache = CacheService()

