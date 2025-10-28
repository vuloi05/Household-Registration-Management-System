import React, { useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
}

export default function QRScannerModal({ open, onClose, onScanSuccess }: QRScannerModalProps) {
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;

    if (open) {
      // Đợi một chút để đảm bảo DOM element đã được render
      const timer = setTimeout(() => {
        const element = document.getElementById("qr-reader-modal");
        if (!element) {
          console.error("QR reader element not found");
          return;
        }

        html5QrCode = new Html5Qrcode("qr-reader-modal");

        html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: 250
          },
          (decodedText) => {
            onScanSuccess(decodedText);
            onClose();
            html5QrCode?.stop();
          },
          (error) => {
            console.error("QR Code scan error:", error);
          })
          .catch(err => {
            console.error("Không quét được QR từ hình ảnh:", err);
          })
          .finally(() => {
            html5QrCode?.clear();
          });
      }, 100);

      return () => {
        clearTimeout(timer);
        html5QrCode?.stop().catch(() => {});
      };
    }

    return () => {
      html5QrCode?.stop().catch(() => {});
    };
  }, [open, onClose, onScanSuccess]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" component="div">
          Quét CCCD
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Đưa camera vào mã QR trên CCCD để quét
          </Typography>
          <Box 
            id="qr-reader-modal" 
            sx={{ 
              width: '100%', 
              maxWidth: 400, 
              mx: 'auto',
              borderRadius: 1,
              overflow: 'hidden'
            }} 
          />
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
