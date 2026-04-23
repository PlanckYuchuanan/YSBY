import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { videoApi } from '../services/api';

const { width, height } = Dimensions.get('window');

interface Video {
  id: string;
  title: string;
  videoUrl: string;
  coverUrl: string;
  user: { nickname: string; avatar: string };
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
}

export default function VideoFeedScreen() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const loadVideos = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // TODO: 调用真实 API
      // const res = await videoApi.getVideos({ page: 1, pageSize: 10 });
      // if (res.code === 0) {
      //   setVideos(res.data.list);
      // }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (videoId: string) => {
    try {
      await videoApi.likeVideo(videoId);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === videoId
            ? { ...v, isLiked: !v.isLiked, likeCount: v.isLiked ? v.likeCount - 1 : v.likeCount + 1 }
            : v
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const renderVideo = ({ item }: { item: Video }) => (
    <View style={styles.videoContainer}>
      <View style={styles.coverPlaceholder}>
        <Text style={styles.coverText}>视频封面</Text>
        <Text style={styles.videoTitle}>{item.title}</Text>
      </View>

      <View style={styles.sideActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(item.id)}>
          <Text style={styles.actionIcon}>{item.isLiked ? '❤️' : '🤍'}</Text>
          <Text style={styles.actionText}>{item.likeCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{item.commentCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>分享</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.avatar}>
          <Text>{item.user?.nickname?.[0] || 'U'}</Text>
        </View>
        <Text style={styles.nickname}>@{item.user?.nickname || 'user'}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && videos.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      ) : videos.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎬</Text>
          <Text style={styles.emptyText}>暂无视频</Text>
          <TouchableOpacity style={styles.refreshBtn} onPress={loadVideos}>
            <Text style={styles.refreshBtnText}>刷新</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={videos}
          renderItem={renderVideo}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.y / height);
            setCurrentIndex(index);
          }}
          onEndReached={loadVideos}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    width,
    height,
    position: 'relative',
  },
  coverPlaceholder: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverText: {
    color: '#666',
    fontSize: 24,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  sideActions: {
    position: 'absolute',
    right: 12,
    bottom: 100,
    alignItems: 'center',
    gap: 20,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  userInfo: {
    position: 'absolute',
    bottom: 50,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1890ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nickname: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  refreshBtn: {
    marginTop: 20,
    backgroundColor: '#1890ff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
  },
  refreshBtnText: {
    color: '#fff',
    fontSize: 14,
  },
});
