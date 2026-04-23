import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { socialApi } from '../services/api';

interface Post {
  id: string;
  title: string;
  content: string;
  images: string[];
  user: { nickname: string; avatar: string };
  likeCount: number;
  commentCount: number;
  isLiked?: boolean;
}

interface Topic {
  id: string;
  name: string;
  postCount: number;
}

export default function SocialScreen() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    loadTopics();
    loadPosts();
  }, []);

  const loadTopics = async () => {
    try {
      // TODO: 调用真实 API
      // const res = await socialApi.getTopics();
      // if (res.code === 0) setTopics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadPosts = async () => {
    try {
      // TODO: 调用真实 API
      // const res = await socialApi.getPosts({ topicId: selectedTopic });
      // if (res.code === 0) setPosts(res.data.list);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await socialApi.likePost(postId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const renderTopic = ({ item }: { item: Topic }) => (
    <TouchableOpacity
      style={[styles.topicChip, selectedTopic === item.id && styles.topicChipActive]}
      onPress={() => {
        setSelectedTopic(selectedTopic === item.id ? null : item.id);
        loadPosts();
      }}
    >
      <Text style={[styles.topicText, selectedTopic === item.id && styles.topicTextActive]}>
        #{item.name}
      </Text>
      <Text style={styles.topicCount}>{item.postCount}</Text>
    </TouchableOpacity>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.avatar}>
          <Text>{item.user?.nickname?.[0] || 'U'}</Text>
        </View>
        <View style={styles.postUserInfo}>
          <Text style={styles.nickname}>{item.user?.nickname || 'user'}</Text>
          <Text style={styles.postTime}>刚刚</Text>
        </View>
      </View>

      <Text style={styles.postTitle}>{item.title}</Text>
      <Text style={styles.postContent} numberOfLines={3}>
        {item.content}
      </Text>

      {item.images?.length > 0 && (
        <View style={styles.imageGrid}>
          {item.images.slice(0, 3).map((img, idx) => (
            <Image key={idx} style={styles.postImage} source={{ uri: img }} />
          ))}
        </View>
      )}

      <View style={styles.postActions}>
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
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>社群</Text>
      </View>

      <View style={styles.topicContainer}>
        <FlatList
          horizontal
          data={topics}
          renderItem={renderTopic}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.topicList}
        />
      </View>

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.postList}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  topicContainer: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  topicList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  topicChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  topicChipActive: {
    backgroundColor: '#e6f7ff',
  },
  topicText: {
    fontSize: 14,
    color: '#666',
  },
  topicTextActive: {
    color: '#1890ff',
  },
  topicCount: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  postList: {
    padding: 16,
    gap: 12,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1890ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postUserInfo: {
    marginLeft: 10,
  },
  nickname: {
    fontSize: 14,
    fontWeight: '600',
  },
  postTime: {
    fontSize: 12,
    color: '#999',
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  postImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  postActions: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1890ff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    lineHeight: 36,
  },
});
