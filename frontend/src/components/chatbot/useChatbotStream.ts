import type { AgentAction, Message } from './types';

interface UseChatbotStreamParams {
  finalApiUrl: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  handleAgentActions: (actions: AgentAction[] | undefined) => void;
}

export function useChatbotStream({
  finalApiUrl,
  setMessages,
  setIsLoading,
  handleAgentActions,
}: UseChatbotStreamParams) {
  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // (A) ENABLE STREAM MODE:
      const resp = await fetch(`${finalApiUrl}/chat?stream=true`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text, context: '' }),
      });
      if (resp.status === 200 && resp.headers.get('content-type')?.includes('text/event-stream')) {
        // (A1) Streaming mode
        const reader = resp.body!.getReader();
        let allResult = '';
        let agentActions: AgentAction[] | undefined;
        setMessages((prev) => [...prev, { text: '', sender: 'bot' }]);
        let decoder = new TextDecoder();
        let finished = false;
        let receivedAny = false;
        while (!finished) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          // tách các event stream
          chunk.split('\n\n').forEach((part) => {
            if (part.startsWith('data: ')) {
              let content = part.replace('data: ', '');
              if (content === '[END] ') finished = true;
              else if (content.trim().startsWith('{') && content.includes('"actions"')) {
                try {
                  const parsed = JSON.parse(content);
                  if (parsed && Array.isArray(parsed.actions)) {
                    agentActions = parsed.actions;
                  }
                } catch (e) {
                  // Ignore parse errors
                }
              } else {
                allResult += content;
                if (content.trim()) receivedAny = true;
                setMessages((prev) => {
                  // cập nhật tin nhắn cuối (bot)
                  const newArr = [...prev];
                  let contentNow = allResult;
                  if (newArr.length && newArr[newArr.length - 1].sender === 'bot') {
                    newArr[newArr.length - 1] = {
                      ...newArr[newArr.length - 1],
                      text: contentNow,
                      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                    };
                  }
                  return newArr;
                });
              }
            } else if (part.startsWith('agent_actions: ')) {
              try {
                agentActions = JSON.parse(part.replace('agent_actions: ', ''));
              } catch (e) {
                // Ignore parse errors
              }
            }
          });
        }
        setIsLoading(false);
        if (!receivedAny) {
          // Không có nội dung văn bản -> loại bỏ placeholder bot message
          setMessages((prev) => {
            const arr = [...prev];
            if (arr.length && arr[arr.length - 1].sender === 'bot' && !arr[arr.length - 1].text) {
              arr.pop();
            }
            return arr;
          });
        }
        // Xử lý agent actions cuối
        if (agentActions && Array.isArray(agentActions)) handleAgentActions(agentActions);
      } else {
        // (A2) Fallback về JSON mode cũ nếu backend không hỗ trợ streaming
        const data = await resp.json();
        if (data.actions && Array.isArray(data.actions)) handleAgentActions(data.actions);
        if (data.response) {
          const botMessage: Message = {
            text: data.response,
            sender: 'bot',
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, botMessage]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        text: 'Xin lỗi, tôi không thể kết nối với AI server. Vui lòng thử lại sau.',
        sender: 'bot',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage };
}

