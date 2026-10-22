import type {
  Agent,
  AgentDetail,
  AgentStatus,
  AgentSummary,
  Activity,
  HealthStatus,
  DashboardStats,
} from '../types/agent';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      let errorMsg = `Request failed with status ${res.status}`;
      try {
        const errorData = await res.json();
        if (errorData.detail) {
          errorMsg = typeof errorData.detail === 'string'
            ? errorData.detail
            : JSON.stringify(errorData.detail);
        }
      } catch {
        // Fallback
      }
      throw new ApiError(errorMsg, res.status);
    }

    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      `Unable to connect to backend at ${BASE_URL}. Ensure the FastAPI server is running.`,
      0
    );
  }
}

export const api = {
  getHealth: async (): Promise<HealthStatus> => {
    try {
      return await request<HealthStatus>('/health');
    } catch {
      return {
        status: 'offline',
        database: 'disconnected',
        database_type: 'unknown',
        timestamp: new Date().toISOString(),
        error: 'Backend is currently unreachable.',
      };
    }
  },

  getStats: (): Promise<DashboardStats> => {
    return request<DashboardStats>('/agents/stats');
  },

  getAgents: (search?: string, status?: string): Promise<Agent[]> => {
    const params = new URLSearchParams();
    if (search && search.trim()) {
      params.append('search', search.trim());
    }
    if (status && status !== 'all') {
      params.append('status', status);
    }
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Agent[]>(`/agents${query}`);
  },

  getAgent: (id: number): Promise<AgentDetail> => {
    return request<AgentDetail>(`/agents/${id}`);
  },

  createAgent: (data: { name: string; description?: string }): Promise<Agent> => {
    return request<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAgentStatus: (id: number, status: AgentStatus): Promise<Agent> => {
    return request<Agent>(`/agents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  deleteAgent: (id: number): Promise<{ message: string; id: number }> => {
    return request<{ message: string; id: number }>(`/agents/${id}`, {
      method: 'DELETE',
    });
  },

  getAgentActivity: (id: number): Promise<Activity[]> => {
    return request<Activity[]>(`/agents/${id}/activity`);
  },

  getAgentSummary: (id: number): Promise<AgentSummary> => {
    return request<AgentSummary>(`/agents/${id}/summary`);
  },
};
