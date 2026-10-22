from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas import (
    AgentCreate,
    AgentOut,
    AgentDetailOut,
    AgentStatusUpdate,
    ActivityOut,
    AgentSummaryOut,
    StatsOut,
)
from backend.app.services import agent_service, ai_service

router = APIRouter(prefix="/agents", tags=["Agents"])


@router.get("/stats", response_model=StatsOut)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Return counts of total, active, inactive, and error agents along with recent activities."""
    return agent_service.get_stats(db)


@router.post("", response_model=AgentOut, status_code=status.HTTP_201_CREATED)
def register_agent(agent_in: AgentCreate, db: Session = Depends(get_db)):
    """Register a new agent with name and description."""
    return agent_service.create_agent(db, agent_in)


@router.get("", response_model=List[AgentOut])
def list_agents(
    search: Optional[str] = Query(None, description="Search by name or description"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (active, inactive, error)"),
    db: Session = Depends(get_db)
):
    """List agents with optional search and status filtering."""
    if status_filter and status_filter.lower() not in ["active", "inactive", "error"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status filter '{status_filter}'. Allowed: active, inactive, error"
        )
    return agent_service.get_agents(db, search=search, status=status_filter)


@router.get("/{agent_id}", response_model=AgentDetailOut)
def get_agent_details(agent_id: int, db: Session = Depends(get_db)):
    """Get single agent details including activity log."""
    agent = agent_service.get_agent_by_id(db, agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID {agent_id} not found."
        )
    return agent


@router.patch("/{agent_id}/status", response_model=AgentOut)
def update_agent_status(
    agent_id: int,
    status_update: AgentStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update an agent's status to active, inactive, or error."""
    agent = agent_service.update_agent_status(db, agent_id, status_update.status)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID {agent_id} not found."
        )
    return agent


@router.delete("/{agent_id}", status_code=status.HTTP_200_OK)
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    """Delete an agent and its associated activities."""
    success = agent_service.delete_agent(db, agent_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID {agent_id} not found."
        )
    return {"message": f"Agent {agent_id} deleted successfully", "id": agent_id}


@router.get("/{agent_id}/activity", response_model=List[ActivityOut])
def get_agent_activity(agent_id: int, db: Session = Depends(get_db)):
    """Retrieve actual recorded activities for an agent."""
    agent = agent_service.get_agent_by_id(db, agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID {agent_id} not found."
        )
    return agent_service.get_agent_activities(db, agent_id)


@router.get("/{agent_id}/summary", response_model=AgentSummaryOut)
def get_agent_health_summary(agent_id: int, db: Session = Depends(get_db)):
    """Generate an AI health summary for the agent using OpenAI (or rule-based fallback)."""
    agent = agent_service.get_agent_by_id(db, agent_id)
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent with ID {agent_id} not found."
        )

    activities = agent_service.get_agent_activities(db, agent_id, limit=5)
    summary_data = ai_service.generate_agent_health_summary(agent, activities)

    # Record the summary generation as an activity event
    agent_service.log_activity(
        db,
        agent_id=agent.id,
        event_type="AI_SUMMARY",
        description=f"Generated health summary via {summary_data['source']} ({summary_data['model']})."
    )

    return summary_data
