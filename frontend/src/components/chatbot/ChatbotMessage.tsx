import { Box, Paper, Typography, IconButton, CircularProgress } from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import type { Message } from './types';
import { renderMarkdown } from './chatbotUtils';

interface ChatbotMessageProps {
  msg: Message;
  index: number;
  messages: Message[];
  feedbackSending: boolean;
  onFeedback: (type: 'confirm' | 'wrong', index: number) => void;
}

export function ChatbotMessage({
  msg,
  index,
  messages,
  feedbackSending,
  onFeedback,
}: ChatbotMessageProps) {
  const isStatusMessage = msg.variant === 'status';

  const renderStatusIcon = () => {
    if (msg.status === 'pending') {
      return <CircularProgress size={14} thickness={6} sx={{ color: 'text.secondary' }} />;
    }
    if (msg.status === 'success') {
      return <CheckCircleIcon fontSize="small" sx={{ color: 'success.main' }} />;
    }
    if (msg.status === 'error') {
      return <ErrorOutlineIcon fontSize="small" sx={{ color: 'error.main' }} />;
    }
    return null;
  };

  return (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: isStatusMessage ? 1 : 1.25,
          maxWidth: { xs: '66%', sm: '72%', md: '78%' },
          bgcolor: isStatusMessage
            ? alpha('#000', 0.02)
            : msg.sender === 'user'
              ? 'transparent'
              : 'white',
          color: isStatusMessage
            ? 'text.secondary'
            : msg.sender === 'user'
              ? 'white'
              : 'text.primary',
          borderRadius: isStatusMessage ? 2 : 2.5,
          border: (theme) => {
            if (isStatusMessage) return `1px dashed ${alpha(theme.palette.primary.main, 0.25)}`;
            return msg.sender === 'user'
              ? `1px solid rgba(255, 255, 255, 0.15)`
              : `1px solid rgba(0, 0, 0, 0.06)`;
          },
          backgroundImage: (theme) => {
            if (isStatusMessage) return 'none';
            return msg.sender === 'user'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)}, ${alpha('#b31217', 0.92)})`
              : 'none';
          },
          boxShadow: isStatusMessage
            ? 'none'
            : msg.sender === 'user'
              ? `0 6px 14px rgba(179, 18, 23, 0.28)`
              : `0 2px 10px rgba(0, 0, 0, 0.06)`,
        }}
      >
        {isStatusMessage ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {renderStatusIcon()}
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'normal',
                fontSize: '0.8rem',
                color: msg.status === 'error' ? 'error.main' : 'text.secondary',
              }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
            />
          </Box>
        ) : (
          <Typography
            variant="body2"
            component="div"
            sx={{ whiteSpace: 'normal' }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
          />
        )}
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
        {msg.sender === 'bot' &&
          !isStatusMessage &&
          (() => {
            // Tìm tin nhắn user gần nhất trước tin nhắn bot này (bỏ qua status messages)
            for (let i = index - 1; i >= 0; i--) {
              if (messages[i].sender === 'user') return true;
              if (messages[i].sender === 'bot' && messages[i].variant !== 'status') break;
            }
            return false;
          })() && (
          <Box sx={{ mt: 1, display: 'flex', gap: 0.5 }}>
            <IconButton
              disabled={feedbackSending}
              onClick={() => onFeedback('confirm', index)}
              sx={{
                width: 24,
                height: 24,
                padding: 0,
                border: 'none',
                color: 'rgba(0, 0, 0, 0.6)',
                backgroundColor: 'transparent',
                '&:hover': {
                  color: 'rgba(0, 0, 0, 0.75)',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                '&:disabled': {
                  color: 'rgba(0, 0, 0, 0.26)',
                },
              }}
            >
              <ThumbUpIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <IconButton
              disabled={feedbackSending}
              onClick={() => onFeedback('wrong', index)}
              sx={{
                width: 24,
                height: 24,
                padding: 0,
                border: 'none',
                color: 'rgba(0, 0, 0, 0.6)',
                backgroundColor: 'transparent',
                '&:hover': {
                  color: 'rgba(0, 0, 0, 0.75)',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
                '&:disabled': {
                  color: 'rgba(0, 0, 0, 0.26)',
                },
              }}
            >
              <ThumbDownIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

