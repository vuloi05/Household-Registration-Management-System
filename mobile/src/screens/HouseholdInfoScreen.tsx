import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getHouseholdByCmndCccd } from '../api/householdApi';

interface HouseholdData {
  id: number;
  maHoKhau: string;
  diaChi: string;
  ngayLap: string;
  chuHo: any;
  danhSachNhanKhau: any[];
}

export const HouseholdInfoScreen = () => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [household, setHousehold] = useState<HouseholdData | null>(null);
  const [cccd, setCccd] = useState('');

  const handleSearch = async () => {
    if (!cccd) {
      Alert.alert('Lỗi', 'Vui lòng nhập số CCCD');
      return;
    }

    setLoading(true);
    try {
      const householdData = await getHouseholdByCmndCccd(cccd);
      setHousehold(householdData);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không tìm thấy thông tin hộ khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', onPress: logout, style: 'destructive' },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông tin hộ khẩu</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Nhập số CCCD để tìm kiếm"
          value={cccd}
          onChangeText={setCccd}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.searchButtonText}>Tìm kiếm</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}

      {household && !loading && (
        <View style={styles.infoContainer}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin hộ khẩu</Text>
            <InfoRow label="Mã hộ khẩu" value={household.maHoKhau} />
            <InfoRow label="Địa chỉ" value={household.diaChi} />
            <InfoRow label="Ngày lập" value={household.ngayLap} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chủ hộ</Text>
            <InfoRow label="Họ tên" value={household.chuHo.hoTen} />
            <InfoRow label="Ngày sinh" value={household.chuHo.ngaySinh} />
            <InfoRow label="CCCD" value={household.chuHo.cmndCccd} />
            {household.chuHo.quanHeVoiChuHo && (
              <InfoRow label="Quan hệ" value={household.chuHo.quanHeVoiChuHo} />
            )}
          </View>

          {household.danhSachNhanKhau && household.danhSachNhanKhau.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Danh sách nhân khẩu ({household.danhSachNhanKhau.length})</Text>
              {household.danhSachNhanKhau.map((member: any) => (
                <View key={member.id} style={styles.memberCard}>
                  <Text style={styles.memberName}>{member.hoTen}</Text>
                  <InfoRow label="Quan hệ" value={member.quanHeVoiChuHo} />
                  <InfoRow label="Ngày sinh" value={member.ngaySinh} />
                  {member.cmndCccd && <InfoRow label="CCCD" value={member.cmndCccd} />}
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string | undefined }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
  },
  searchContainer: {
    padding: 15,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  center: {
    padding: 20,
    alignItems: 'center',
  },
  infoContainer: {
    padding: 15,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: 100,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  memberCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
});

