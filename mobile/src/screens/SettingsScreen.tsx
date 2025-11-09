import React, { useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { SettingsStackParamList } from '../navigation/SettingsStackNavigator';

interface SettingsItemProps {
  title: string;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress?: () => void;
  showIcon?: boolean;
  isBold?: boolean;
  reducedPadding?: boolean;
}

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
          name={icon} 
          size={20} 
          color="#616161" 
        />
      )}
    </TouchableOpacity>
  );
}

type SettingsScreenNavigationProp = StackNavigationProp<SettingsStackParamList, 'SettingsMain'>;

export default function SettingsScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [headerHeight, setHeaderHeight] = useState(0);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Đăng xuất thất bại', 'Vui lòng thử lại sau.');
    }
  };

  const handleAccountPress = () => {
    // TODO: Navigate to account screen
  };

  const handleShareHistoryPress = () => {
    navigation.navigate('BankAccount');
  };

  const handleLoginSettingsPress = () => {
    // TODO: Navigate to login settings screen
  };

  const handleHeaderLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    // Header container có chiều cao thực tế sau khi image được render
    // Với marginTop: -198, phần hiển thị thực tế của header
    // Illustration thường kết thúc ở khoảng 40-45% chiều cao container
    // Thêm khoảng cách nhỏ để settings list không quá sát header
    const illustrationBottom = height * 0.42; // Điểm cuối của illustration
    const spacing = 16; // Khoảng cách giữa header và settings list
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
            showIcon={false}
            isBold={true}
            reducedPadding={true}
          />
          
          <SettingsItem 
            title="Tài khoản ngân hàng" 
            icon="bank"
            onPress={handleShareHistoryPress}
          />
          <View style={styles.separator} />
          
          <SettingsItem 
            title="Cài đặt đăng nhập" 
            icon="lock"
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
    paddingVertical: 12,
    paddingHorizontal: 0,
    minHeight: 44,
    zIndex: 3,
  },
  settingsItemReducedPadding: {
    paddingBottom: 4,
  },
  settingsItemText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#212121',
  },
  settingsItemTextBold: {
    fontWeight: '700',
    color: '#616161',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginLeft: 0,
  },
  content: {
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
  logoutButton: {
    width: '90%',
    maxWidth: 380,
    paddingVertical: 18,
    backgroundColor: '#FFE5E8',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D32F2F',
  },
});

