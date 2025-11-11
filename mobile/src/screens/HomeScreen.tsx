import React from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import NhanDanNews from '../components/NhanDanNews';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/trang_chu.png')}
        style={styles.headerImage}
        resizeMode="contain"
      />
      <View style={styles.content}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <NhanDanNews />
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  headerImage: {
    width: '100%',
    marginTop: -235,
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 0,
  },
  content: {
    marginTop: 0,
    width: '100%',
    flex: 1,
    paddingTop: 150,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'flex-start',
  },
});