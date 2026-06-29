from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID
from typing import Any

class BoardCreate(BaseModel):
    name: str

class BoardRename(BaseModel):
    name: str

class CanvasSave(BaseModel):
    nodes: list[Any]
    edges: list[Any]

class BoardOut(BaseModel):
    id: UUID
    name: str
    created_at: datetime
    updated_at: datetime
    canvas_data: dict = Field(default_factory=lambda: {"nodes": [], "edges": []})

    model_config = {"from_attributes": True}

class BoardDetailOut(BoardOut):
    pass