// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
  ImageBackground,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { appTheme as theme } from '../theme';
import FloatingParticle from '../components/FloatingParticle';
import LoginForm from '../components/LoginForm';
import { styles } from './LoginScreen.styles';

const { width } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

export default function LoginScreen() {
  const [cccd, setCccd] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cccdFocused, setCccdFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  
  const insets = useSafeAreaInsets();
  const { mobileLogin } = useAuth();
  
  // Animation values
  const logoScale = useSharedValue(1);
  const logoRotation = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);
  const shimmerOffset = useSharedValue(-width);
  const pulseScale = useSharedValue(1);

  // Khởi tạo animations
  useEffect(() => {
    // Logo pulse animation
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );

    // Card entrance animation
    cardScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    cardOpacity.value = withTiming(1, { duration: 600 });

    // Shimmer effect trên button
    shimmerOffset.value = withRepeat(
      withTiming(width * 2, { duration: 2000 }),
      -1,
      false
    );

    // Pulse animation cho background
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 3000 }),
        withTiming(1, { duration: 3000 })
      ),
      -1,
      true
    );
  }, []);

  const handleLogin = async () => {
    if (!cccd.trim() || !password.trim()) {
      setLoginError('Vui lòng nhập đầy đủ thông tin');
      // Shake animation cho error
      cardScale.value = withSequence(
        withTiming(0.98, { duration: 100 }),
        withSpring(1, { damping: 10 })
      );
      return;
    }

    setLoginError(null);
    setIsSubmitting(true);
    
    // Button press animation
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 10 }),
      withSpring(1.02, { damping: 10 }),
      withSpring(1, { damping: 10 })
    );
    buttonOpacity.value = withTiming(0.8);

    try {
      await mobileLogin(cccd.trim(), password);
      // Success animation sẽ được xử lý ở App.tsx khi navigate
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // Xử lý các loại lỗi khác nhau
      let errorMessage = "Số CCCD hoặc mật khẩu không chính xác.";
      
      if (error?.name === 'NetworkError' || error?.code === 'ERR_NETWORK' || error?.message?.includes('Network Error')) {
        errorMessage = "Không thể kết nối đến server.\n\nVui lòng kiểm tra:\n• Backend đã được khởi động chưa?\n• IP address có đúng không?\n• Có cùng mạng Wi-Fi không?";
      } else if (error?.name === 'TimeoutError' || error?.code === 'ECONNABORTED') {
        errorMessage = "Kết nối quá thời gian. Vui lòng thử lại.";
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setLoginError(errorMessage);
      // Shake animation
      cardScale.value = withSequence(
        withTiming(0.97, { duration: 100 }),
        withTiming(1.03, { duration: 100 }),
        withTiming(0.99, { duration: 100 }),
        withSpring(1, { damping: 10 })
      );
    } finally {
      setIsSubmitting(false);
      buttonOpacity.value = withTiming(1);
    }
  };

  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    opacity: buttonOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerOffset.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const cccdInputScale = useSharedValue(1);
  const passwordInputScale = useSharedValue(1);

  useEffect(() => {
    cccdInputScale.value = cccdFocused ? withSpring(1.02) : withSpring(1);
  }, [cccdFocused]);

  useEffect(() => {
    passwordInputScale.value = passwordFocused ? withSpring(1.02) : withSpring(1);
  }, [passwordFocused]);

  const cccdInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cccdInputScale.value }],
  }));

  const passwordInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: passwordInputScale.value }],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Animated Background Image */}
      <AnimatedImageBackground
        source={require('../../assets/login.png')}
        resizeMode="cover"
        style={[StyleSheet.absoluteFillObject, backgroundAnimatedStyle]}
      />
      
      {/* Overlay gradient for depth - only when showing login */}
      {showLogin && (
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.3)']}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      {/* Floating particles effect */}
      {[...Array(5)].map((_, i) => (
        <FloatingParticle
          key={i}
          index={i}
          left={(20 + i * 15) * (width / 100)}
          top={(30 + i * 10) * (Dimensions.get('window').height / 100)}
        />
      ))}

      {!showLogin ? (
        <TouchableWithoutFeedback onPress={() => setShowLogin(true)}>
          <View style={styles.splashCenter}>
            <AnimatedView
              entering={FadeInUp.duration(800).springify()}
              style={styles.logoContainer}
            >
              <AnimatedView
                style={[styles.logoCircle, logoAnimatedStyle]}
              >
                <AnimatedView style={[
                  styles.logoGlow,
                  logoAnimatedStyle,
                  !showLogin && { opacity: 0.8 },
                ]} />
                <Image
                  source={require('../../assets/icon.png')}
                  style={styles.logoImage}
                  resizeMode="cover"
                />
              </AnimatedView>
            </AnimatedView>
          </View>
        </TouchableWithoutFeedback>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo Section với enhanced animation - tap to return to splash */}
            <TouchableWithoutFeedback onPress={() => setShowLogin(false)}>
              <AnimatedView
                entering={FadeInUp.duration(800).springify()}
                style={styles.logoContainer}
              >
                <AnimatedView
                  style={[styles.logoCircle, logoAnimatedStyle]}
                >
                  {/* Glow effect */}
                  <AnimatedView style={[styles.logoGlow, logoAnimatedStyle]} />
                  <Image
                    source={require('../../assets/icon.png')}
                    style={styles.logoImage}
                    resizeMode="cover"
                  />
                </AnimatedView>
                
                <AnimatedText
                  entering={FadeInUp.delay(400).duration(600).springify()}
                  style={styles.title}
                >
                  Đăng nhập hệ thống
                </AnimatedText>
                <AnimatedText
                  entering={FadeInUp.delay(500).duration(600).springify()}
                  style={styles.subtitle}
                >
                  Quản lý hộ khẩu và nhân khẩu
                </AnimatedText>
              </AnimatedView>
            </TouchableWithoutFeedback>

            {/* Form Card với glassmorphism effect */}
            <LoginForm
              cccd={cccd}
              password={password}
              showPassword={showPassword}
              loginError={loginError}
              isSubmitting={isSubmitting}
              cccdFocused={cccdFocused}
              passwordFocused={passwordFocused}
              cccdInputStyle={cccdInputStyle}
              passwordInputStyle={passwordInputStyle}
              buttonAnimatedStyle={buttonAnimatedStyle}
              shimmerStyle={shimmerStyle}
              cardAnimatedStyle={cardAnimatedStyle}
              onCccdChange={(text) => {
                setCccd(text);
                setLoginError(null);
              }}
              onPasswordChange={(text) => {
                setPassword(text);
                setLoginError(null);
              }}
              onCccdFocus={() => setCccdFocused(true)}
              onCccdBlur={() => setCccdFocused(false)}
              onPasswordFocus={() => setPasswordFocused(true)}
              onPasswordBlur={() => setPasswordFocused(false)}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onLogin={handleLogin}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

