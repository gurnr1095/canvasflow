import os
import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from app.auth import get_current_user_id
from openai import OpenAI

router = APIRouter(prefix="/ai", tags=["ai"])

# --- Pydantic schemas for OpenAI Structured Output ---
class NodePosition(BaseModel):
    x: float
    y: float

class NodeData(BaseModel):
    label: str = Field(description="Short title of the topic or concept")
    description: str = Field(description="A brief 3-5 word description", default="")
    color: str = Field(description="A hex color code representing the node category (e.g., #93C5FD for basics, #FCA5A5 for advanced)", default="#93C5FD")

class CanvasNode(BaseModel):
    id: str = Field(description="A unique alphanumeric string ID for the node")
    type: str = Field(description="Node type: always 'topic'", default="topic")
    position: NodePosition
    data: NodeData

class CanvasEdge(BaseModel):
    id: str = Field(description="A unique alphanumeric string ID for the edge")
    source: str = Field(description="The ID of the source node")
    target: str = Field(description="The ID of the target node")
    animated: bool = Field(description="Whether the edge is animated", default=True)

class CanvasRoadmap(BaseModel):
    nodes: list[CanvasNode] = Field(description="A list of 5 to 8 connected nodes representing the roadmap")
    edges: list[CanvasEdge] = Field(description="A list of edges connecting the nodes sequentially or hierarchically")

class GeneratePromptRequest(BaseModel):
    prompt: str

class ModifyCanvasRequest(BaseModel):
    prompt: str
    context_nodes: list[dict] = []
    context_edges: list[dict] = []

@router.post("/modify")
async def modify_canvas(
    body: ModifyCanvasRequest,
    user_id: str = Depends(get_current_user_id),
):
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenRouter API Key is missing on the server.")

    client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=api_key)

    existing_labels = ", ".join(
        n.get("data", {}).get("label", "node") for n in body.context_nodes
    ) or "none"
    max_x = max((n.get("position", {}).get("x", 0) for n in body.context_nodes), default=300)
    max_y = max((n.get("position", {}).get("y", 0) for n in body.context_nodes), default=100)

    system_instruction = (
        "You are an expert diagram and workflow architect. "
        f"The canvas already contains these nodes: [{existing_labels}]. "
        f"Place new nodes starting at approximately x={max_x + 220}, y={max_y - 100}, flowing downward with 150px spacing. "
        "Based on the user's request, generate ONLY the NEW nodes and edges to ADD to the canvas. "
        "Do not repeat existing nodes. Generate 2 to 5 new nodes that logically extend the diagram."
    )

    try:
        response = client.beta.chat.completions.parse(
            model="openai/gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": body.prompt},
            ],
            response_format=CanvasRoadmap,
            temperature=0.3,
        )
        roadmap = response.choices[0].message.parsed
        return roadmap.model_dump()
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
async def generate_nodes(
    body: GeneratePromptRequest,
    user_id: str = Depends(get_current_user_id),
):
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(status_code=500, detail="OpenRouter API Key is missing on the server.")

    # Initialize OpenAI client with OpenRouter's base URL
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=api_key,
    )

    system_instruction = (
        "You are an expert curriculum designer and knowledge map creator. "
        "Your task is to take a user's prompt and break it down into a highly structured visual roadmap "
        "consisting of interconnected concepts. Generate 5 to 8 nodes that flow logically. "
        "Position the nodes elegantly so they flow downwards (increasing 'y' values by 150px per step, starting at x=300, y=100)."
    )

    try:
        response = client.beta.chat.completions.parse(
            model="openai/gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": body.prompt},
            ],
            response_format=CanvasRoadmap,
            temperature=0.2,
        )

        # Parsed output is strongly typed according to CanvasRoadmap
        roadmap = response.choices[0].message.parsed
        return roadmap.model_dump()

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
