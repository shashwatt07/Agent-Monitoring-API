from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database import get_db
from backend.app.schemas import HealthOut
from backend.app.config import settings

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthOut)
def check_health(db: Session = Depends(get_db)):
    """
    Check API and database connectivity.
    Performs an active database ping (SELECT 1) to accurately report connection state.
    """
    db_type = "postgresql" if "postgres" in settings.DATABASE_URL else "sqlite"
    now = datetime.now(timezone.utc)

    try:
        # Actually verify the connection with a quick query
        db.execute(text("SELECT 1"))
        return HealthOut(
            status="healthy",
            database="connected",
            database_type=db_type,
            timestamp=now,
            error=None
        )
    except Exception as exc:
        return HealthOut(
            status="degraded",
            database="disconnected",
            database_type=db_type,
            timestamp=now,
            error=str(exc)
        )
