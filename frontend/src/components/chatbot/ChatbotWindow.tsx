import React from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  CircularProgress,
  Slide,
} from '@mui/material';
import { Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';
import { keyframes } from '@mui/system';
import { alpha } from '@mui/material/styles';
import type { Message } from './types';
import { ChatbotMessage } from './ChatbotMessage';

interface ChatbotWindowProps {
  isOpen: boolean;
  messages: Message[];
  input: string;
  isLoading: boolean;
  feedbackSending: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onFeedback: (type: 'confirm' | 'wrong', index: number) => void;
}

const subtlePulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(244,67,54,0.22); }
  70% { box-shadow: 0 0 0 10px rgba(244,67,54,0); }
  100% { box-shadow: 0 0 0 0 rgba(244,67,54,0); }
`;

export function ChatbotWindow({
  isOpen,
  messages,
  input,
  isLoading,
  feedbackSending,
  inputRef,
  messagesEndRef,
  onClose,
  onInputChange,
  onSendMessage,
  onFeedback,
}: ChatbotWindowProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
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
          zIndex: 1400, // Higher than MUI Drawer (1200) to appear above sidebar
          borderRadius: 3,
          overflow: 'hidden',
          background: (theme) =>
            `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.86)}, ${alpha(
              theme.palette.background.paper,
              0.92
            )})`,
          border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          boxShadow: (theme) =>
            `0 8px 30px ${alpha(theme.palette.common.black, 0.25)}, inset 0 0 0 1px ${alpha(
              theme.palette.common.white,
              0.04
            )}`,
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
            backgroundImage: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha('#8e0e0e', 0.9)})`,
            borderBottom: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
            boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.primary.dark, 0.35)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img
              src="/icon_chatbot.png"
              alt="Chatbot"
              style={{
                width: '24px',
                height: '24px',
                objectFit: 'contain',
              }}
            />
            <Typography variant="subtitle1" fontWeight="bold">
              Trợ lý ảo
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
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
            <ChatbotMessage
              key={index}
              msg={msg}
              index={index}
              messages={messages}
              feedbackSending={feedbackSending}
              onFeedback={onFeedback}
            />
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
            onChange={(e) => onInputChange(e.target.value)}
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
          <IconButton color="primary" onClick={onSendMessage} disabled={isLoading || !input.trim()}>
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Slide>
  );
}

