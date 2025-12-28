import React, { useEffect, useState, useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
import { Button, TextInput } from 'react-native-paper';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import QRCode from 'react-native-qrcode-svg';
import { type KhoanThu } from '../api/khoanThuApi';
import { getMyNhanKhau } from '../api/nhanKhauApi';
import { createPayment, getPaymentStatus, type PaymentResponse } from '../api/paymentApi';
import { appTheme as theme } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type PaymentStep = 'details' | 'qr' | 'webview' | 'loading' | 'verifying';

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
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);

  const [step, setStep] = useState<PaymentStep>('details');
  const [paymentInfo, setPaymentInfo] = useState<PaymentResponse | null>(null);
  const [customAmount, setCustomAmount] = useState('');

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 300 });
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    }
    // Reset state on visibility change
    if (!visible) {
        setTimeout(() => {
            setStep('details');
            setPaymentInfo(null);
            setCustomAmount('');
        }, 300);
    }
  }, [visible]);

  const animatedModalStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedBackdropStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacity.value,
    };
  });

  const handleCreatePayment = async () => {
    const isVoluntary = khoanThu?.loaiKhoanThu === 'DONG_GOP';
    const amountToPay = isVoluntary ? parseFloat(customAmount.replace(/,/g, '')) : khoanThu?.soTienTrenMotNhanKhau;

    if (!khoanThu || !amountToPay || isNaN(amountToPay) || amountToPay <= 0) {
      Alert.alert('Lỗi', 'Số tiền không hợp lệ. Vui lòng nhập một số tiền lớn hơn 0.');
      return;
    }
    setStep('loading');
    try {
      const myNhanKhau = await getMyNhanKhau();
      const response = await createPayment({
        khoanThuId: khoanThu.id,
        nhanKhauId: myNhanKhau.id,
        amount: amountToPay,
        description: `Thanh toan ${khoanThu.tenKhoanThu}`,
        returnUrl: 'quanlynhankhau://payment-success',
        cancelUrl: 'quanlynhankhau://payment-cancel',
      });
      setPaymentInfo(response);
      setStep('qr');
    } catch (error: any) {
      console.error('Payment error:', error);
      Alert.alert('Lỗi thanh toán', error?.response?.data?.message || 'Không thể tạo thanh toán. Vui lòng thử lại.');
      setStep('details');
    }
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    const { url } = navState;
    if (url.includes('payment-success') || url.includes('payment-cancel')) {
      if (url.includes('payment-success') && paymentInfo) {
        setStep('verifying');
        checkPaymentStatus(paymentInfo.paymentId, 15); // Poll for 30 seconds (15 retries * 2s)
      } else {
        setStep('details'); // Close webview on cancellation
        Alert.alert('Thông báo', 'Bạn đã hủy thanh toán');
        onClose();
      }
    }
  };

  const checkPaymentStatus = async (paymentId: string, retriesLeft: number) => {
    if (retriesLeft <= 0) {
      setStep('details');
      Alert.alert('Lỗi', 'Không thể xác nhận thanh toán tại thời điểm này. Vui lòng kiểm tra lại trạng thái trong danh sách khoản thu sau.');
      onClose();
      return;
    }

    try {
      const status = await getPaymentStatus(paymentId);
      if (status.status === 'paid') {
        Alert.alert('Thành công', 'Thanh toán thành công!', [
          { text: 'OK', onPress: () => {
              onPaymentSuccess?.();
              onClose();
          }},
        ]);
      } else {
        // Poll for status
        setTimeout(() => checkPaymentStatus(paymentId, retriesLeft - 1), 2000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setStep('details');
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi kiểm tra trạng thái thanh toán.');
      onClose();
    }
  };
  
  const isPaid = khoanThu?.trangThaiThanhToan === 'DA_NOP';
  const isVoluntary = khoanThu?.loaiKhoanThu === 'DONG_GOP';

  const renderDetails = () => (
    <>
        <Text style={styles.title}>{khoanThu?.tenKhoanThu}</Text>

        {isVoluntary ? (
            <TextInput
                label="Số tiền đóng góp"
                value={customAmount}
                onChangeText={(text) => {
                    const cleanValue = text.replace(/[^0-9]/g, '');
                    const formattedValue = cleanValue ? parseInt(cleanValue, 10).toLocaleString('vi-VN') : '';
                    setCustomAmount(formattedValue);
                }}
                keyboardType="numeric"
                style={styles.input}
                mode="outlined"
                right={<TextInput.Affix text="VNĐ" />}
            />
        ) : (
            <Text style={styles.amountText}>
                {khoanThu?.soTienTrenMotNhanKhau?.toLocaleString('vi-VN')} VNĐ
            </Text>
        )}
        
        {isPaid ? (
            <View style={styles.paidContainer}>
                <MaterialCommunityIcons name="check-circle" size={32} color={theme.colors.success} />
                <Text style={styles.paidText}>Khoản thu này đã được thanh toán</Text>
            </View>
        ) : (
            <>
                <Text style={styles.description}>
                    {isVoluntary
                        ? 'Vui lòng nhập số tiền bạn muốn đóng góp và nhấn nút bên dưới.'
                        : 'Vui lòng xác nhận để tiến hành thanh toán cho khoản thu này.'
                    }
                </Text>
                <Button 
                    mode="contained" 
                    onPress={handleCreatePayment} 
                    style={styles.button} 
                    labelStyle={styles.buttonText}
                    disabled={isVoluntary && (!customAmount || parseFloat(customAmount.replace(/,/g, '')) <= 0)}
                >
                    Xác nhận và thanh toán
                </Button>
            </>
        )}
    </>
  );

  const renderVerifying = () => (
    <View style={styles.verifyingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.verifyingText}>Đang xác nhận thanh toán...</Text>
        <Text style={styles.verifyingSubText}>Vui lòng đợi trong giây lát.</Text>
    </View>
  );

  const renderQR = () => (
      <>
        <Text style={styles.title}>Quét mã để thanh toán</Text>
        <View style={styles.qrContainer}>
            {paymentInfo?.qrCode && (
                 <QRCode value={paymentInfo.qrCode} size={Dimensions.get('window').width * 0.6} />
            )}
        </View>
        <Text style={styles.description}>Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã VietQR.</Text>
        <Button mode="contained" onPress={() => setStep('webview')} style={styles.button} labelStyle={styles.buttonText}>
            Mở qua WebView
        </Button>
        <Button mode="outlined" onPress={() => setStep('details')} style={[styles.button, {marginTop: 10}]}>
            Quay lại
        </Button>
      </>
  );

  const renderWebView = () => (
    <View style={styles.webViewContainer}>
        <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>Thanh toán qua PayOS</Text>
            <TouchableOpacity onPress={() => setStep('qr')}>
                <Text style={styles.webViewClose}>Đóng</Text>
            </TouchableOpacity>
        </View>
        {paymentInfo?.checkoutUrl && (
            <WebView
                source={{ uri: paymentInfo.checkoutUrl }}
                onNavigationStateChange={handleWebViewNavigationStateChange}
            />
        )}
    </View>
  );

  const renderContent = () => {
    switch(step) {
        case 'details': return renderDetails();
        case 'qr': return renderQR();
        case 'webview': return renderWebView();
        case 'loading': return <ActivityIndicator size="large" color={theme.colors.primary} style={{marginVertical: 60}}/>
        case 'verifying': return renderVerifying();
        default: return null;
    }
  }

  if (!khoanThu) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
                <BlurView intensity={10} tint="dark" style={StyleSheet.absoluteFill} />
            </Animated.View>
        </Pressable>

        <Animated.View style={[styles.modalContainer, animatedModalStyle]}>
            <View style={styles.handleBar} />
            {renderContent()}
        </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: theme.spacing.lg,
        paddingBottom: 40, // For home indicator
        alignItems: 'center',
    },
    paidContainer: {
        alignItems: 'center',
        marginVertical: theme.spacing.lg,
    },
    paidText: {
        marginTop: theme.spacing.sm,
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.success,
    },
    verifyingContainer: {
        alignItems: 'center',
        marginVertical: theme.spacing.xl,
    },
    verifyingText: {
        marginTop: theme.spacing.md,
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    verifyingSubText: {
        marginTop: theme.spacing.xs,
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    handleBar: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: theme.colors.border,
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.sm,
        textAlign: 'center'
    },
    amountText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: theme.spacing.md,
    },
    input: {
        width: '100%',
        marginBottom: theme.spacing.md,
    },
    description: {
        fontSize: 16,
        color: theme.colors.text.secondary,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    button: {
        width: '100%',
        paddingVertical: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    qrContainer: {
        marginVertical: theme.spacing.lg,
        padding: theme.spacing.sm,
        backgroundColor: 'white',
        borderRadius: theme.borderRadius.small,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowOffset: {width: 0, height: 4}
    },
    webViewContainer: {
        width: '100%',
        height: SCREEN_HEIGHT * 0.8,
    },
    webViewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.md,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
    },
    webViewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    webViewClose: {
        fontSize: 16,
        color: theme.colors.primary,
    }
});


export default FeePopupModal;


