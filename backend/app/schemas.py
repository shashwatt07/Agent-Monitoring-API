from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field, ConfigDict, field_validator


AgentStatus = Literal["active", "inactive", "error"]


class AgentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Agent display name")
    description: Optional[str] = Field(None, max_length=500, description="Short description of the agent's role")

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("Agent name cannot be empty or only whitespace")
        return trimmed


class AgentCreate(AgentBase):
    pass


class AgentStatusUpdate(BaseModel):
    status: AgentStatus = Field(..., description="Target status: active, inactive, or error")


class ActivityOut(BaseModel):
    id: int
    agent_id: int
    event_type: str
    description: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class AgentOut(AgentBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AgentDetailOut(AgentOut):
    activities: List[ActivityOut] = []


class AgentSummaryOut(BaseModel):
    agent_id: int
    agent_name: str
    status: str
    summary: str
    suggested_action: str
    source: Literal["openai", "fallback"]
    model: str
    generated_at: datetime


class HealthOut(BaseModel):
    status: str
    database: str
    database_type: str
    timestamp: datetime
    error: Optional[str] = None


class StatsOut(BaseModel):
    total: int
    active: int
    inactive: int
    error: int
    recent_activities: List[ActivityOut] = []
