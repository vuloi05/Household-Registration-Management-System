import React, { useState, useRef, useEffect } from 'react';
import { AgentContext } from './types';
import type { Message, ChatbotProps } from './types';
import { useChatbotDrag } from './useChatbotDrag';
import { useChatbotActions } from './useChatbotActions';
import { useChatbotStream } from './useChatbotStream';
import { useChatbotFeedback } from './useChatbotFeedback';
import { ChatbotButton } from './ChatbotButton';
import { ChatbotWindow } from './ChatbotWindow';

export default function Chatbot({ apiUrl }: ChatbotProps) {
  // Get API URL from environment variable or prop
  const defaultApiUrl = import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:5000';
  const finalApiUrl = apiUrl || defaultApiUrl;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: 'Xin chào! Tôi là trợ lý AI của hệ thống Quản lý Nhân khẩu. Tôi có thể giúp bạn tìm hiểu về các tính năng của hệ thống. Nhập "giúp" để xem danh sách tính năng!',
      sender: 'bot',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { pushAgentAction, handleAgentActions } = useChatbotActions({ setMessages });
  const { position, isDragging, hasDragged, hasDraggedRef, handleMouseDown } =
    useChatbotDrag(buttonRef);
  const { sendMessage } = useChatbotStream({
    finalApiUrl,
    setMessages,
    setIsLoading,
    handleAgentActions,
  });
  const { feedbackSending, sendFeedback } = useChatbotFeedback({
    finalApiUrl,
    messages,
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Lắng nghe thông điệp từ các trang (ví dụ HoKhauPage) để hiển thị phản hồi bot
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<string>;
      const text = typeof ce.detail === 'string' ? ce.detail : '';
      if (!text) return;
      setMessages((prev) => [
        ...prev,
        {
          text,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    };
    window.addEventListener('agent-bot-message', handler as EventListener);
    return () => window.removeEventListener('agent-bot-message', handler as EventListener);
  }, []);

  const handleSendMessage = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleFeedback = (type: 'confirm' | 'wrong', index: number) => {
    sendFeedback(type, index);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleButtonClickWrapper = (_e: React.MouseEvent) => {
    // Only open if we didn't just drag
    if (!hasDragged && !isDragging && !hasDraggedRef.current) {
      setIsOpen(true);
    }
  };

  return (
    <AgentContext.Provider value={{ pushAgentAction }}>
      {!isOpen && (
        <ChatbotButton
          position={position}
          isDragging={isDragging}
          hasDragged={hasDragged}
          hasDraggedRef={hasDraggedRef}
          buttonRef={buttonRef}
          onMouseDown={handleMouseDown}
          onButtonClick={handleButtonClickWrapper}
        />
      )}
      {isOpen && (
        <ChatbotWindow
          isOpen={isOpen}
          messages={messages}
          input={input}
          isLoading={isLoading}
          feedbackSending={feedbackSending}
          inputRef={inputRef}
          messagesEndRef={messagesEndRef}
          onClose={() => setIsOpen(false)}
          onInputChange={setInput}
          onSendMessage={handleSendMessage}
          onFeedback={handleFeedback}
        />
      )}
    </AgentContext.Provider>
  );
}
