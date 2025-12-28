import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/SettingsScreen';
import AccountScreen from '../screens/AccountScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import { appTheme } from '../theme';

// Mở rộng param list để bao gồm các màn hình mới
export type SettingsStackParamList = {
  SettingsMain: undefined;
  Account: undefined;
  ChangePassword: undefined;
};

const Stack = createStackNavigator<SettingsStackParamList>();

export default function SettingsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: appTheme.colors.paper,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: appTheme.colors.text.primary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="SettingsMain" 
        component={SettingsScreen}
        options={{
            headerShown: false, // Ẩn header cho màn hình settings chính
        }}
      />
      <Stack.Screen 
        name="Account" 
        component={AccountScreen}
        options={{
            title: 'Thông tin tài khoản',
        }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{
            title: 'Đổi mật khẩu',
        }}
      />
    </Stack.Navigator>
  );
}

