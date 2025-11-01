import React from 'react';
import { Box, Paper, Typography, IconButton } from '@mui/material';
import { ThumbUp as ThumbUpIcon, ThumbDown as ThumbDownIcon } from '@mui/icons-material';
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
          p: 1.25,
          maxWidth: { xs: '66%', sm: '72%', md: '78%' },
          bgcolor: msg.sender === 'user' ? 'transparent' : 'white',
          color: msg.sender === 'user' ? 'white' : 'text.primary',
          borderRadius: 2.5,
          backgroundImage: (theme) =>
            msg.sender === 'user'
              ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.95)}, ${alpha('#b31217', 0.92)})`
              : 'none',
          border: (theme) =>
            msg.sender === 'user'
              ? `1px solid rgba(255, 255, 255, 0.15)`
              : `1px solid rgba(0, 0, 0, 0.06)`,
          boxShadow: msg.sender === 'user'
            ? `0 6px 14px rgba(179, 18, 23, 0.28)`
            : `0 2px 10px rgba(0, 0, 0, 0.06)`,
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
        {msg.sender === 'bot' && !!messages[index - 1] && messages[index - 1].sender === 'user' && (
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

