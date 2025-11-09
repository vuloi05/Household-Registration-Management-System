// src/components/LoginForm.tsx
import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { appTheme as theme } from '../theme';
import { styles } from '../screens/LoginScreen.styles';

const AnimatedView = Animated.createAnimatedComponent(View);

interface LoginFormProps {
  cccd: string;
  password: string;
  showPassword: boolean;
  loginError: string | null;
  isSubmitting: boolean;
  cccdFocused: boolean;
  passwordFocused: boolean;
  cccdInputStyle: any;
  passwordInputStyle: any;
  buttonAnimatedStyle: any;
  shimmerStyle: any;
  cardAnimatedStyle: any;
  onCccdChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onCccdFocus: () => void;
  onCccdBlur: () => void;
  onPasswordFocus: () => void;
  onPasswordBlur: () => void;
  onTogglePassword: () => void;
  onLogin: () => void;
}

export default function LoginForm({
  cccd,
  password,
  showPassword,
  loginError,
  isSubmitting,
  cccdFocused,
  passwordFocused,
  cccdInputStyle,
  passwordInputStyle,
  buttonAnimatedStyle,
  shimmerStyle,
  cardAnimatedStyle,
  onCccdChange,
  onPasswordChange,
  onCccdFocus,
  onCccdBlur,
  onPasswordFocus,
  onPasswordBlur,
  onTogglePassword,
  onLogin,
}: LoginFormProps) {
  return (
    <AnimatedView
      entering={FadeInDown.delay(300).duration(800).springify()}
      style={styles.formContainer}
    >
      <AnimatedView style={cardAnimatedStyle}>
        <View style={styles.card}>
          {/* Glassmorphism overlay */}
          <View style={styles.cardOverlay} />

          {/* Error Message với animation */}
          {loginError && (
            <AnimatedView
              entering={FadeInDown.duration(300)}
              exiting={FadeInDown.duration(200)}
              style={styles.errorContainer}
            >
              <View style={styles.errorIcon}>
                <Text style={styles.errorIconText}>⚠️</Text>
              </View>
              <Text style={styles.errorText}>{loginError}</Text>
            </AnimatedView>
          )}

          {/* CCCD Input với focus animation */}
          <AnimatedView style={cccdInputStyle}>
            <TextInput
              label="Số CCCD"
              value={cccd}
              onChangeText={onCccdChange}
              onFocus={onCccdFocus}
              onBlur={onCccdBlur}
              mode="outlined"
              style={styles.input}
              contentStyle={styles.inputContent}
              outlineColor={cccdFocused ? theme.colors.primary : theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="numeric"
              disabled={isSubmitting}
              left={
                <TextInput.Icon 
                  icon="card-account-details" 
                  color={cccdFocused ? theme.colors.primary : theme.colors.text.secondary}
                />
              }
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  onSurface: theme.colors.text.primary,
                },
              }}
            />
          </AnimatedView>

          {/* Password Input với focus animation */}
          <AnimatedView style={passwordInputStyle}>
            <TextInput
              label="Mật khẩu"
              value={password}
              onChangeText={onPasswordChange}
              onFocus={onPasswordFocus}
              onBlur={onPasswordBlur}
              mode="outlined"
              style={styles.input}
              contentStyle={styles.inputContent}
              outlineColor={passwordFocused ? theme.colors.primary : theme.colors.border}
              activeOutlineColor={theme.colors.primary}
              secureTextEntry={!showPassword}
              disabled={isSubmitting}
              left={
                <TextInput.Icon 
                  icon="lock" 
                  color={passwordFocused ? theme.colors.primary : theme.colors.text.secondary}
                />
              }
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  color={passwordFocused ? theme.colors.primary : theme.colors.text.secondary}
                  onPress={onTogglePassword}
                />
              }
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  onSurface: theme.colors.text.primary,
                },
              }}
            />
          </AnimatedView>

          {/* Login Button với gradient và shimmer effect */}
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity
              onPress={onLogin}
              disabled={isSubmitting}
              activeOpacity={0.8}
              style={styles.buttonContainer}
            >
              {/* Gradient Background */}
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginButtonGradient}
              >
                {/* Shimmer overlay */}
                <Animated.View
                  style={[
                    styles.shimmer,
                    shimmerStyle,
                  ]}
                />
                
                {/* Button Content */}
                <View style={styles.loginButtonContent}>
                  {isSubmitting ? (
                    <View style={styles.buttonLoadingContent}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={[styles.loginButtonLabel, { marginLeft: theme.spacing.sm }]}>Đang đăng nhập...</Text>
                    </View>
                  ) : (
                    <Text style={styles.loginButtonLabel}>Đăng nhập</Text>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </AnimatedView>
    </AnimatedView>
  );
}

