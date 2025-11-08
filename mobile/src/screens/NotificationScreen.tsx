import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

export default function NotificationScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/thong_bao.jpg')}
        style={styles.headerImage}
        resizeMode="contain"
      />
      <View style={styles.content}>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  headerImage: {
    width: '100%',
    maxWidth: 380,
    marginTop: -235,
  },
  content: {
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
});

