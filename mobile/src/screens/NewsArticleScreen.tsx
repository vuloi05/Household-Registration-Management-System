import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Platform } from 'react-native';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';

// WebView chỉ import trên native (không hỗ trợ web)
let WebView: any = null;
if (Platform.OS !== 'web') {
  WebView = require('react-native-webview').WebView;
}

type Props = StackScreenProps<RootStackParamList, 'NewsArticle'>;

export default function NewsArticleScreen({ route }: Props) {
  const { url } = route.params;
  const [loading, setLoading] = useState(true);

  const source = useMemo(() => ({ uri: url }), [url]);

  // Web: dùng iframe thay cho WebView
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <iframe
          src={url}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="News Article"
          onLoad={() => setLoading(false)}
        />
        {loading && (
          <View pointerEvents="none" style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#E11B22" />
          </View>
        )}
      </View>
    );
  }

  // Native: dùng WebView
  return (
    <View style={styles.container}>
      <WebView
        source={source}
        startInLoadingState
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        allowsBackForwardNavigationGestures
        setSupportMultipleWindows={false}
        renderLoading={() => (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#E11B22" />
          </View>
        )}
      />
      {loading ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#E11B22" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});
