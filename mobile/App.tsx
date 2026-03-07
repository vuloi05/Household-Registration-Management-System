import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet, View, Platform } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { paperTheme } from './src/theme';
import NewsArticleScreen from './src/screens/NewsArticleScreen';
import NotificationDetailScreen from './src/screens/NotificationDetailScreen';
import type { RootStackParamList } from './src/navigation/types';

const RootStack = createStackNavigator<RootStackParamList>();

// Main App Content - chỉ hiển thị sau khi AuthProvider đã sẵn sàng
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Có thể hiển thị splash screen hoặc loading indicator ở đây
    return null;
  }

  // Nếu chưa đăng nhập, hiển thị LoginScreen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Nếu đã đăng nhập, hiển thị màn hình chính với bottom tab navigation
  return (
    <NavigationContainer>
      <RootStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: paperTheme.colors.surface,
          },
          headerTintColor: paperTheme.colors.onSurface,
          headerBackTitleVisible: false,
        }}
      >
        <RootStack.Screen
          name="MainTabs"
          component={BottomTabNavigator}
          options={{ headerShown: false }}
        />
        <RootStack.Screen
          name="NewsArticle"
          component={NewsArticleScreen}
          options={({ route }) => ({
            headerShown: true,
            title: route.params.title ? route.params.title : 'Chi tiết thông tin',
          })}
        />
        <RootStack.Screen
          name="NotificationDetail"
          component={NotificationDetailScreen}
          options={({ route }) => ({
            headerShown: true,
            title: route.params.notification.title,
          })}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

// Web wrapper - giới hạn chiều rộng giống điện thoại khi xem trên desktop
function WebResponsiveWrapper({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <View style={webStyles.outerContainer}>
      <View style={webStyles.phoneFrame}>
        {children}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <WebResponsiveWrapper>
        <SafeAreaProvider>
          <PaperProvider theme={paperTheme}>
            <AuthProvider>
              <AppContent />
              <StatusBar style="auto" />
            </AuthProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </WebResponsiveWrapper>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' ? { backgroundColor: '#f0f0f5' } : {}),
  },
});

const webStyles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f0f0f5',
  },
  phoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#ffffff',
    ...(Platform.OS === 'web'
      ? {
        // @ts-ignore - web-only CSS properties
        boxShadow: '0 0 30px rgba(0,0,0,0.15)',
        overflowY: 'auto',
      }
      : {}),
  },
});
