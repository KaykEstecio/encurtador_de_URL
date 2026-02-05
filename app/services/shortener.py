import secrets
import string
from sqlalchemy.orm import Session
from app.models.models import URL

EXISTING_chars = string.ascii_letters + string.digits

def create_unique_random_key(length: int = 6) -> str:
    chars = string.ascii_letters + string.digits
    return "".join(secrets.choice(chars) for _ in range(length))

def create_short_url(db: Session, target_url: str, expires_at=None) -> URL:
    key = create_unique_random_key()
    # Verificação de colisão simples (em produção, use uma estratégia mais robusta ou loop de repetição)
    while db.query(URL).filter(URL.key == key).first():
        key = create_unique_random_key()
        
    db_url = URL(target_url=target_url, key=key, expires_at=expires_at)
    db.add(db_url)
    db.commit()
    db.refresh(db_url)
    return db_url
