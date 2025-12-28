import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Card, Title, Paragraph, Divider, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { getMyNhanKhau, getMyHoKhau } from '../api/nhanKhauApi';
import type { NhanKhau } from '../types/nhanKhau';
import type { HoKhau } from '../types/hoKhau';
import { useAuth } from '../context/AuthContext';
import { appTheme as theme } from '../theme';

const { width } = Dimensions.get('window');
const QR_CODE_SIZE = width * 0.4;

// Component for each piece of information
const InfoRow = ({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap, label: string, value?: string }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons name={icon} size={22} color={theme.colors.text.secondary} style={styles.infoIcon} />
    <View>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Chưa có thông tin'}</Text>
    </View>
  </View>
);

export default function WalletScreen() {
  const { user } = useAuth();
  const [nhanKhau, setNhanKhau] = useState<NhanKhau | null>(null);
  const [hoKhau, setHoKhau] = useState<HoKhau | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch concurrently
      const [nhanKhauData, hoKhauData] = await Promise.all([
        getMyNhanKhau(),
        getMyHoKhau(),
      ]);

      setNhanKhau(nhanKhauData);
      setHoKhau(hoKhauData);

    } catch (err: any) {
      console.error('Failed to fetch wallet data:', err);
      let errorMessage = 'Không thể tải dữ liệu. Vui lòng thử lại.';
      if (err?.response?.status === 404) {
        errorMessage = 'Không tìm thấy thông tin nhân khẩu của bạn.';
      } else if (err?.name === 'NetworkError') {
        errorMessage = 'Lỗi kết nối, vui lòng kiểm tra mạng và thử lại.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Chưa có';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/giay_to.png')}
        style={styles.headerImage}
        resizeMode="contain"
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ID Card Section */}
        <Card style={styles.idCard}>
          <Card.Content>
            <View style={styles.idCardHeader}>
              <Avatar.Text size={64} label={nhanKhau.hoTen?.charAt(0) || ''} style={styles.avatar} />
              <View style={styles.idCardHeaderText}>
                <Title style={styles.idCardName}>{nhanKhau.hoTen}</Title>
                <Paragraph style={styles.idCardRole}>Công dân</Paragraph>
              </View>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.qrAndInfoContainer}>
              <View style={styles.qrCodeContainer}>
                {nhanKhau.cmndCccd && (
                  <QRCode
                    value={JSON.stringify({
                      hoTen: nhanKhau.hoTen,
                      cmndCccd: nhanKhau.cmndCccd,
                      ngaySinh: nhanKhau.ngaySinh,
                    })}
                    size={QR_CODE_SIZE}
                    backgroundColor="white"
                    color="black"
                  />
                )}
                <Text style={styles.qrCodeText}>Mã QR cá nhân</Text>
              </View>
              <View style={styles.basicInfoContainer}>
                <InfoRow icon="card-account-details-outline" label="Số CCCD" value={nhanKhau.cmndCccd} />
                <InfoRow icon="calendar-outline" label="Ngày sinh" value={formatDate(nhanKhau.ngaySinh)} />
                <InfoRow icon="map-marker-outline" label="Quê quán" value={nhanKhau.queQuan} />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Household Section */}
        {hoKhau && (
          <Card style={styles.householdCard}>
            <Card.Title
              title="Thông tin hộ khẩu"
              subtitle={`Mã hộ khẩu: ${hoKhau.maHoKhau}`}
              titleStyle={styles.cardTitle}
              left={(props) => <Avatar.Icon {...props} icon="home-group" style={{ backgroundColor: theme.colors.primary }} />}
            />
            <Card.Content>
              <InfoRow icon="map-marker" label="Địa chỉ thường trú" value={hoKhau.diaChi} />
              <Divider style={styles.divider} />
              <Title style={styles.householdMembersTitle}>Thành viên trong hộ</Title>
              {hoKhau.thanhVien && hoKhau.thanhVien.length > 0 ? (
                hoKhau.thanhVien.map((member) => (
                  <View key={member.id} style={styles.memberRow}>
                    <Avatar.Text size={40} label={member.hoTen?.charAt(0) || ''} style={styles.memberAvatar} />
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.hoTen}</Text>
                      <Text style={styles.memberRelationship}>{member.quanHeVoiChuHo}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text>Không có thành viên nào khác.</Text>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerImage: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    marginTop: -235,
    zIndex: 0,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingTop: 140, // Adjust to be below the header image
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text.secondary,
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
  idCard: {
    borderRadius: theme.borderRadius.large,
    elevation: 4,
    marginBottom: theme.spacing.lg,
    backgroundColor: '#fff',
  },
  idCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
  },
  idCardHeaderText: {
    marginLeft: theme.spacing.md,
  },
  idCardName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  idCardRole: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  divider: {
    marginVertical: theme.spacing.md,
  },
  qrAndInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.lg,
  },
  qrCodeText: {
    marginTop: theme.spacing.sm,
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  basicInfoContainer: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  infoIcon: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  householdCard: {
    borderRadius: theme.borderRadius.large,
    elevation: 4,
    backgroundColor: '#fff',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  householdMembersTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  memberAvatar: {
    backgroundColor: theme.colors.primaryLight,
  },
  memberInfo: {
    marginLeft: theme.spacing.md,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  memberRelationship: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
});
