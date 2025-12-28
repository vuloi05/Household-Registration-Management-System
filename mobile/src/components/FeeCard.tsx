import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { type KhoanThu } from '../api/khoanThuApi';
import { appTheme as theme } from '../theme';

interface FeeCardProps {
  khoanThu: KhoanThu;
  index: number;
  onPress?: () => void;
}

const FeeCard: React.FC<FeeCardProps> = ({ khoanThu, index, onPress }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const animatedCardStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const isBatBuoc = khoanThu.loaiKhoanThu === 'BAT_BUOC';
  const iconName = isBatBuoc ? 'alert-circle' : 'heart-outline';
  const iconColor = isBatBuoc ? theme.colors.error : theme.colors.primary;
  const tagText = isBatBuoc ? 'Bắt buộc' : 'Đóng góp';

  const formatCurrency = (value: number | null | undefined) => {
    if (value == null || isNaN(value)) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Animated.View style={[styles.cardContainer, { marginTop: index === 0 ? 0 : 12 }, animatedCardStyle]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={styles.cardTouchable}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={iconName} size={28} color={iconColor} />
        </View>

        <View style={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                    {khoanThu.tenKhoanThu}
                </Text>
                <View style={[styles.tag, { backgroundColor: `${iconColor}20` }]}>
                    <Text style={[styles.tagText, { color: iconColor }]}>{tagText}</Text>
                </View>
            </View>
          
            <View style={styles.footer}>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="cash" size={16} color={theme.colors.text.secondary} />
                    <Text style={styles.detailText}>{formatCurrency(khoanThu.soTienTrenMotNhanKhau)}</Text>
                </View>
                <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="calendar-range" size={16} color={theme.colors.text.secondary} />
                    <Text style={styles.detailText}>Ngày tạo: {formatDate(khoanThu.ngayTao)}</Text>
                </View>
            </View>
        </View>

        <View style={styles.chevronContainer}>
            <MaterialCommunityIcons name="chevron-right" size={28} color={theme.colors.text.disabled} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: '#fff',
        borderRadius: theme.borderRadius.large,
        ...theme.shadows.medium,
        elevation: 3,
    },
    cardTouchable: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F4F6F8',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.md,
    },
    contentContainer: {
        flex: 1,
    },
    header: {
        marginBottom: theme.spacing.md,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: theme.spacing.xs,
    },
    tag: {
        alignSelf: 'flex-start',
        borderRadius: theme.borderRadius.small,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    tagText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    footer: {
        borderTopWidth: 1,
        borderColor: theme.colors.border,
        paddingTop: theme.spacing.sm,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    detailText: {
        marginLeft: theme.spacing.sm,
        fontSize: 14,
        color: theme.colors.text.secondary,
    },
    chevronContainer: {
        marginLeft: theme.spacing.sm,
    }
});

export default FeeCard;

