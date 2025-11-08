import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Text,
  ActivityIndicator,
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
import { getDanhSachKhoanThu, getDanhSachKhoanThuPublic, type KhoanThu } from '../api/khoanThuApi';
import { appTheme } from '../theme';
import { useAuth } from '../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = 140;

// Component Card cho mỗi khoản thu với hiệu ứng 3D
const FeeCard: React.FC<{
  khoanThu: KhoanThu;
  index: number;
  onPress?: () => void;
}> = ({ khoanThu, index, onPress }) => {
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
          {/* Badge loại khoản thu */}
          <View style={styles.badgeContainer}>
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

          {/* Nội dung card */}
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {khoanThu.tenKhoanThu}
              </Text>
            </View>

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

export default function FeeScreen() {
  const { isAuthenticated, user } = useAuth();
  const [khoanThuList, setKhoanThuList] = useState<KhoanThu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Kiểm tra authentication trước khi gọi API
      if (!isAuthenticated) {
        setError('Vui lòng đăng nhập để sử dụng tính năng này.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        if (__DEV__) {
          console.log('📋 Fetching khoan thu list...', {
            isAuthenticated,
            user: user?.sub,
            role: user?.role,
          });
        }
        
        // Sử dụng endpoint phù hợp dựa trên role của user
        // RESIDENT sử dụng /public endpoint, ADMIN/ACCOUNTANT sử dụng endpoint thông thường
        const isResident = user?.role === 'ROLE_RESIDENT';
        const data = isResident 
          ? await getDanhSachKhoanThuPublic()
          : await getDanhSachKhoanThu();
        setKhoanThuList(data);
        
        if (__DEV__) {
          console.log('✅ Successfully fetched khoan thu list:', data.length, 'items');
        }
      } catch (err: any) {
        console.error('❌ Failed to fetch khoan thu:', err);
        
        // Xử lý các loại lỗi khác nhau
        let errorMessage = 'Không thể tải danh sách khoản thu. Vui lòng thử lại.';
        
        if (err?.name === 'ForbiddenError' || err?.response?.status === 403) {
          errorMessage = 'Bạn không có quyền truy cập tính năng này. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.';
        } else if (err?.name === 'NetworkError') {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
        } else if (err?.name === 'TimeoutError') {
          errorMessage = 'Kết nối quá thời gian. Vui lòng thử lại.';
        } else if (err?.response?.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (err?.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, user]);

  const handleCardPress = (khoanThu: KhoanThu) => {
    // TODO: Navigate to detail screen or show modal
    console.log('Pressed:', khoanThu);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/thu_phi.png')}
        style={styles.headerImage}
        resizeMode="contain"
      />
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={appTheme.colors.primary} />
            <Text style={styles.loadingText}>Đang tải danh sách...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={async () => {
                try {
                  setError(null);
                  setLoading(true);
                  // Sử dụng endpoint phù hợp dựa trên role của user
                  const isResident = user?.role === 'ROLE_RESIDENT';
                  const data = isResident 
                    ? await getDanhSachKhoanThuPublic()
                    : await getDanhSachKhoanThu();
                  setKhoanThuList(data);
                  setLoading(false);
                } catch (err: any) {
                  console.error('Retry failed:', err);
                  
                  let errorMessage = 'Không thể tải danh sách khoản thu.';
                  
                  if (err?.name === 'ForbiddenError' || err?.response?.status === 403) {
                    errorMessage = 'Bạn không có quyền truy cập tính năng này. Vui lòng đăng nhập lại hoặc liên hệ quản trị viên.';
                  } else if (err?.name === 'NetworkError') {
                    errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.';
                  } else if (err?.name === 'TimeoutError') {
                    errorMessage = 'Kết nối quá thời gian. Vui lòng thử lại.';
                  } else if (err?.response?.status === 401) {
                    errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
                  } else if (err?.message) {
                    errorMessage = err.message;
                  }
                  
                  setError(errorMessage);
                  setLoading(false);
                }
              }}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : khoanThuList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có khoản thu nào</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {khoanThuList.map((khoanThu, index) => (
              <FeeCard
                key={khoanThu.id}
                khoanThu={khoanThu}
                index={index}
                onPress={() => handleCardPress(khoanThu)}
              />
            ))}
            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  headerImage: {
    width: '100%',
    marginTop: -235,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  },
  content: {
    marginTop: 0,
    width: '100%',
    flex: 1,
    paddingTop: 120, // Điều chỉnh để content bắt đầu ngay sau header image
    zIndex: 1, // Đảm bảo content hiển thị trên header image
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
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
    padding: 16,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardHeader: {
    marginTop: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: appTheme.colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  errorText: {
    fontSize: 16,
    color: appTheme.colors.error,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: appTheme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: appTheme.colors.text.secondary,
  },
  bottomSpacer: {
    height: 24,
  },
});

