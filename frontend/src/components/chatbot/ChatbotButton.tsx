import React from 'react';
import { Box, IconButton } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface ChatbotButtonProps {
  position: { x: number; y: number };
  isDragging: boolean;
  hasDragged: boolean;
  hasDraggedRef: React.MutableRefObject<boolean>;
  buttonRef:
    | React.RefObject<HTMLDivElement>
    | React.MutableRefObject<HTMLDivElement | null>;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onButtonClick: (e: React.MouseEvent) => void;
}

export function ChatbotButton({
  position,
  isDragging,
  hasDragged,
  hasDraggedRef,
  buttonRef,
  onMouseDown,
  onButtonClick,
}: ChatbotButtonProps) {
  const safeWindowWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const safeWindowHeight = typeof window !== 'undefined' ? window.innerHeight : 720;
  const currentPosition =
    position.x >= 0 && position.y >= 0 ? position : { x: safeWindowWidth - 92, y: safeWindowHeight - 92 };

  return (
    <Box
      ref={buttonRef}
      onMouseDown={onMouseDown}
      onClick={onButtonClick}
      sx={{
        position: 'fixed',
        left: `${currentPosition.x}px`,
        top: `${currentPosition.y}px`,
        zIndex: 1400, // Higher than MUI Drawer (1200) to appear above sidebar
        cursor: isDragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
    >
      <IconButton
        onClick={(e) => {
          e.stopPropagation();
          if (!hasDragged && !isDragging && !hasDraggedRef.current) {
            onButtonClick(e);
          }
        }}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          width: { xs: 48, sm: 64, md: 72 },
          height: { xs: 48, sm: 64, md: 72 },
          '&:hover': {
            bgcolor: 'primary.dark',
            transform: isDragging ? 'none' : 'translateY(-1px) scale(1.04)',
            boxShadow: (theme) => `0 8px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
          },
          transition: isDragging ? 'none' : 'transform .2s ease, box-shadow .2s ease',
          boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
          border: (theme) => `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
          backdropFilter: 'blur(4px)',
          p: 0.5,
          pointerEvents: 'auto',
        }}
      >
        <img
          src="/icon_chatbot.png"
          alt="Chatbot"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
          }}
        />
      </IconButton>
    </Box>
  );
}

