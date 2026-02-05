from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "URL Shortener"
    DATABASE_URL: str = "sqlite:///./shortener.db"
    REDIS_URL: str = "redis://localhost:6379"
    BASE_URL: str = "http://localhost:8000"

    class Config:
        env_file = ".env"

settings = Settings()
