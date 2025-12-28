// src/screens/NotificationDetailScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Card, Title, Paragraph, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { appTheme as theme } from '../theme';
import type { RootStackParamList, Notification } from '../navigation/types';

type NotificationDetailScreenRouteProp = RouteProp<RootStackParamList, 'NotificationDetail'>;

const getIconForType = (type: string) => {
    switch (type) {
      case 'payment_success': return 'check-circle';
      case 'new_fee': return 'cash-plus';
      case 'reminder': return 'alert-circle-outline';
      case 'system': return 'cog';
      case 'info': return 'information-outline';
      default: return 'bell-outline';
    }
};
  
const getColorForType = (type: string) => {
    switch (type) {
        case 'payment_success': return theme.colors.success;
        case 'new_fee': return theme.colors.primary;
        case 'reminder': return theme.colors.warning;
        case 'system': return theme.colors.info;
        default: return theme.colors.text.secondary;
    }
};

export default function NotificationDetailScreen() {
  const route = useRoute<NotificationDetailScreenRouteProp>();
  const { notification } = route.params;

  return (
    <ScrollView style={styles.container}>
        <View style={styles.header}>
            <MaterialCommunityIcons 
                name={getIconForType(notification.type)} 
                size={48} 
                color={getColorForType(notification.type)} 
            />
            <Title style={styles.title}>{notification.title}</Title>
            <Text style={styles.timestamp}>{notification.time}</Text>
        </View>
        <Card style={styles.card}>
            <Card.Content>
                <Paragraph style={styles.content}>
                    {notification.description}
                </Paragraph>
            </Card.Content>
        </Card>
        <Card style={styles.card}>
            <Card.Content>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>ID thông báo:</Text>
                    <Text style={styles.detailValue}>{notification.id}</Text>
                </View>
                <Divider style={styles.divider}/>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Loại:</Text>
                    <Text style={styles.detailValue}>{notification.type}</Text>
                </View>
            </Card.Content>
        </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
      backgroundColor: theme.colors.paper,
      padding: theme.spacing.lg,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderColor: theme.colors.divider,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  timestamp: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      marginTop: theme.spacing.sm,
  },
  card: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderRadius: theme.borderRadius.medium,
      elevation: 1,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text.primary,
  },
  detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
  },
  detailLabel: {
      fontSize: 14,
      color: theme.colors.text.secondary,
  },
  detailValue: {
      fontSize: 14,
      fontWeight: '500',
  },
  divider: {
      marginVertical: theme.spacing.xs,
  }
});
