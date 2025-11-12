import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Linking } from 'react-native';

type NewsItem = {
  id: string;
  title: string;
  link: string;
  pubDate?: string;
  image?: string;
};

const RSS_CANDIDATES = [
  'https://nhandan.vn/rss/home.rss',
  'https://nhandan.vn/rss/trang-chu.rss',
];

function parseRss(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let itemMatch: RegExpExecArray | null;
  while ((itemMatch = itemRegex.exec(xml)) !== null) {
    const block = itemMatch[1];
    const title = decodeHtml(extractTag(block, 'title'));
    const link = extractTag(block, 'link');
    const pubDate = extractTag(block, 'pubDate');
    const description = extractTag(block, 'description');
    const enclosureUrl = extractEnclosure(block);
    const imgFromDesc = extractFirstImg(description);
    if (title && link) {
      items.push({
        id: link,
        title,
        link,
        pubDate,
        image: enclosureUrl || imgFromDesc,
      });
    }
  }
  return items;
}

function extractTag(src: string, tag: string): string {
  const re = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = re.exec(src);
  if (!m) return '';
  return m[1].trim();
}

function extractEnclosure(src: string): string | undefined {
  const m = /<enclosure[^>]*url="([^"]+)"/i.exec(src);
  return m ? m[1] : undefined;
}

function extractFirstImg(html: string): string | undefined {
  const m = /<img[^>]*src="([^"]+)"/i.exec(html || '');
  return m ? m[1] : undefined;
}

function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export default function NhanDanNews() {
  const [articles, setArticles] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      for (const url of RSS_CANDIDATES) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 8000);
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timer);
          if (!res.ok) continue;
          const xml = await res.text();
          const parsed = parseRss(xml);
          if (mounted && parsed.length > 0) {
            setArticles(parsed.slice(0, 10));
            break;
          }
        } catch (_) {
          // try next candidate
        } finally {
          setLoading(false);
        }
      }
      setLoading(false);
    };
    load();
    const interval = setInterval(load, 30 * 60 * 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const header = useMemo(() => {
    return (
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Trang thông tin Báo Nhân Dân</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://nhandan.vn/')}>
          <Text style={styles.seeMore}>Xem thêm</Text>
        </TouchableOpacity>
      </View>
    );
  }, []);

  return (
    <View style={styles.container}>
      {header}
      <View style={styles.banner}>
        <Image source={require('../../assets/icon_co.png')} style={styles.bannerIcon} />
        <Text style={styles.bannerText} numberOfLines={1} ellipsizeMode="tail">ĐẠI HỘI ĐẢNG TOÀN QUỐC LẦN THỨ XIV</Text>
      </View>
      <View style={styles.panel}>
        <FlatList
          horizontal
          data={articles}
          keyExtractor={(i) => i.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>{loading ? 'Đang tải...' : 'Không có dữ liệu'}</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => Linking.openURL(item.link)}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.cardImage} />
              ) : (
                <View style={styles.cardImagePlaceholder} />
              )}
              <Text numberOfLines={2} style={styles.cardTitle}>
                {item.title}
              </Text>
              {item.pubDate ? <Text style={styles.cardMeta}>{formatPubDate(item.pubDate)}</Text> : null}
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

function formatPubDate(input: string): string {
  const date = new Date(input);
  if (isNaN(date.getTime())) return input;
  const hh = date.getHours().toString().padStart(2, '0');
  const mm = date.getMinutes().toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  const mo = (date.getMonth() + 1).toString().padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${hh}:${mm} ${dd}-${mo}-${yyyy}`;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 0,
    marginTop: 8,
  },
  panel: {
    backgroundColor: '#FCEFD4',
    borderRadius: 10,
    paddingTop: 12,
    paddingRight: 12,
    paddingBottom: 12,
    paddingLeft: 12,
    marginTop: 1,
    width: '100%',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  seeMore: {
    fontSize: 14,
    color: '#e11b22',
    fontWeight: '600',
  },
  banner: {
    width: '100%',
    backgroundColor: '#FFF5CC',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    paddingLeft: 15,
    alignItems: 'center',
    position: 'relative',
    marginBottom: 0,
  },
  bannerIcon: {
    width: 26,
    height: 26,
    position: 'absolute',
    top: -6,
    left: 2,
    resizeMode: 'contain',
  },
  bannerText: {
    flex: 1,
    color: '#E11B22',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  listContent: {
    paddingRight: 8,
  },
  emptyText: {
    color: '#666',
    paddingVertical: 20,
  },
  card: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
    marginBottom: 6,
  },
  cardMeta: {
    fontSize: 12,
    color: '#777',
  },
});


