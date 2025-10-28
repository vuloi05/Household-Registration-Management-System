// src/components/dashboard/StatCard.tsx
import { Card, CardContent, Typography, Box, Button } from '@mui/material';
import { type ReactNode } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color?: string;
  detailLink?: string;
  onDetailClick?: () => void;
}

export default function StatCard({ title, value, icon, color = '#1976d2', detailLink, onDetailClick }: StatCardProps) {
  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: color,
          boxShadow: `0 4px 12px ${color}20`,
          transform: 'translateY(-2px)'
        }
      }}
    >
      <CardContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: detailLink ? 2 : 0 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              color="text.secondary" 
              variant="body2"
              sx={{ 
                fontWeight: 500,
                mb: 1,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.75rem'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: 'text.primary',
                mb: 0.5
              }}
            >
              {value}
            </Typography>
          </Box>
          <Box 
            sx={{ 
              bgcolor: `${color}15`,
              color: color,
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
        
        {detailLink && (
          <Box sx={{ mt: 'auto' }}>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
              onClick={onDetailClick}
              sx={{
                color: color,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.875rem',
                px: 0,
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline'
                }
              }}
            >
              Xem chi tiết
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}