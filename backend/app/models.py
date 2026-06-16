from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import uuid

class Board(Base):
    __tablename__ = "boards"

    id:          Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id:     Mapped[str]       = mapped_column(String, nullable=False, index=True)  # Clerk user ID
    name:        Mapped[str]       = mapped_column(String(200), nullable=False)
    canvas_data: Mapped[dict]      = mapped_column(JSONB, default=lambda: {"nodes": [], "edges": []})
    created_at:  Mapped[DateTime]  = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at:  Mapped[DateTime]  = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())