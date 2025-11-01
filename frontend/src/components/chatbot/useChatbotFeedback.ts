import { useState } from 'react';
import { useSnackbar } from 'notistack';
import type { Message } from './types';

interface UseChatbotFeedbackParams {
  finalApiUrl: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function useChatbotFeedback({
  finalApiUrl,
  messages,
  setMessages,
}: UseChatbotFeedbackParams) {
  const { enqueueSnackbar } = useSnackbar();
  const [feedbackSending, setFeedbackSending] = useState(false);

  const sendFeedback = async (
    type: 'confirm' | 'wrong' | 'correct',
    idx: number,
    answerOverride?: string
  ) => {
    const botMsg = messages[idx];
    if (!botMsg || !botMsg.text) return;
    const questionIdx = (() => {
      for (let i = idx - 1; i >= 0; --i) if (messages[i].sender === 'user') return i;
      return -1;
    })();
    if (questionIdx < 0) return;
    const question = messages[questionIdx]?.text || '';
    setFeedbackSending(true);
    try {
      const payload = {
        question,
        answer: answerOverride !== undefined ? answerOverride : botMsg.text,
        feedback_type: type,
      };
      const resp = await fetch(`${finalApiUrl}/qa-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok) {
        enqueueSnackbar('Gửi phản hồi thành công!', { variant: 'success' });
        if (type === 'wrong' && data?.new_answer) {
          // cập nhật lại tin nhắn bot hiện tại bằng đáp án mới
          setMessages((prev) => {
            const arr = [...prev];
            if (arr[idx] && arr[idx].sender === 'bot') {
              arr[idx] = {
                ...arr[idx],
                text: String(data.new_answer),
                timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              };
            }
            return arr;
          });
        }
      } else {
        enqueueSnackbar('Gửi phản hồi thất bại.', { variant: 'error' });
      }
    } catch {
      enqueueSnackbar('Có lỗi khi gửi feedback!', { variant: 'error' });
    } finally {
      setFeedbackSending(false);
    }
  };

  return {
    feedbackSending,
    sendFeedback,
  };
}

