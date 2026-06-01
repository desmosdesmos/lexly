from sqlalchemy import Column, String, Text, DateTime, Integer
from sqlalchemy.sql import func
import uuid

from app.database import Base

class SEOArticle(Base):
    __tablename__ = "seo_articles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=False)
    meta_description = Column(Text)
    views_count = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    updated_at = Column(DateTime, nullable=False, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<SEOArticle {self.slug}>"
