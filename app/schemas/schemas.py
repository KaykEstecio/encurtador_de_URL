from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class URLBase(BaseModel):
    target_url: HttpUrl

class URLCreate(URLBase):
    expires_in_days: Optional[int] = 7

class URLResponse(URLBase):
    short_url: str
    admin_url: str
    expires_at: Optional[datetime]
    
    class Config:
        from_attributes = True

class StatsResponse(BaseModel):
    total_clicks: int
    browsers: dict[str, int]
    countries: dict[str, int]
    os: dict[str, int]
