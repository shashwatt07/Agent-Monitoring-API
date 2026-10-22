export type AgentStatus = 'active' | 'inactive' | 'error';

export interface Activity {
  id: number;
  agent_id: number;
  event_type: string;
  description: string;
  timestamp: string;
}

export interface Agent {
  id: number;
  name: string;
  description: string | null;
  status: AgentStatus;
  created_at: string;
  updated_at: string;
}

export interface AgentDetail extends Agent {
  activities: Activity[];
}

export interface AgentSummary {
  agent_id: number;
  agent_name: string;
  status: AgentStatus;
  summary: string;
  suggested_action: string;
  source: 'openai' | 'fallback';
  model: string;
  generated_at: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'offline';
  database: 'connected' | 'disconnected';
  database_type: string;
  timestamp: string;
  error?: string | null;
}

export interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  error: number;
  recent_activities: Activity[];
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
