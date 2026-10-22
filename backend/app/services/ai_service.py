import json
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any
from openai import OpenAI, OpenAIError
from backend.app.config import settings
from backend.app.models import Agent, Activity

logger = logging.getLogger(__name__)


def _build_fallback_summary(agent: Agent, activities: List[Activity]) -> Dict[str, Any]:
    """Generate a reliable, factual rule-based summary when OpenAI is unavailable."""
    last_event = activities[0].description if activities else "No recorded activities yet."
    created_str = agent.created_at.strftime("%Y-%m-%d %H:%M UTC")

    if agent.status == "active":
        summary = (
            f"Agent '{agent.name}' (ID: {agent.id}) is actively operational. "
            f"It was registered on {created_str} and has recorded {len(activities)} event(s) "
            f"with no blocking anomalies reported."
        )
        suggested_action = (
            "Monitor ongoing task execution and maintain standard heartbeat oversight."
        )
    elif agent.status == "inactive":
        summary = (
            f"Agent '{agent.name}' (ID: {agent.id}) is currently inactive and dormant. "
            f"Its most recent recorded event was: '{last_event}'."
        )
        suggested_action = (
            "Confirm if the pause was intentional for maintenance, then switch status to 'active' when ready to resume."
        )
    else:  # "error"
        summary = (
            f"Agent '{agent.name}' (ID: {agent.id}) is currently in an ERROR state. "
            f"Immediate attention is recommended. Last recorded event: '{last_event}'."
        )
        suggested_action = (
            "Review connected dependencies and agent execution environment, resolve the underlying issue, and update status."
        )

    return {
        "agent_id": agent.id,
        "agent_name": agent.name,
        "status": agent.status,
        "summary": summary,
        "suggested_action": suggested_action,
        "source": "fallback",
        "model": "rule-based-fallback",
        "generated_at": datetime.now(timezone.utc)
    }


def generate_agent_health_summary(agent: Agent, activities: List[Activity]) -> Dict[str, Any]:
    """
    Generate an AI-powered health summary using OpenAI if available,
    or smoothly fall back to a factual rule-based summary if OpenAI key is missing,
    quota is exhausted, or an API error occurs.
    """
    api_key = settings.OPENAI_API_KEY.strip()

    # If no key or placeholder key provided, use fallback immediately
    if not api_key or api_key.startswith("your_") or api_key == "placeholder":
        return _build_fallback_summary(agent, activities)

    # Prepare recent activity bullets
    activity_summary = "\n".join(
        [f"- [{a.timestamp.strftime('%Y-%m-%d %H:%M')}] ({a.event_type}): {a.description}" for a in activities[:5]]
    ) or "None recorded."

    prompt_content = f"""
Agent Information:
- ID: {agent.id}
- Name: {agent.name}
- Current Status: {agent.status}
- Description: {agent.description or 'No description provided'}
- Created: {agent.created_at.strftime('%Y-%m-%d %H:%M UTC')}

Recent Activity History:
{activity_summary}

Task:
Provide an objective, factual assessment of this agent's health based strictly on the status and activities provided above.
Return a valid JSON object with exactly two string fields:
"summary": A 2-sentence explanation of current status and operational health.
"suggested_action": A clear 1-sentence next step for the system operator.
"""

    try:
        client = OpenAI(api_key=api_key, timeout=10.0)
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are an AI observability assistant for an Agent Monitoring Dashboard. "
                        "You strictly evaluate only real agent facts and activities provided. "
                        "Never fabricate metrics, uptimes, or hypothetical error counts. "
                        "Always return valid JSON format."
                    )
                },
                {"role": "user", "content": prompt_content}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=200,
        )

        content = response.choices[0].message.content
        data = json.loads(content)

        return {
            "agent_id": agent.id,
            "agent_name": agent.name,
            "status": agent.status,
            "summary": data.get("summary", "Status assessment completed."),
            "suggested_action": data.get("suggested_action", "Maintain regular monitoring."),
            "source": "openai",
            "model": settings.OPENAI_MODEL,
            "generated_at": datetime.now(timezone.utc)
        }

    except OpenAIError as e:
        logger.warning(f"OpenAI API call failed ({type(e).__name__}): {e}. Using rule-based fallback.")
        fallback = _build_fallback_summary(agent, activities)
        # Note the specific OpenAI notice for transparency
        return fallback

    except Exception as e:
        logger.warning(f"Unexpected error during AI summary ({type(e).__name__}): {e}. Using fallback.")
        return _build_fallback_summary(agent, activities)
