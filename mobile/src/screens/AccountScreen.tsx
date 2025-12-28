// src/screens/AccountScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card, Title, Divider, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getMyNhanKhau } from '../api/nhanKhauApi';
import type { NhanKhau } from '../types/nhanKhau';
import { useAuth } from '../context/AuthContext';
import { appTheme as theme } from '../theme';

// Helper component for displaying a piece of information
const DetailRow = ({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap, label: string, value?: string }) => (
  <View style={styles.detailRow}>
    <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} style={styles.detailIcon} />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Chưa có thông tin'}</Text>
    </View>
  </View>
);

export default function AccountScreen() {
  const { user } = useAuth();
  const [nhanKhau, setNhanKhau] = useState<NhanKhau | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyNhanKhau();
      setNhanKhau(data);
    } catch (err: any) {
      console.error('Failed to fetch account data:', err);
      setError('Không thể tải thông tin tài khoản. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!nhanKhau) {
    return (
      <View style={styles.centered}>
        <Text>Không có dữ liệu để hiển thị.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={80} label={nhanKhau.hoTen?.charAt(0) || 'A'} style={styles.avatar} />
        <Title style={styles.headerName}>{nhanKhau.hoTen}</Title>
        <Text style={styles.headerCccd}>CCCD: {nhanKhau.cmndCccd}</Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Thông tin cơ bản</Title>
          <Divider style={styles.divider} />
          <DetailRow icon="account-outline" label="Họ và tên" value={nhanKhau.hoTen} />
          <DetailRow icon="cake-variant-outline" label="Ngày sinh" value={formatDate(nhanKhau.ngaySinh)} />
          <DetailRow icon="gender-male-female" label="Giới tính" value={nhanKhau.gioiTinh} />
          <DetailRow icon="map-marker-outline" label="Nơi sinh" value={nhanKhau.noiSinh} />
          <DetailRow icon="home-map-marker" label="Quê quán" value={nhanKhau.queQuan} />
          <DetailRow icon="flag-outline" label="Dân tộc" value={nhanKhau.danToc} />
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Thông tin định danh</Title>
          <Divider style={styles.divider} />
          <DetailRow icon="card-account-details-outline" label="Số CMND/CCCD" value={nhanKhau.cmndCccd} />
          <DetailRow icon="calendar-check-outline" label="Ngày cấp" value={formatDate(nhanKhau.ngayCap)} />
          <DetailRow icon="map-marker-radius-outline" label="Nơi cấp" value={nhanKhau.noiCap} />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Thông tin khác</Title>
          <Divider style={styles.divider} />
          <DetailRow icon="briefcase-outline" label="Nghề nghiệp" value={nhanKhau.ngheNghiep} />
          <DetailRow icon="domain" label="Nơi làm việc" value={nhanKhau.noiLamViec} />
          <DetailRow icon="calendar-today" label="Ngày đăng ký thường trú" value={formatDate(nhanKhau.ngayDangKyThuongTru)} />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
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
  header: {
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
  },
  avatar: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: theme.spacing.md,
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerCccd: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  card: {
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  divider: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
  },
  detailIcon: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text.primary,
  },
});
