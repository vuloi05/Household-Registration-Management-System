import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { type KhoanThu } from '../api/khoanThuApi';
import PaymentModal from './PaymentModal';

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
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

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
      <Pressable style={styles.modalContainer} onPress={onClose}>
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
        </Animated.View>

        <Pressable onPress={(e) => e.stopPropagation()}>
          <Animated.View style={[styles.modalContent, animatedModalStyle]}>
            <View style={styles.modalGradient}>
              {/* Header section */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalHeaderTitle}>Chi tiết thu phí</Text>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    onClose();
                  }}
                  style={styles.closeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
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
                <TouchableOpacity
                  style={styles.paymentButton}
                  onPress={() => {
                    setPaymentModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.paymentButtonGradient}
                  >
                    <Text style={styles.paymentButtonText}>Thanh toán</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </Pressable>

      {/* Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        khoanThu={khoanThu}
        onClose={() => {
          setPaymentModalVisible(false);
        }}
        onPaymentSuccess={() => {
          setPaymentModalVisible(false);
          onClose();
          onPaymentSuccess?.();
        }}
      />
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
});

export default FeePopupModal;

