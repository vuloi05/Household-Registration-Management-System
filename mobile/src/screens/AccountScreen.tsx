// src/screens/AccountScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Card, Title, Divider, Avatar, TextInput, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getMyNhanKhau, updateMyNhanKhau, type NhanKhauFormValues } from '../api/nhanKhauApi';
import type { NhanKhau } from '../types/nhanKhau';
import { useAuth } from '../context/AuthContext';
import { appTheme as theme } from '../theme';

// Helper component for displaying and editing a piece of information
const EditableDetailRow = ({
  icon,
  label,
  value,
  isEditing,
  onChangeText,
  editable = false,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value?: string;
  isEditing?: boolean;
  onChangeText?: (text: string) => void;
  editable?: boolean;
}) => (
  <View style={styles.detailRow}>
    <MaterialCommunityIcons name={icon} size={24} color={theme.colors.primary} style={styles.detailIcon} />
    <View style={styles.detailTextContainer}>
      <Text style={styles.detailLabel}>{label}</Text>
      {isEditing && editable ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={styles.textInput}
          dense
          mode="flat"
          underlineColor="transparent"
          activeUnderlineColor={theme.colors.primary}
        />
      ) : (
        <Text style={styles.detailValue}>{value || 'Chưa có thông tin'}</Text>
      )}
    </View>
  </View>
);

export default function AccountScreen() {
  const { user } = useAuth();
  const [nhanKhau, setNhanKhau] = useState<NhanKhau | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State for form values during editing
  const [formData, setFormData] = useState<NhanKhauFormValues>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyNhanKhau();
      setNhanKhau(data);
      // Initialize form data
      setFormData({
        ngheNghiep: data.ngheNghiep,
        noiLamViec: data.noiLamViec,
      });
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

  const handleEditToggle = () => {
    if (isEditing) {
        // If canceling, reset form data to original
        setFormData({
            ngheNghiep: nhanKhau?.ngheNghiep,
            noiLamViec: nhanKhau?.noiLamViec,
        });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
      if (!nhanKhau) return;
      setIsSaving(true);
      try {
          // TODO: This API endpoint needs to be implemented on the backend.
          const updatedNhanKhau = await updateMyNhanKhau(formData);
          setNhanKhau(updatedNhanKhau);
          setIsEditing(false);
          Alert.alert("Thành công", "Thông tin cá nhân đã được cập nhật.");
      } catch (err: any) {
          console.error("Failed to save account data:", err);
          Alert.alert("Lỗi", "Không thể cập nhật thông tin. Vui lòng thử lại.");
      } finally {
          setIsSaving(false);
      }
  };
  
  const handleFormChange = (field: keyof NhanKhauFormValues, value: string) => {
      setFormData(prev => ({...prev, [field]: value}));
  }

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

      {isEditing && (
          <View style={styles.editBanner}>
              <Text style={styles.editBannerText}>Bạn đang ở chế độ chỉnh sửa</Text>
          </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
          {isEditing ? (
              <>
                <Button mode="outlined" onPress={handleEditToggle} style={styles.actionButton} disabled={isSaving}>Hủy</Button>
                <Button mode="contained" onPress={handleSave} style={styles.actionButton} loading={isSaving} disabled={isSaving}>Lưu thay đổi</Button>
              </>
          ) : (
            <Button mode="contained" icon="pencil-outline" onPress={handleEditToggle} style={styles.actionButton}>Chỉnh sửa</Button>
          )}
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Thông tin cơ bản</Title>
          <Divider style={styles.divider} />
          <EditableDetailRow icon="account-outline" label="Họ và tên" value={nhanKhau.hoTen} />
          <EditableDetailRow icon="cake-variant-outline" label="Ngày sinh" value={formatDate(nhanKhau.ngaySinh)} />
          <EditableDetailRow icon="gender-male-female" label="Giới tính" value={nhanKhau.gioiTinh} />
          <EditableDetailRow icon="map-marker-outline" label="Nơi sinh" value={nhanKhau.noiSinh} />
          <EditableDetailRow icon="home-map-marker" label="Quê quán" value={nhanKhau.queQuan} />
          <EditableDetailRow icon="flag-outline" label="Dân tộc" value={nhanKhau.danToc} />
        </Card.Content>
      </Card>
      
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Thông tin định danh</Title>
          <Divider style={styles.divider} />
          <EditableDetailRow icon="card-account-details-outline" label="Số CMND/CCCD" value={nhanKhau.cmndCccd} />
          <EditableDetailRow icon="calendar-check-outline" label="Ngày cấp" value={formatDate(nhanKhau.ngayCap)} />
          <EditableDetailRow icon="map-marker-radius-outline" label="Nơi cấp" value={nhanKhau.noiCap} />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Thông tin khác</Title>
          <Divider style={styles.divider} />
          <EditableDetailRow icon="briefcase-outline" label="Nghề nghiệp" value={formData.ngheNghiep} isEditing={isEditing} editable onChangeText={(text) => handleFormChange('ngheNghiep', text)} />
          <EditableDetailRow icon="domain" label="Nơi làm việc" value={formData.noiLamViec} isEditing={isEditing} editable onChangeText={(text) => handleFormChange('noiLamViec', text)} />
          <EditableDetailRow icon="calendar-today" label="Ngày đăng ký thường trú" value={formatDate(nhanKhau.ngayDangKyThuongTru)} />
        </Card.Content>
      </Card>
      <View style={{height: 40}} />
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
    marginTop: 8,
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
    paddingVertical: 10,
  },
  textInput: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    height: 40,
    fontSize: 16,
  },
  buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      margin: theme.spacing.md,
  },
  actionButton: {
      flex: 1,
      marginHorizontal: theme.spacing.sm,
  },
  editBanner: {
      backgroundColor: theme.colors.warning,
      padding: theme.spacing.sm,
      alignItems: 'center',
  },
  editBannerText: {
      color: '#fff',
      fontWeight: 'bold',
  }
});
