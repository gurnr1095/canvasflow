from pydantic import BaseModel
from datetime import datetime
from uuid import UUID
from typing import Any

class BoardCreate(BaseModel):
    name: str

class CanvasSave(BaseModel):
    nodes: list[Any]
    edges: list[Any]

class BoardOut(BaseModel):
    id: UUID
    name: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

class BoardDetailOut(BoardOut):
    canvas_data: dict