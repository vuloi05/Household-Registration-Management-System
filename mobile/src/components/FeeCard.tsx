import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { type KhoanThu } from '../api/khoanThuApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = 140;

interface FeeCardProps {
  khoanThu: KhoanThu;
  index: number;
  onPress?: () => void;
}

const FeeCard: React.FC<FeeCardProps> = ({ khoanThu, index, onPress }) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotateX = useSharedValue(0);

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    rotateX.value = withSpring(5);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    rotateX.value = withSpring(0);
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    const rotateXValue = interpolate(
      rotateX.value,
      [0, 5],
      [0, 5],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value },
        { perspective: 1000 },
        { rotateX: `${rotateXValue}deg` },
      ],
    };
  });

  const animatedShadowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      scale.value,
      [0.95, 1],
      [0.3, 0.15],
      Extrapolate.CLAMP
    );

    return {
      shadowOpacity,
    };
  });

  const isBatBuoc = khoanThu.loaiKhoanThu === 'BAT_BUOC';
  const gradientColors = isBatBuoc
    ? (['#D32F2F', '#B71C1C'] as const) // Đỏ đậm cho bắt buộc
    : (['#1976D2', '#0D47A1'] as const); // Xanh dương cho đóng góp

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null || isNaN(value)) return 'Chưa có';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        animatedCardStyle,
        animatedShadowStyle,
        { marginTop: index === 0 ? 0 : 16 },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.cardTouchable}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Header section - phần màu nhạt hơn */}
          <View style={styles.cardHeaderSection}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">
                {khoanThu.tenKhoanThu}
              </Text>
              {/* Badge loại khoản thu */}
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isBatBuoc
                      ? 'rgba(255, 255, 255, 0.25)'
                      : 'rgba(255, 255, 255, 0.2)',
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {isBatBuoc ? 'BẮT BUỘC' : 'ĐÓNG GÓP'}
                </Text>
              </View>
            </View>
          </View>

          {/* Details section */}
          <View style={styles.cardDetailsSection}>
            <View style={styles.cardDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Đơn giá/Nhân khẩu:</Text>
                <Text style={styles.detailValue}>
                  {formatCurrency(khoanThu.soTienTrenMotNhanKhau)}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Ngày tạo:</Text>
                <Text style={styles.detailValue}>{formatDate(khoanThu.ngayTao)}</Text>
              </View>
            </View>
          </View>

          {/* Hiệu ứng ánh sáng phản chiếu */}
          <View style={styles.reflectionOverlay} />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  cardTouchable: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    position: 'relative',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginLeft: 8,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardHeaderSection: {
    height: '40%',
    padding: 16,
    paddingBottom: 8,
    justifyContent: 'flex-start',
    position: 'relative',
    zIndex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    height: '100%',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    flex: 1,
  },
  cardDetailsSection: {
    height: '60%',
    padding: 16,
    paddingTop: 8,
    justifyContent: 'center',
  },
  cardDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'right',
  },
  reflectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});

export default FeeCard;

