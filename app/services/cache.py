import redis.asyncio as redis
from app.core.config import settings
from app.core.logging import logger

class CacheService:
    def __init__(self):
        self.redis = redis.from_url(settings.REDIS_URL, encoding="utf-8", decode_responses=True)

    async def get_url(self, key: str) -> str | None:
        try:
            return await self.redis.get(f"url:{key}")
        except Exception as e:
            logger.error(f"Erro Redis ao buscar chave {key}: {e}")
            return None

    async def set_url(self, key: str, url: str, expire: int = 3600):
        try:
            await self.redis.set(f"url:{key}", url, ex=expire)
        except Exception as e:
            logger.error(f"Erro Redis ao definir chave {key}: {e}")

    async def increment_stats(self, key: str):
        # Podemos usar HyperLogLog ou contadores simples aqui para estatísticas rápidas em tempo real
        try:
           await self.redis.incr(f"stats:{key}:clicks")
        except Exception as e:
            logger.error(f"Erro Redis incr stats {key}: {e}")

cache = CacheService()
