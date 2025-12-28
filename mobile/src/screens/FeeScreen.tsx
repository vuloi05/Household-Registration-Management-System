import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Chip } from 'react-native-paper';
import { getDanhSachKhoanThuPublic, type KhoanThu } from '../api/khoanThuApi';
import { appTheme as theme } from '../theme';
import { useAuth } from '../context/AuthContext';
import FeeCard from '../components/FeeCard';
import FeePopupModal from '../components/FeePopupModal';

type FilterType = 'all' | 'mandatory' | 'voluntary';

export default function FeeScreen() {
  const { isAuthenticated } = useAuth();
  const [khoanThuList, setKhoanThuList] = useState<KhoanThu[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKhoanThu, setSelectedKhoanThu] = useState<KhoanThu | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Vui lòng đăng nhập để sử dụng tính năng này.');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await getDanhSachKhoanThuPublic();
      setKhoanThuList(data);
    } catch (err: any) {
      console.error('❌ Failed to fetch khoan thu:', err);
      let errorMessage = 'Không thể tải danh sách khoản thu. Vui lòng thử lại.';
      if (err?.name === 'ForbiddenError' || err?.response?.status === 403) {
        errorMessage = 'Bạn không có quyền truy cập tính năng này.';
      } else if (err?.name === 'NetworkError') {
        errorMessage = 'Không thể kết nối đến server.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleCardPress = (khoanThu: KhoanThu) => {
    setSelectedKhoanThu(khoanThu);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setTimeout(() => setSelectedKhoanThu(null), 300);
  };

  const handlePaymentSuccess = () => {
      // Refresh data after successful payment
      onRefresh();
  };

  const filteredList = useMemo(() => {
    if (filter === 'mandatory') {
      return khoanThuList.filter(item => item.loaiKhoanThu === 'BAT_BUOC');
    }
    if (filter === 'voluntary') {
      return khoanThuList.filter(item => item.loaiKhoanThu === 'DONG_GOP');
    }
    return khoanThuList;
  }, [khoanThuList, filter]);

  const renderHeader = () => (
    <>
      <Text style={styles.headerTitle}>Các khoản thu</Text>
      <Text style={styles.headerSubtitle}>
        Danh sách các khoản phí bắt buộc và đóng góp của khu dân cư.
      </Text>
      <View style={styles.chipContainer}>
        <Chip
          icon="format-list-bulleted"
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={[styles.chip, filter === 'all' && styles.chipSelected]}
          textStyle={[styles.chipText, filter === 'all' && styles.chipTextSelected]}
        >
          Tất cả
        </Chip>
        <Chip
          icon="alert-circle"
          selected={filter === 'mandatory'}
          onPress={() => setFilter('mandatory')}
          style={[styles.chip, filter === 'mandatory' && styles.chipSelected]}
          textStyle={[styles.chipText, filter === 'mandatory' && styles.chipTextSelected]}
        >
          Bắt buộc
        </Chip>
        <Chip
          icon="heart-outline"
          selected={filter === 'voluntary'}
          onPress={() => setFilter('voluntary')}
          style={[styles.chip, filter === 'voluntary' && styles.chipSelected]}
          textStyle={[styles.chipText, filter === 'voluntary' && styles.chipTextSelected]}
        >
          Đóng góp
        </Chip>
      </View>
    </>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.infoText}>Đang tải danh sách...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centeredContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={filteredList}
        renderItem={({ item, index }) => (
          <FeeCard
            key={item.id}
            khoanThu={item}
            index={index}
            onPress={() => handleCardPress(item)}
          />
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.centeredContainer}>
            <Text style={styles.infoText}>Không có khoản thu nào.</Text>
          </View>
        }
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderContent()}
      <FeePopupModal
        visible={isModalVisible}
        khoanThu={selectedKhoanThu}
        onClose={handleCloseModal}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      marginTop: 60, // SafeArea
      marginBottom: 8,
  },
  headerSubtitle: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      marginBottom: 20,
  },
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: theme.colors.paper,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipSelected: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  chipText: {
    color: theme.colors.text.secondary,
  },
  chipTextSelected: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 400,
  },
  infoText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});