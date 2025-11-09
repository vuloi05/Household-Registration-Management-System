import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';
import { createPaymentRequest, checkPaymentStatus } from '../api/vietqrApi';
import { type KhoanThu } from '../api/khoanThuApi';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PaymentModalProps {
  visible: boolean;
  khoanThu: KhoanThu | null;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

// Không cần hardcode - backend sẽ tự lấy từ config

const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  khoanThu,
  onClose,
  onPaymentSuccess,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'error'>('pending');
  const [countdown, setCountdown] = useState(300); // 5 phút
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible && khoanThu) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(1, { duration: 300 });
      initializePayment();
    } else {
      scale.value = withSpring(0, { damping: 15, stiffness: 150 });
      opacity.value = withTiming(0, { duration: 200 });
      cleanup();
    }
  }, [visible, khoanThu]);

  // Countdown timer
  useEffect(() => {
    if (visible && paymentStatus === 'pending' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handlePaymentExpired();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [visible, paymentStatus, countdown]);

  const initializePayment = async () => {
    if (!khoanThu) return;

    try {
      setLoading(true);
      setPaymentStatus('pending');
      setCountdown(300);

      // Tính số tiền (giả sử mỗi nhân khẩu)
      const amount = khoanThu.soTienTrenMotNhanKhau || 0;
      if (amount <= 0) {
        Alert.alert('Lỗi', 'Khoản thu này chưa có số tiền cụ thể.');
        onClose();
        return;
      }

      // Tạo payment request
      // Không truyền accountNo và accountName - backend sẽ tự lấy từ config
      const paymentData = await createPaymentRequest(
        khoanThu.id,
        amount,
        undefined, // accountNo - backend sẽ dùng từ config
        undefined, // accountName - backend sẽ dùng từ config
        `Thanh toan: ${khoanThu.tenKhoanThu}`
      );

      // QR code data: backend có thể trả về:
      // - qrCodeString: string để tạo QR code (ưu tiên)
      // - qrCodeUrl: URL của QR code image
      // - qrDataURL: data URL của QR code image
      // Nếu không có, sử dụng paymentId làm fallback
      const qrData = paymentData.qrCodeString || paymentData.qrCodeUrl || paymentData.qrDataURL || paymentData.paymentId;
      setQrCodeData(qrData);
      setPaymentId(paymentData.paymentId);

      // Bắt đầu polling để kiểm tra trạng thái thanh toán
      startPolling(paymentData.paymentId);
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      setPaymentStatus('error');
      Alert.alert('Lỗi', 'Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (id: string) => {
    // Dọn dẹp interval cũ nếu có
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Polling mỗi 3 giây
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(id);
        
        if (status.status === 'paid') {
          setPaymentStatus('paid');
          stopPolling();
          Alert.alert(
            'Thanh toán thành công!',
            `Đã thanh toán ${formatCurrency(status.amount)} cho khoản thu "${khoanThu?.tenKhoanThu}"`,
            [
              {
                text: 'OK',
                onPress: () => {
                  onPaymentSuccess?.();
                  onClose();
                },
              },
            ]
          );
        } else if (status.status === 'expired' || status.status === 'cancelled') {
          setPaymentStatus('error');
          stopPolling();
          Alert.alert('Thông báo', 'Phiên thanh toán đã hết hạn hoặc bị hủy.');
        }
      } catch (error) {
        console.error('Polling error:', error);
        // Không dừng polling nếu có lỗi, có thể là lỗi tạm thời
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const cleanup = () => {
    stopPolling();
    setQrCodeData(null);
    setPaymentId(null);
    setPaymentStatus('pending');
    setCountdown(300);
  };

  const handlePaymentExpired = () => {
    stopPolling();
    setPaymentStatus('error');
    Alert.alert('Thông báo', 'Phiên thanh toán đã hết hạn. Vui lòng thử lại.');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  if (!khoanThu) return null;

  const amount = khoanThu.soTienTrenMotNhanKhau || 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        
        <Animated.View style={[styles.modalContent, animatedModalStyle]}>
          <View style={styles.modalGradient}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderTitle}>Thanh toán</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.modalBody}>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#1976D2" />
                  <Text style={styles.loadingText}>Đang tạo mã QR...</Text>
                </View>
              ) : paymentStatus === 'error' ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>
                    Có lỗi xảy ra. Vui lòng thử lại.
                  </Text>
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={initializePayment}
                  >
                    <Text style={styles.retryButtonText}>Thử lại</Text>
                  </TouchableOpacity>
                </View>
              ) : qrCodeData ? (
                <>
                  <Text style={styles.paymentInfo}>
                    {khoanThu.tenKhoanThu}
                  </Text>
                  <Text style={styles.paymentAmount}>
                    {formatCurrency(amount)}
                  </Text>
                  
                  <View style={styles.qrContainer}>
                    {qrCodeData && (
                      // Nếu là URL image, hiển thị image. Nếu là string, tạo QR code
                      qrCodeData.startsWith('http') ? (
                        <Image
                          source={{ uri: qrCodeData }}
                          style={{ width: SCREEN_WIDTH - 120, height: SCREEN_WIDTH - 120 }}
                          resizeMode="contain"
                        />
                      ) : (
                        <QRCode
                          value={qrCodeData}
                          size={SCREEN_WIDTH - 120}
                          backgroundColor="white"
                          color="black"
                        />
                      )
                    )}
                  </View>

                  <Text style={styles.instructionText}>
                    Quét mã QR bằng ứng dụng ngân hàng để thanh toán
                  </Text>

                  {paymentStatus === 'pending' && (
                    <View style={styles.countdownContainer}>
                      <Text style={styles.countdownText}>
                        Thời gian còn lại: {formatTime(countdown)}
                      </Text>
                    </View>
                  )}

                  {paymentStatus === 'paid' && (
                    <View style={styles.successContainer}>
                      <Text style={styles.successText}>✓ Thanh toán thành công!</Text>
                    </View>
                  )}
                </>
              ) : null}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 25,
  },
  modalGradient: {
    width: '100%',
    minHeight: 400,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    padding: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#424242',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 300,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentInfo: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
    textAlign: 'center',
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1976D2',
    marginBottom: 24,
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  countdownContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    borderRadius: 8,
  },
  countdownText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '600',
  },
  successContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
  },
  successText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default PaymentModal;

