// src/utils/alert.ts
// Cross-platform alert utility that works on both native and web

import { Alert, Platform } from 'react-native';

interface AlertButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

/**
 * Cross-platform alert that uses native Alert on mobile and window.confirm/alert on web.
 */
export function crossPlatformAlert(
    title: string,
    message?: string,
    buttons?: AlertButton[]
): void {
    if (Platform.OS === 'web') {
        // Web: use window.alert or window.confirm
        if (!buttons || buttons.length <= 1) {
            // Simple alert with OK button
            window.alert(message ? `${title}\n\n${message}` : title);
            // Call the onPress of the first button if it exists
            buttons?.[0]?.onPress?.();
        } else {
            // Confirm dialog with Cancel + OK
            const cancelButton = buttons.find(b => b.style === 'cancel');
            const actionButton = buttons.find(b => b.style !== 'cancel') || buttons[buttons.length - 1];

            const confirmed = window.confirm(message ? `${title}\n\n${message}` : title);
            if (confirmed) {
                actionButton?.onPress?.();
            } else {
                cancelButton?.onPress?.();
            }
        }
    } else {
        // Native: use React Native Alert
        Alert.alert(title, message, buttons);
    }
}
