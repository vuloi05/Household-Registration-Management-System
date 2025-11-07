import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Text, Platform, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { appTheme as theme } from '../theme';

// Import các màn hình
import HomeScreen from '../screens/HomeScreen';
import WalletScreen from '../screens/WalletScreen';
import NotificationScreen from '../screens/NotificationScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Custom Tab Bar Component với hiệu ứng 3D bong bóng
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const scale = useSharedValue(isFocused ? 1 : 0.85);
          const elevation = useSharedValue(isFocused ? 12 : 4);
          const opacity = useSharedValue(isFocused ? 1 : 0.6);
          const pressScale = useSharedValue(1);

          React.useEffect(() => {
            scale.value = withSpring(isFocused ? 1 : 0.85, {
              damping: 15,
              stiffness: 150,
            });
            elevation.value = withTiming(isFocused ? 12 : 4, { duration: 300 });
            opacity.value = withTiming(isFocused ? 1 : 0.6, { duration: 300 });
          }, [isFocused]);

          const animatedBubbleStyle = useAnimatedStyle(() => {
            const combinedScale = scale.value * pressScale.value;
            return {
              transform: [{ scale: combinedScale }],
              elevation: elevation.value,
              opacity: opacity.value,
            };
          });

          const animatedIconStyle = useAnimatedStyle(() => {
            const iconScale = interpolate(scale.value, [0.85, 1], [1, 1.1]);
            return {
              transform: [{ scale: iconScale }],
            };
          });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onPressIn = () => {
            pressScale.value = withSpring(0.9, {
              damping: 15,
              stiffness: 300,
            });
          };

          const onPressOut = () => {
            pressScale.value = withSpring(1, {
              damping: 15,
              stiffness: 300,
            });
          };

          // Icon mapping
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap = 'home';
          let label = '';
          
          switch (route.name) {
            case 'Home':
              iconName = isFocused ? 'home' : 'home-outline';
              label = 'Trang chủ';
              break;
            case 'Wallet':
              iconName = 'wallet-outline';
              label = 'Ví giấy tờ';
              break;
            case 'Notification':
              iconName = 'bell-outline';
              label = 'Thông báo';
              break;
            case 'Settings':
              iconName = 'cog-outline';
              label = 'Cài đặt';
              break;
          }

          const iconColor = isFocused ? '#FFFFFF' : '#9E9E9E';
          const textColor = isFocused ? theme.colors.primary : '#9E9E9E';

          return (
            <AnimatedPressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              style={[styles.tabItem, animatedBubbleStyle]}
            >
              <View style={styles.bubbleWrapper}>
                {isFocused ? (
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.bubbleGradient}
                  >
                    <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                      <MaterialCommunityIcons 
                        name={iconName} 
                        size={24} 
                        color={iconColor} 
                      />
                    </Animated.View>
                  </LinearGradient>
                ) : (
                  <View style={styles.bubbleInactive}>
                    <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                      <MaterialCommunityIcons 
                        name={iconName} 
                        size={24} 
                        color={iconColor} 
                      />
                    </Animated.View>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, { color: textColor }]}>
                {label}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>
    </View>
  );
}

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Notification" component={NotificationScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: 'transparent',
    paddingBottom: Platform.OS === 'ios' ? 30 : 40,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 8,
    paddingVertical: 8,
    // Shadow 3D effect
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  bubbleWrapper: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubbleGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow 3D cho bong bóng active - tạo hiệu ứng nổi bật
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
      },
      android: {
        elevation: 10,
        shadowColor: theme.colors.primary,
      },
    }),
  },
  bubbleInactive: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    // Shadow nhẹ cho bong bóng inactive - tạo độ sâu nhẹ
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
    textAlign: 'center',
  },
});

