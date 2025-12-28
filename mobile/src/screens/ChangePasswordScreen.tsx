// src/screens/ChangePasswordScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, HelperText, ActivityIndicator, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { appTheme as theme } from '../theme';
import { changeMyPassword } from '../api/userApi';

export default function ChangePasswordScreen() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const navigation = useNavigation();

  const validatePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return false;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới không khớp. Vui lòng nhập lại.');
      return false;
    }
    if (oldPassword === newPassword) {
      setError('Mật khẩu mới không được trùng với mật khẩu cũ.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleChangePassword = async () => {
    if (!validatePassword()) {
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // TODO: Backend endpoint for this function needs to be implemented.
      // This will currently fail until `PUT /api/nhankhau/me/password` is created.
      await changeMyPassword({ oldPassword, newPassword });

      setSuccess('Đổi mật khẩu thành công!');
      Alert.alert('Thành công', 'Mật khẩu của bạn đã được thay đổi.', [
          { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      console.error('Change password error:', err);
      if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Mật khẩu cũ không chính xác.');
      } else if (err.response?.status === 404) {
        setError('API không tồn tại. Vui lòng liên hệ quản trị viên để kích hoạt tính năng này.');
      } 
      else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
    >
        <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Bảo mật tài khoản</Text>
        <Text style={styles.subtitle}>Để đảm bảo an toàn, vui lòng không chia sẻ mật khẩu cho người khác.</Text>
        
        <View style={styles.form}>
            <TextInput
            label="Mật khẩu cũ"
            value={oldPassword}
            onChangeText={setOldPassword}
            secureTextEntry={!showOldPassword}
            mode="outlined"
            style={styles.input}
            right={<TextInput.Icon icon={showOldPassword ? "eye-off" : "eye"} onPress={() => setShowOldPassword(!showOldPassword)} />}
            />
            <TextInput
            label="Mật khẩu mới"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            mode="outlined"
            style={styles.input}
            right={<TextInput.Icon icon={showNewPassword ? "eye-off" : "eye"} onPress={() => setShowNewPassword(!showNewPassword)} />}
            />
            <TextInput
            label="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            mode="outlined"
            style={styles.input}
            right={<TextInput.Icon icon={showConfirmPassword ? "eye-off" : "eye"} onPress={() => setShowConfirmPassword(!showConfirmPassword)} />}
            />
            
            {error && <HelperText type="error" visible={!!error} style={styles.helperText}>{error}</HelperText>}
            {success && <HelperText type="info" visible={!!success} style={styles.helperText}>{success}</HelperText>}
            
            <Button
            mode="contained"
            onPress={handleChangePassword}
            loading={loading}
            disabled={loading}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
        </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
      flexGrow: 1,
      padding: theme.spacing.lg,
      justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xl,
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  button: {
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.medium,
  },
  buttonLabel: {
      fontSize: 16,
      fontWeight: 'bold',
  },
  helperText: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
  }
});
