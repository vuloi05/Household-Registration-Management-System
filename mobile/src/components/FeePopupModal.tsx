import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import { type KhoanThu } from '../api/khoanThuApi';
import { createPayment, getPaymentStatus, type PaymentResponse } from '../api/paymentApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface FeePopupModalProps {
  visible: boolean;
  khoanThu: KhoanThu | null;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

const FeePopupModal: React.FC<FeePopupModalProps> = ({
  visible,
  khoanThu,
  onClose,
  onPaymentSuccess,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [showWebView, setShowWebView] = useState(false);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, { duration: 300 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 200 });
      scale.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  const handlePayment = async () => {
    if (!khoanThu || !khoanThu.soTienTrenMotNhanKhau) {
      Alert.alert('Lỗi', 'Không thể lấy thông tin số tiền cần thanh toán');
      return;
    }

    try {
      setIsLoading(true);
      
      // Tạo payment request
      const paymentResponse: PaymentResponse = await createPayment({
        khoanThuId: khoanThu.id,
        amount: khoanThu.soTienTrenMotNhanKhau,
        description: `Thanh toán ${khoanThu.tenKhoanThu}`,
        returnUrl: 'quanlynhankhau://payment-success',
        cancelUrl: 'quanlynhankhau://payment-cancel',
      });

      setPaymentId(paymentResponse.paymentId);
      setPaymentUrl(paymentResponse.checkoutUrl);
      setShowWebView(true);
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert(
        'Lỗi',
        error?.response?.data?.message || error?.message || 'Không thể tạo thanh toán. Vui lòng thử lại.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    
    // Kiểm tra nếu URL là returnUrl hoặc cancelUrl
    if (url.includes('payment-success') || url.includes('payment-cancel')) {
      setShowWebView(false);
      setPaymentUrl(null);
      
      if (url.includes('payment-success')) {
        // Kiểm tra trạng thái payment
        checkPaymentStatus();
      } else {
        Alert.alert('Thông báo', 'Bạn đã hủy thanh toán');
        onClose();
      }
    }
  };

  const checkPaymentStatus = async () => {
    if (!paymentId) return;

    try {
      const status = await getPaymentStatus(paymentId);
      
      if (status.status === 'paid') {
        Alert.alert('Thành công', 'Thanh toán thành công!', [
          {
            text: 'OK',
            onPress: () => {
              onPaymentSuccess?.();
              onClose();
            },
          },
        ]);
      } else {
        // Poll lại sau 2 giây nếu chưa thanh toán
        setTimeout(() => {
          checkPaymentStatus();
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const handleCloseWebView = () => {
    setShowWebView(false);
    setPaymentUrl(null);
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn đóng trang thanh toán?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đóng',
          onPress: () => {
            onClose();
          },
        },
      ]
    );
  };

  if (!khoanThu) return null;

  const isBatBuoc = khoanThu.loaiKhoanThu === 'BAT_BUOC';
  const gradientColors = isBatBuoc
    ? (['#D32F2F', '#B71C1C'] as const)
    : (['#1976D2', '#0D47A1'] as const);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </Pressable>

        <Animated.View style={[styles.modalContent, animatedModalStyle]}>
          <View style={styles.modalGradient}>
            {/* Close button - positioned absolutely to avoid event conflicts */}
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeButton,
                styles.closeButtonAbsolute,
                pressed && styles.closeButtonPressed,
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>

            <Pressable onPress={(e) => e.stopPropagation()}>
              {/* Header section */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Chi tiết thu phí</Text>
              </View>

              {/* Content section - Tên loại thu phí */}
              <View style={styles.modalBody}>
                <Text style={styles.modalFeeName}>{khoanThu.tenKhoanThu}</Text>
                <View
                  style={[
                    styles.modalBadge,
                    {
                      backgroundColor: isBatBuoc
                        ? 'rgba(211, 47, 47, 0.1)'
                        : 'rgba(25, 118, 210, 0.1)',
                      borderColor: isBatBuoc
                        ? 'rgba(211, 47, 47, 0.3)'
                        : 'rgba(25, 118, 210, 0.3)',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalBadgeText,
                      {
                        color: isBatBuoc ? '#D32F2F' : '#1976D2',
                      },
                    ]}
                  >
                    {isBatBuoc ? 'BẮT BUỘC' : 'ĐÓNG GÓP'}
                  </Text>
                </View>
              </View>

              {/* Footer section - Nút Thanh toán */}
              <View style={styles.modalFooter}>
                {khoanThu.soTienTrenMotNhanKhau && (
                  <Text style={styles.amountText}>
                    Số tiền: {khoanThu.soTienTrenMotNhanKhau.toLocaleString('vi-VN')} VNĐ
                  </Text>
                )}
                <TouchableOpacity
                  style={[styles.paymentButton, isLoading && styles.paymentButtonDisabled]}
                  onPress={handlePayment}
                  activeOpacity={0.8}
                  disabled={isLoading || !khoanThu.soTienTrenMotNhanKhau}
                >
                  <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.paymentButtonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                    <Text style={styles.paymentButtonText}>Thanh toán</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </Pressable>
          </View>
        </Animated.View>
      </View>

      {/* WebView Modal for Payment */}
      {showWebView && paymentUrl && (
        <Modal
          visible={showWebView}
          animationType="slide"
          onRequestClose={handleCloseWebView}
        >
          <View style={styles.webViewContainer}>
            <View style={styles.webViewHeader}>
              <Text style={styles.webViewHeaderText}>Thanh toán PayOS</Text>
              <TouchableOpacity onPress={handleCloseWebView} style={styles.webViewCloseButton}>
                <Text style={styles.webViewCloseButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <WebView
              source={{ uri: paymentUrl }}
              onNavigationStateChange={handleWebViewNavigationStateChange}
              style={styles.webView}
            />
          </View>
        </Modal>
      )}
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
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 25,
  },
  modalGradient: {
    width: '100%',
    minHeight: 280,
    borderRadius: 24,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    padding: 20,
    paddingBottom: 16,
    paddingRight: 60, // Add padding for the close button
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
  closeButtonAbsolute: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1000,
    elevation: 1000,
  },
  closeButtonPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    opacity: 0.8,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#424242',
    fontWeight: '600',
    lineHeight: 20,
  },
  modalBody: {
    padding: 20,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  modalFeeName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 30,
  },
  modalBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  modalBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalFooter: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  paymentButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.5,
  },
  paymentButtonDisabled: {
    opacity: 0.6,
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 12,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  webViewHeaderText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  webViewCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewCloseButtonText: {
    fontSize: 20,
    color: '#424242',
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
});

export default FeePopupModal;

