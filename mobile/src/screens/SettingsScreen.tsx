import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, ScrollView, ActivityIndicator } from 'react-native';
import { crossPlatformAlert } from '../utils/alert';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Avatar } from 'react-native-paper';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { getMyNhanKhau } from '../api/nhanKhauApi';
import type { NhanKhau } from '../types/nhanKhau';
import type { SettingsStackParamList } from '../navigation/SettingsStackNavigator';

interface SettingsItemProps {
  title: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
  showChevron?: boolean;
}

// Define navigation prop type
type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'SettingsMain'>;

function SettingsItem({ title, icon, onPress, showChevron = true }: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={styles.settingsItem}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.settingsItemLeft}>
        {icon && (
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name={icon} size={22} color="#4A4A4A" />
          </View>
        )}
        <Text style={styles.settingsItemText}>
          {title}
        </Text>
      </View>
      {showChevron && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#BDBDBD"
        />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { logout, user } = useAuth();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [nhanKhau, setNhanKhau] = useState<NhanKhau | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getMyNhanKhau();
        setNhanKhau(data);
      } catch (error) {
        console.error("Failed to load user info in settings:", error);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    crossPlatformAlert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đăng xuất", style: "destructive", onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout failed:', error);
              crossPlatformAlert('Đăng xuất thất bại', 'Vui lòng thử lại sau.');
            }
          }
        }
      ]
    );
  };

  const handleAccountPress = () => {
    navigation.navigate('Account');
  };

  const handleLoginSettingsPress = () => {
    navigation.navigate('ChangePassword');
  };

  const handleAppInfoPress = () => {
    crossPlatformAlert('Thông tin ứng dụng', 'Hệ thống Quản lý Dân cư\nPhiên bản 1.0.0');
  };

  const handleSupportPress = () => {
    crossPlatformAlert('Hỗ trợ', 'Liên hệ Ban quản lý: bql@chungcu.vn\nHotline: 1900 1234');
  };

  const handleHeaderLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    const illustrationBottom = height * 0.42;
    const spacing = 16;
    setHeaderHeight(Math.max(illustrationBottom + spacing, spacing));
  };

  return (
    <View style={styles.container}>
      <View
        style={styles.headerContainer}
        onLayout={handleHeaderLayout}
      >
        <Image
          source={require('../../assets/background_setting.png')}
          style={styles.headerImage}
          resizeMode="contain"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.mainContent, { marginTop: headerHeight }]}>

          {/* Profile Header */}
          <View style={styles.profileSection}>
            {loadingUser ? (
              <ActivityIndicator size="small" color="#D32F2F" />
            ) : (
              <>
                <Avatar.Text
                  size={64}
                  label={nhanKhau?.hoTen?.charAt(0) || user?.sub?.charAt(0) || 'U'}
                  style={styles.avatar}
                />
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{nhanKhau?.hoTen || 'Người dùng'}</Text>
                  <Text style={styles.profileRole}>CCCD: {nhanKhau?.cmndCccd || user?.sub || 'Chưa cập nhật'}</Text>
                </View>
              </>
            )}
          </View>

          {/* Account Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Tài khoản</Text>
          </View>
          <View style={styles.settingsList}>
            <SettingsItem
              title="Thông tin cá nhân"
              icon="account-outline"
              onPress={handleAccountPress}
            />
            <SettingsItem
              title="Đổi mật khẩu"
              icon="lock-outline"
              onPress={handleLoginSettingsPress}
            />
          </View>

          {/* App Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>Hệ thống</Text>
          </View>
          <View style={styles.settingsList}>
            <SettingsItem
              title="Thông tin ứng dụng"
              icon="information-outline"
              onPress={handleAppInfoPress}
            />
            <SettingsItem
              title="Liên hệ hỗ trợ"
              icon="help-circle-outline"
              onPress={handleSupportPress}
            />
          </View>

          {/* Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity
              style={styles.logoutButton}
              activeOpacity={0.8}
              onPress={handleLogout}
            >
              <MaterialCommunityIcons name="logout" size={20} color="#D32F2F" style={{ marginRight: 8 }} />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 1,
    overflow: 'hidden',
    pointerEvents: 'none',
  },
  headerImage: {
    width: '100%',
    marginTop: -198,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  mainContent: {
    zIndex: 2,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: '#D32F2F',
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#757575',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    paddingTop: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#757575',
    textTransform: 'uppercase',
  },
  settingsList: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    marginBottom: 24,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    alignItems: 'flex-start',
  },
  settingsItemText: {
    fontSize: 16,
    color: '#212121',
  },
  logoutContainer: {
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoutButton: {
    width: '100%',
    flexDirection: 'row',
    paddingVertical: 14,
    backgroundColor: '#FFF1F1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D32F2F',
  },
});

