import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { getDanhSachKhoanThu, getDanhSachKhoanThuPublic, type KhoanThu } from '../api/khoanThuApi';
import { appTheme } from '../theme';
import { useAuth } from '../context/AuthContext';
import FeeCard from '../components/FeeCard';
import FeePopupModal from '../components/FeePopupModal';

export default function FeeScreen() {
  const { isAuthenticated, user } = useAuth();
  const [khoanThuList, setKhoanThuList] = useState<KhoanThu[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKhoanThu, setSelectedKhoanThu] = useState<KhoanThu | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

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
    setSelectedKhoanThu(khoanThu);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTimeout(() => {
      setSelectedKhoanThu(null);
    }, 300);
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
      
      <FeePopupModal
        visible={isModalVisible}
        khoanThu={selectedKhoanThu}
        onClose={handleCloseModal}
      />
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
    paddingTop: 150, // Điều chỉnh để content bắt đầu ngay sau header image
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

