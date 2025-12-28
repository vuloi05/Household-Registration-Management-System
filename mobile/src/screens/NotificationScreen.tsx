import React, { useState } from 'react';
import { View, StyleSheet, Image, FlatList, Text, TouchableOpacity } from 'react-native';
import { List, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { appTheme as theme } from '../theme';
import type { RootStackParamList, Notification } from '../navigation/types';


// TODO: Replace with real data from a backend API
const staticNotifications: Notification[] = [
  {
    id: '1',
    type: 'payment_success',
    title: 'Thanh toán thành công',
    description: 'Bạn đã thanh toán thành công khoản phí Vệ sinh môi trường tháng 12. Số tiền: 30,000 VNĐ. Cảm ơn bạn đã hoàn thành nghĩa vụ.',
    time: '2 giờ trước',
    read: false,
  },
  {
    id: '2',
    type: 'new_fee',
    title: 'Thông báo khoản thu mới',
    description: 'Đã có khoản thu mới: Quỹ khuyến học năm 2025. Vui lòng kiểm tra và thanh toán trước ngày 15/01/2026.',
    time: '1 ngày trước',
    read: false,
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Nhắc nhở thanh toán',
    description: 'Khoản thu "Ủng hộ đồng bào lũ lụt" sắp hết hạn. Vui lòng thanh toán trước ngày 30/12/2025 để tránh phát sinh phí.',
    time: '3 ngày trước',
    read: true,
  },
  {
    id: '4',
    type: 'system',
    title: 'Cập nhật hệ thống',
    description: 'Ứng dụng sẽ được bảo trì vào 02:00 sáng ngày 29/12/2025 để nâng cao chất lượng dịch vụ. Mọi hoạt động sẽ tạm ngưng trong khoảng 15 phút. Xin cảm ơn.',
    time: '4 ngày trước',
    read: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'Thông báo họp tổ dân phố',
    description: 'Kính mời các hộ gia đình tham dự buổi họp tổng kết năm 2025 vào 19:00 ngày 31/12/2025 tại nhà văn hóa khu dân cư. Nội dung: Báo cáo tổng kết và kế hoạch năm mới.',
    time: '1 tuần trước',
    read: true,
  },
];

const getIconForType = (type: string) => {
  switch (type) {
    case 'payment_success':
      return 'check-circle';
    case 'new_fee':
      return 'cash-plus';
    case 'reminder':
      return 'alert-circle-outline';
    case 'system':
      return 'cog';
    case 'info':
      return 'information-outline';
    default:
      return 'bell-outline';
  }
};

const getColorForType = (type: string) => {
    switch (type) {
      case 'payment_success':
        return theme.colors.success;
      case 'new_fee':
        return theme.colors.primary;
      case 'reminder':
        return theme.colors.warning;
      case 'system':
        return theme.colors.info;
      default:
        return theme.colors.text.secondary;
    }
  };

type NotificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MainTabs'>;

export default function NotificationScreen() {
    const [notifications, setNotifications] = useState(staticNotifications);
    const navigation = useNavigation<NotificationScreenNavigationProp>();

    const handlePressNotification = (item: Notification) => {
        // Mark notification as read
        const newNotifications = notifications.map(n => 
            n.id === item.id ? { ...n, read: true } : n
        );
        setNotifications(newNotifications);

        // Navigate to detail screen
        navigation.navigate('NotificationDetail', { notification: item });
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

  const renderItem = ({ item }: { item: Notification }) => (
    <List.Item
      title={item.title}
      description={item.description}
      titleNumberOfLines={1}
      descriptionNumberOfLines={2}
      titleStyle={[styles.itemTitle, !item.read && styles.itemUnread]}
      descriptionStyle={styles.itemDescription}
      style={[styles.listItem, !item.read && styles.listItemUnread]}
      left={props => <List.Icon {...props} icon={getIconForType(item.type)} color={getColorForType(item.type)} />}
      right={() => (
          <View style={styles.itemRight}>
            <Text style={styles.itemTime}>{item.time}</Text>
            {!item.read && <View style={styles.unreadDot} />}
          </View>
      )}
      onPress={() => handlePressNotification(item)}
    />
  );

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/thong_bao.jpg')}
        style={styles.headerImage}
        resizeMode="contain"
      />
      <View style={styles.content}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Thông báo</Text>
            <TouchableOpacity onPress={markAllAsRead}>
                <Text style={styles.markAllReadText}>Đánh dấu tất cả là đã đọc</Text>
            </TouchableOpacity>
        </View>
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<View style={styles.emptyContainer}><Text>Không có thông báo mới.</Text></View>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerImage: {
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    marginTop: -235,
    zIndex: 0,
  },
  content: {
    flex: 1,
    width: '100%',
    paddingTop: 140, // Adjust to be below the header image
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
  },
  markAllReadText: {
    color: theme.colors.primary,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: 20,
    backgroundColor: theme.colors.paper,
  },
  listItem: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: '#fff',
  },
  listItemUnread: {
    backgroundColor: '#F8F9FF',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  itemUnread: {
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  itemDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  itemRight: {
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
      paddingLeft: theme.spacing.sm,
  },
  itemTime: {
      fontSize: 12,
      color: theme.colors.text.disabled,
      marginBottom: theme.spacing.xs,
  },
  unreadDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.primary,
      marginTop: theme.spacing.xs,
  },
  divider: {
    backgroundColor: theme.colors.divider,
    height: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    height: 200,
  }
});

