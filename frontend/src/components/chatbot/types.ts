import { createContext, useContext } from 'react';

export type AgentAction = {
  type: string;
  target: string;
  params?: Record<string, any>;
};

export interface AgentContextValue {
  pushAgentAction: (action: AgentAction) => void;
}

export const AgentContext = createContext<AgentContextValue>({ pushAgentAction: () => {} });
export const useAgent = () => useContext(AgentContext);


export interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp?: string;
}

export interface ChatbotProps {
  apiUrl?: string;
}

