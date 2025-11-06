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
        const successMsg =
          type === 'wrong'
            ? 'Đã ghi nhận. Hệ thống sẽ học ngầm để cải thiện các trả lời sau.'
            : 'Gửi phản hồi thành công!';
        enqueueSnackbar(successMsg, { variant: 'success' });
        // Không cập nhật câu trả lời hiện tại khi người dùng đánh giá sai.
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

