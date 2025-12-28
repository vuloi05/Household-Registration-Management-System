import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import type { SettingsStackParamList } from '../navigation/SettingsStackNavigator';

interface SettingsItemProps {
  title: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
  showIcon?: boolean;
  isBold?: boolean;
  reducedPadding?: boolean;
}

// Define navigation prop type
type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'SettingsMain'>;

function SettingsItem({ title, icon, onPress, showIcon = true, isBold = false, reducedPadding = false }: SettingsItemProps) {
  return (
    <TouchableOpacity
      style={[styles.settingsItem, reducedPadding && styles.settingsItemReducedPadding]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Text style={[styles.settingsItemText, isBold && styles.settingsItemTextBold]}>
        {title}
      </Text>
      {showIcon && icon && (
        <MaterialCommunityIcons 
          name="chevron-right" // Use chevron for navigation items
          size={24} 
          color="#BDBDBD" 
        />
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [headerHeight, setHeaderHeight] = useState(0);

  const handleLogout = async () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", style: "destructive", onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Đăng xuất thất bại', 'Vui lòng thử lại sau.');
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
        {/* Settings List */}
        <View style={[styles.settingsList, { marginTop: headerHeight }]}>
          <SettingsItem 
            title="Tài khoản" 
            onPress={handleAccountPress}
            isBold={true}
            reducedPadding={true}
            showIcon={false}
          />
          
          <SettingsItem 
            title="Thông tin cá nhân" 
            onPress={handleAccountPress}
          />
          <SettingsItem 
            title="Đổi mật khẩu" 
            onPress={handleLoginSettingsPress}
          />
        </View>

        {/* Logout Button */}
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.logoutButton}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    paddingBottom: 20,
  },
  settingsList: {
    paddingHorizontal: 20,
    marginTop: 0,
    paddingTop: 0,
    backgroundColor: '#ffffff',
    zIndex: 2,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 0,
    minHeight: 44,
    zIndex: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsItemReducedPadding: {
    paddingBottom: 8,
    borderBottomWidth: 0,
  },
  settingsItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  settingsItemTextBold: {
    fontWeight: '700',
    fontSize: 14,
    color: '#757575',
    textTransform: 'uppercase',
  },
  content: {
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
  logoutButton: {
    width: '90%',
    maxWidth: 380,
    paddingVertical: 16,
    backgroundColor: '#FFF1F1',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#D32F2F',
  },
});

