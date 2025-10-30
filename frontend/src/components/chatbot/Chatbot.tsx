import React, { useState, useRef, useEffect, createContext, useContext, useMemo } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Slide,
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as ChatIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import Button from '@mui/material/Button';

export type AgentAction = {
  type: string;
  target: string;
  params?: Record<string, any>;
};

interface AgentContextValue {
  pushAgentAction: (action: AgentAction) => void;
}
export const AgentContext = createContext<AgentContextValue>({ pushAgentAction: () => {} });
export const useAgent = () => useContext(AgentContext);

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp?: string;
}

interface ChatbotProps {
  apiUrl?: string;
}

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
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  // Queue để chuyển action tới các page cụ thể
  const agentActionQueue = useRef<AgentAction[]>([]);
  // Hàm dùng cho context
  const pushAgentAction = (action: AgentAction) => {
    agentActionQueue.current.push(action);
    // Có thể phát sự kiện custom ở đây nếu muốn
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Hàm mapping action agent thành thao tác UI (Có thêm gửi message xác nhận vào chat)
  const handleAgentActions = (actions: AgentAction[] | undefined) => {
    if (!actions || actions.length === 0) return;
    // Helper để thêm message bot nếu chưa có message này ngay trước đó
    const pushBotMessage = (msg: string) => {
      setMessages(prev => {
        if (prev.length > 0 && prev[prev.length-1].text === msg && prev[prev.length-1].sender === 'bot') return prev;
        return [...prev, { text: msg, sender: 'bot', timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) }];
      });
    };
    actions.forEach(act => {
      // Điều hướng đề xuất (navigate)
      if (act.type === 'navigate') {
        if (act.target === 'household_list') {
          enqueueSnackbar('Agent: Đang mở trang Quản lý Hộ khẩu', { variant: 'info' });
          navigate('/ho-khau');
          pushBotMessage('✅ Đã mở trang Quản lý Hộ khẩu!');
        } else if (act.target === 'household_detail' && act.params?.householdId) {
          enqueueSnackbar(`Agent: Đang mở chi tiết hộ khẩu ${act.params.householdId}`, { variant: 'info' });
          navigate(`/hokhau/${encodeURIComponent(act.params.householdId)}`);
          pushBotMessage(`✅ Đã mở chi tiết hộ khẩu: ${act.params.householdId}`);
        } else if (act.target === 'person_list') {
          enqueueSnackbar('Agent: Đang mở trang Quản lý Nhân khẩu', { variant: 'info' });
          navigate('/nhan-khau');
          pushBotMessage('✅ Đã mở trang Quản lý Nhân khẩu!');
        } else if (act.target === 'person_detail' && act.params?.personId) {
          enqueueSnackbar(`Agent: Đang mở chi tiết nhân khẩu ${act.params.personId}`, { variant: 'info' });
          navigate('/nhan-khau', { state: { agentAction: act } });
          pushBotMessage(`✅ Đã mở chi tiết nhân khẩu: ${act.params.personId}`);
        } else if (act.target === 'fees') {
          enqueueSnackbar('Agent: Đang mở trang Thu phí', { variant: 'info' });
          navigate('/thu-phi');
          pushBotMessage('✅ Đã mở trang Quản lý Thu phí!');
        } else if (act.target === 'dashboard') {
          enqueueSnackbar('Agent: Đang mở Dashboard', { variant: 'info' });
          navigate('/');
          pushBotMessage('✅ Đã mở bảng thống kê Dashboard!');
        } else if (act.target === 'login') {
          enqueueSnackbar('Agent: Đang mở trang Đăng nhập', { variant: 'info' });
          navigate('/login');
          pushBotMessage('✅ Đã chuyển đến trang Đăng nhập!');
        }
      }
      // Tìm kiếm trên danh sách
      if (act.type === 'search' && act.target === 'person_list' && act.params?.q) {
        navigate('/nhan-khau', { state: { agentAction: act } });
        enqueueSnackbar('Agent: Đang tìm kiếm nhân khẩu: ' + act.params.q, { variant: 'info' });
        pushBotMessage('🔎 Đã tìm kiếm nhân khẩu: ' + act.params.q);
      }
      if (act.type === 'search' && act.target === 'household_list' && act.params?.q) {
        navigate('/ho-khau', { state: { agentAction: act } });
        enqueueSnackbar('Agent: Đang tìm kiếm hộ khẩu: ' + act.params.q, { variant: 'info' });
        pushBotMessage('🔎 Đã tìm kiếm hộ khẩu: ' + act.params.q);
      }
    });
    // Chuyển action vào queue cho page sử dụng nếu cần
    actions.forEach(pushAgentAction);
  };

  // new helper: Typewriter effect append
  function appendTextByStep(setter: (t: string) => void, text: string, ms = 15, callback?: () => void) {
    let i = 0;
    function step() {
      if (i <= text.length) {
        setter(text.slice(0, i))
        i++;
        setTimeout(step, ms)
      } else if (callback) { callback(); }
    }
    step();
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage: Message = {
      text: input,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
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
        const reader = resp.body.getReader();
        let botMsg = '';
        let allResult = '';
        let agentActions: AgentAction[] | undefined;
        setMessages((prev) => [...prev, { text: '', sender: 'bot' }]);
        let msgIdx: number = -1;
        setMessages((prev) => {
          msgIdx = prev.length;
          return prev;
        });
        let decoder = new TextDecoder();
        let finished = false;
        while (!finished) {
          const { value, done } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          // tách các event stream
          chunk.split('\n\n').forEach((part) => {
            if (part.startsWith('data: ')) {
              let content = part.replace('data: ', '');
              if (content === '[END] ') finished = true;
              else {
                allResult += content;
                setMessages((prev) => {
                  // cập nhật tin nhắn cuối (bot)
                  const newArr = [...prev];
                  let contentNow = allResult;
                  if (newArr.length && newArr[newArr.length-1].sender === 'bot') {
                    newArr[newArr.length-1] = { ...newArr[newArr.length-1], text: contentNow, timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })};
                  }
                  return newArr;
                });
              }
            } else if (part.startsWith('agent_actions: ')) {
              try {
                agentActions = JSON.parse(part.replace('agent_actions: ', ''));
              } catch(e) {}
            }
          });
        }
        setIsLoading(false);
        // Xử lý agent actions cuối
        if (agentActions && Array.isArray(agentActions)) handleAgentActions(agentActions);
      } else {
        // (A2) Fallback về JSON mode cũ nếu backend không hỗ trợ streaming
        const data = await resp.json();
        if (data.actions && Array.isArray(data.actions)) handleAgentActions(data.actions);
        const botMessage: Message = {
          text: data.response,
          sender: 'bot',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMessage]);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Basic, safe Markdown renderer for small subset: bold, italics, line breaks
  // Escapes HTML first to avoid XSS and then applies simple Markdown replacements
  const renderMarkdown = (rawText: string): string => {
    const escapeHtml = (unsafe: string) =>
      unsafe
        .replaceAll(/&/g, '&amp;')
        .replaceAll(/</g, '&lt;')
        .replaceAll(/>/g, '&gt;');

    let html = escapeHtml(rawText);
    // Bold: **text**
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* (after bold to avoid conflicts)
    html = html.replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, (_m, p1, p2) => `${p1}<em>${p2}</em>`);
    // Line breaks
    html = html.replace(/\n/g, '<br />');
    return html;
  };

  // ========== BẮT ĐẦU PHẦN THÊM UI & LOGIC FEEDBACK ===========
  // Removed Dialog/Edit related imports as we no longer support manual answer edit
  // import Dialog from '@mui/material/Dialog';
  // import DialogTitle from '@mui/material/DialogTitle';
  // import DialogContent from '@mui/material/DialogContent';
  // import DialogActions from '@mui/material/DialogActions';
  // import Button from '@mui/material/Button';
  // import EditIcon from '@mui/icons-material/Edit';
  const [feedbackSending, setFeedbackSending] = useState(false);

  // Gửi feedback tới backend
  const sendFeedback = async (type: 'confirm'|'wrong'|'correct', idx: number, answerOverride?: string) => {
    const botMsg = messages[idx];
    if (!botMsg || !botMsg.text) return;
    const questionIdx = (() => {
      for(let i=idx-1; i>=0; --i) if(messages[i].sender==='user') return i; return -1;
    })();
    if(questionIdx<0) return;
    const question = messages[questionIdx]?.text||'';
    setFeedbackSending(true);
    try {
      const payload = {
        question,
        answer: (answerOverride!==undefined ? answerOverride : botMsg.text),
        feedback_type: type
      };
      const resp = await fetch(`${finalApiUrl}/qa-feedback`,{
        method:'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await resp.json().catch(()=>({}));
      if (resp.ok) {
        enqueueSnackbar('Gửi phản hồi thành công!', {variant:'success'});
        if (type==='wrong' && data?.new_answer) {
          // cập nhật lại tin nhắn bot hiện tại bằng đáp án mới
          setMessages(prev => {
            const arr = [...prev];
            if (arr[idx] && arr[idx].sender==='bot') {
              arr[idx] = { ...arr[idx], text: String(data.new_answer), timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) };
            }
            return arr;
          });
        }
      } else {
        enqueueSnackbar('Gửi phản hồi thất bại.', {variant:'error'});
      }
    } catch {
      enqueueSnackbar('Có lỗi khi gửi feedback!', {variant:'error'});
    } finally {
      setFeedbackSending(false);
      // removed edit dialog resets
      // setEditIdx(null);
      // setEditAnswer('');
    }
  };

  if (!isOpen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 6, sm: 14, md: 20 },
          right: { xs: 6, sm: 14, md: 20 },
          zIndex: 1000,
        }}
      >
        <IconButton
          onClick={() => setIsOpen(true)}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: { xs: 36, sm: 48, md: 56 },
            height: { xs: 36, sm: 48, md: 56 },
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'translateY(-1px) scale(1.04)',
              boxShadow: (theme) => `0 8px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
            },
            transition: 'transform .2s ease, box-shadow .2s ease',
            boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
            border: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
            backdropFilter: 'blur(4px)',
          }}
        >
          <ChatIcon />
        </IconButton>
      </Box>
    );
  }

  const subtlePulse = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(244,67,54,0.22); }
    70% { box-shadow: 0 0 0 10px rgba(244,67,54,0); }
    100% { box-shadow: 0 0 0 0 rgba(244,67,54,0); }
  `;

  return (
    <AgentContext.Provider value={{ pushAgentAction }}>
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            bottom: { xs: 6, sm: 14, md: 20 },
            right: { xs: 6, sm: 14, md: 20 },
            width: { xs: '72vw', sm: 300, md: 340 },
            height: { xs: '38vh', sm: 380, md: 480 },
            maxWidth: '80vw',
            maxHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            borderRadius: 3,
            overflow: 'hidden',
            background: (theme) => `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.86)}, ${alpha(theme.palette.background.paper, 0.92)})`,
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            boxShadow: (theme) => `0 8px 30px ${alpha(theme.palette.common.black, 0.25)}, inset 0 0 0 1px ${alpha(theme.palette.common.white, 0.04)}`,
            backdropFilter: 'blur(10px)',
            animation: `${subtlePulse} 3s ease-out 1`,
          }}
        >
        {/* Header */}
        <Box
          sx={{
            bgcolor: 'transparent',
            color: 'white',
            p: { xs: 1, sm: 1.25, md: 1.5 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundImage: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha('#8e0e0e', 0.9)})`,
            borderBottom: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
            boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.primary.dark, 0.35)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ChatIcon />
            <Typography variant="subtitle1" fontWeight="bold">
              AI Assistant
            </Typography>
          </Box>
          <IconButton
            onClick={() => setIsOpen(false)}
            size="small"
            sx={{
              color: 'white',
              '&:hover': { transform: 'rotate(90deg) scale(1.05)' },
              transition: 'transform .2s ease',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Messages */}
        <Box
          className="chat-scroll"
          sx={{
            flex: 1,
            overflowY: 'auto',
            p: { xs: 1, sm: 1.25, md: 1.5 },
            bgcolor: (theme) => alpha(theme.palette.common.black, 0.02),
            backgroundImage: 'radial-gradient(transparent 1px, rgba(0,0,0,0.02) 1px)',
            backgroundSize: '8px 8px',
            overscrollBehavior: 'contain',
            // Firefox
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(0,0,0,0.28) transparent',
            // WebKit/Blink
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
              margin: '6px 0',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.32))',
              borderRadius: '999px',
              border: '2px solid transparent',
              backgroundClip: 'padding-box',
            },
            '&:hover::-webkit-scrollbar-thumb': {
              background: 'linear-gradient(180deg, rgba(0,0,0,0.28), rgba(0,0,0,0.44))',
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.15)',
            },
            '&:active::-webkit-scrollbar-thumb, &::-webkit-scrollbar-thumb:active': {
              background: 'linear-gradient(180deg, rgba(0,0,0,0.36), rgba(0,0,0,0.56))',
            },
          }}
        >
          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                mb: 2,
                display: 'flex',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 1.25,
                  maxWidth: { xs: '66%', sm: '72%', md: '78%' },
                  bgcolor: msg.sender === 'user' ? 'transparent' : 'white',
                  color: msg.sender === 'user' ? 'white' : 'text.primary',
                  borderRadius: 2.5,
                  backgroundImage: (theme) => msg.sender === 'user'
                    ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)}, ${alpha('#b31217', 0.92)})`
                    : 'none',
                  border: (theme) => msg.sender === 'user'
                    ? `1px solid ${alpha(theme.palette.common.white, 0.15)}`
                    : `1px solid ${alpha('#000', 0.06)}`,
                  boxShadow: msg.sender === 'user'
                    ? `0 6px 14px ${alpha('#b31217', 0.28)}`
                    : `0 2px 10px ${alpha('#000', 0.06)}`,
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ whiteSpace: 'normal' }}
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                />
                {msg.timestamp && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      opacity: 0.7,
                      fontSize: '0.68rem',
                    }}
                  >
                    {msg.timestamp}
                  </Typography>
                )}
                {/* PHẦN BUTTON FEEDBACK CHỈ CHO BOT MESSAGE */}
                {msg.sender==='bot' && !!messages[index-1] && messages[index-1].sender==='user' && (
                  <Box sx={{ mt: 1, display:'flex', gap:0.5 }}>
                    <Button
                      variant="outlined" color="success" size="small"
                      disabled={feedbackSending}
                      onClick={() => sendFeedback('confirm', index)}
                    >Xác nhận đúng</Button>
                    <Button
                      variant="outlined" color="error" size="small"
                      disabled={feedbackSending}
                      onClick={() => sendFeedback('wrong', index)}
                    >Báo sai</Button>
                    {/* Removed "Sửa đáp án" button */}
                  </Box>
                )}
              </Paper>
            </Box>
          ))}
          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Paper elevation={1} sx={{ p: 1.25, borderRadius: 2 }}>
                <CircularProgress size={16} />
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>
        {/* Removed Dialog sửa đáp án */}
        {/* Input */}
        <Box
          sx={{
            p: { xs: 1, sm: 1.25, md: 1.5 },
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            gap: { xs: 0.5, sm: 1 },
            bgcolor: 'white',
          }}
        >
          <TextField
            inputRef={inputRef}
            fullWidth
            size="small"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 999,
                backgroundColor: alpha('#000', 0.02),
                '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
                '&:hover fieldset': { borderColor: (theme) => alpha(theme.palette.primary.main, 0.4) },
                '&.Mui-focused fieldset': { borderColor: 'primary.main' },
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
        </Paper>
      </Slide>
    </AgentContext.Provider>
  );
}

