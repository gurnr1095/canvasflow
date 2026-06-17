from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Board
from app.schemas import BoardCreate, CanvasSave, BoardOut, BoardDetailOut
from app.auth import get_current_user_id
from fastapi import Request
from sqlalchemy import select, func

print("BOARDS FILE:", __file__)

router = APIRouter(prefix="/boards", tags=["boards"])




@router.get("", response_model=dict)
async def list_boards(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Board)
        .where(Board.user_id == user_id)
        .order_by(Board.updated_at.desc())
    )
    boards = result.scalars().all()

    return {
        "boards": [BoardOut.model_validate(b) for b in boards]
    }



@router.post("", response_model=BoardDetailOut)
async def create_board(
    body: BoardCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    # Space check for board name
    if not body.name.strip():
        raise HTTPException(
            status_code=400,
            detail="Board name cannot be empty"
        )
    # Case-insensitive duplicate check
    existing = await db.execute(
        select(Board).where(
            Board.user_id == user_id,
            func.lower(Board.name) == body.name.strip().lower()
        )
    )

    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail="A board with this name already exists"
        )

    board = Board(
        user_id=user_id,
        name=body.name.strip()
    )

    db.add(board)
    await db.commit()
    await db.refresh(board)

    return BoardDetailOut.model_validate(board)


@router.get("/{board_id}", response_model=BoardDetailOut)
async def get_board(
    board_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    print("LIST_BOARDS ROUTE HIT")
    

    board = await db.get(Board, board_id)
    if not board or board.user_id != user_id:
        raise HTTPException(status_code=404, detail="Board not found")
    return BoardDetailOut.model_validate(board)


@router.put("/{board_id}/canvas", response_model=BoardDetailOut)
async def save_canvas(
    board_id: str,
    body: CanvasSave,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    board = await db.get(Board, board_id)
    if not board or board.user_id != user_id:
        raise HTTPException(status_code=404, detail="Board not found")
    board.canvas_data = {"nodes": body.nodes, "edges": body.edges}
    await db.commit()
    await db.refresh(board)
    return BoardDetailOut.model_validate(board)


@router.delete("/{board_id}")
async def delete_board(
    board_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    board = await db.get(Board, board_id)
    if not board or board.user_id != user_id:
        raise HTTPException(status_code=404, detail="Board not found")
    await db.delete(board)
    await db.commit()
    return {"ok": True}