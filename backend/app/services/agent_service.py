from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from backend.app.models import Agent, Activity
from backend.app.schemas import AgentCreate


def create_agent(db: Session, agent_in: AgentCreate) -> Agent:
    """Create a new agent and record the initial registration activity."""
    agent = Agent(
        name=agent_in.name,
        description=agent_in.description,
        status="active"
    )
    db.add(agent)
    db.flush()  # assign agent.id

    # Record registration activity
    activity = Activity(
        agent_id=agent.id,
        event_type="REGISTERED",
        description=f"Agent '{agent.name}' registered with initial status 'active'."
    )
    db.add(activity)
    db.commit()
    db.refresh(agent)
    return agent


def get_agents(
    db: Session,
    search: Optional[str] = None,
    status: Optional[str] = None
) -> List[Agent]:
    """Retrieve agents with optional search query and status filter."""
    query = db.query(Agent)

    if status:
        query = query.filter(Agent.status == status.lower().strip())

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Agent.name.ilike(search_term),
                Agent.description.ilike(search_term)
            )
        )

    return query.order_by(desc(Agent.created_at)).all()


def get_agent_by_id(db: Session, agent_id: int) -> Optional[Agent]:
    """Retrieve a single agent by ID."""
    return db.query(Agent).filter(Agent.id == agent_id).first()


def update_agent_status(db: Session, agent_id: int, new_status: str) -> Optional[Agent]:
    """Update agent status and record activity event."""
    agent = get_agent_by_id(db, agent_id)
    if not agent:
        return None

    old_status = agent.status
    normalized_status = new_status.lower().strip()
    agent.status = normalized_status

    activity = Activity(
        agent_id=agent.id,
        event_type="STATUS_CHANGE",
        description=f"Status changed from '{old_status}' to '{normalized_status}'."
    )
    db.add(activity)
    db.commit()
    db.refresh(agent)
    return agent


def delete_agent(db: Session, agent_id: int) -> bool:
    """Delete an agent and associated activities (via cascade)."""
    agent = get_agent_by_id(db, agent_id)
    if not agent:
        return False

    db.delete(agent)
    db.commit()
    return True


def get_agent_activities(db: Session, agent_id: int, limit: int = 50) -> List[Activity]:
    """Retrieve activities for a specific agent ordered by recent first."""
    return (
        db.query(Activity)
        .filter(Activity.agent_id == agent_id)
        .order_by(desc(Activity.timestamp))
        .limit(limit)
        .all()
    )


def get_stats(db: Session) -> dict:
    """Compute overall agent statistics and fetch recent system-wide activities."""
    agents = db.query(Agent).all()
    total = len(agents)
    active = sum(1 for a in agents if a.status == "active")
    inactive = sum(1 for a in agents if a.status == "inactive")
    error = sum(1 for a in agents if a.status == "error")

    recent_activities = (
        db.query(Activity)
        .order_by(desc(Activity.timestamp))
        .limit(10)
        .all()
    )

    return {
        "total": total,
        "active": active,
        "inactive": inactive,
        "error": error,
        "recent_activities": recent_activities
    }


def log_activity(db: Session, agent_id: int, event_type: str, description: str) -> Activity:
    """Helper to record an arbitrary activity event."""
    activity = Activity(
        agent_id=agent_id,
        event_type=event_type,
        description=description
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity
