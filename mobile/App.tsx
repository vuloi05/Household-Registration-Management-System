import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import { paperTheme } from './src/theme';
import NewsArticleScreen from './src/screens/NewsArticleScreen';
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
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="MainTabs" component={BottomTabNavigator} />
        <RootStack.Screen
          name="NewsArticle"
          component={NewsArticleScreen}
          options={({ route }) => ({
            headerShown: true,
            title: route.params.title ? route.params.title : 'Chi tiết thông tin',
            headerBackTitleVisible: false,
          })}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <AuthProvider>
            <AppContent />
            <StatusBar style="auto" />
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
