import { createContext, useContext } from 'react';

export type AgentAction = {
  type: string;
  target: string;
  params?: Record<string, any>;
  statusId?: string;
};

export interface AgentContextValue {
  pushAgentAction: (action: AgentAction) => void;
}

export const AgentContext = createContext<AgentContextValue>({ pushAgentAction: () => {} });
export const useAgent = () => useContext(AgentContext);


export type MessageStatus = 'pending' | 'success' | 'error' | 'info';
export type MessageVariant = 'default' | 'status';

export interface Message {
  id?: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp?: string;
  variant?: MessageVariant;
  status?: MessageStatus;
}

export interface ChatbotProps {
  apiUrl?: string;
}

