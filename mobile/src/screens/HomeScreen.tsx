import React from 'react';
import { View, StyleSheet, Image } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/trang_chu.png')}
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
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  headerImage: {
    width: '100%',
    marginTop: -235,
  },
  content: {
    marginTop: 32,
    width: '100%',
    alignItems: 'center',
  },
});