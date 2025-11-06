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
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ImageBackground,
  TouchableWithoutFeedback,
} from 'react-native';
import { TextInput } from 'react-native-paper';
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

const { width, height } = Dimensions.get('window');
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

// Component cho floating particle
function FloatingParticle({ index, left, top }: { index: number; left: number; top: number }) {
  const translateY = useSharedValue(0);
  
  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 2000 + index * 200 }),
        withTiming(0, { duration: 2000 + index * 200 })
      ),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <AnimatedView
      style={[
        styles.particle,
        {
          left,
          top,
          opacity: 0.3,
        },
        animatedStyle,
      ]}
    />
  );
}

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
          top={(30 + i * 10) * (height / 100)}
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
                    onChangeText={(text) => {
                      setCccd(text);
                      setLoginError(null);
                    }}
                    onFocus={() => setCccdFocused(true)}
                    onBlur={() => setCccdFocused(false)}
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
                    onChangeText={(text) => {
                      setPassword(text);
                      setLoginError(null);
                    }}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
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
                        onPress={() => setShowPassword(!showPassword)}
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
                    onPress={handleLogin}
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
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    minHeight: height,
  },
  splashCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    zIndex: 10,
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.large,
    elevation: 15,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoGlow: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: theme.colors.primary,
    opacity: 0.5,
    ...theme.shadows.large,
  },
  logoText: {
    fontSize: 70,
    zIndex: 1,
  },
  logoImage: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    zIndex: 1,
  },
  title: {
    ...theme.typography.h2,
    color: '#ffffff',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...theme.typography.body2,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontSize: 15,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  formContainer: {
    width: '100%',
    zIndex: 10,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    ...theme.shadows.large,
    elevation: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: theme.borderRadius.large,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.small,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  errorIcon: {
    marginRight: theme.spacing.sm,
  },
  errorIconText: {
    fontSize: 20,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  input: {
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  inputContent: {
    fontSize: 16,
  },
  buttonContainer: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    ...theme.shadows.large,
    elevation: 8,
  },
  loginButtonGradient: {
    borderRadius: theme.borderRadius.medium,
    overflow: 'hidden',
    position: 'relative',
  },
  loginButtonContent: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLoadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonLabel: {
    ...theme.typography.button,
    color: theme.colors.paper,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 1,
    borderRadius: theme.borderRadius.medium,
  },
});

