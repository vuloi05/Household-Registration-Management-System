import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/SettingsScreen';
import BankAccountScreen from '../screens/BankAccountScreen';

export type SettingsStackParamList = {
  SettingsMain: undefined;
  BankAccount: undefined;
};

const Stack = createStackNavigator<SettingsStackParamList>();

export default function SettingsStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="BankAccount" component={BankAccountScreen} />
    </Stack.Navigator>
  );
}

