from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class URL(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(index=True, unique=True)
    target_url: str
    is_active: bool = True
    clicks: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None

class Visit(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    url_id: int = Field(index=True) # Foreign key logic can be added if strict integrity is needed
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    browser: Optional[str] = None
    os: Optional[str] = None
    country: Optional[str] = None
