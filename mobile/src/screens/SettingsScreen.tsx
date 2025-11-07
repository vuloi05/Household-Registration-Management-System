import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert('Đăng xuất thất bại', 'Vui lòng thử lại sau.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/background_setting.png')}
        style={styles.headerImage}
        resizeMode="contain"
      />
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerImage: {
    width: '100%',
    maxWidth: 380,
    marginTop: -198,
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

