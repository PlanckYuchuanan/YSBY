import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>YSBY</Text>
        <Text style={styles.subtitle}>看视频，赚积分，兑好礼</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>快捷入口</Text>
        <View style={styles.grid}>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>🎬</Text>
            <Text style={styles.cardText}>刷视频</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>💬</Text>
            <Text style={styles.cardText}>聊天</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>📝</Text>
            <Text style={styles.cardText}>社群</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card}>
            <Text style={styles.cardIcon}>🛒</Text>
            <Text style={styles.cardText}>商城</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>积分任务</Text>
        <View style={styles.taskList}>
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>观看视频</Text>
            <Text style={styles.taskPoints}>+10积分</Text>
          </View>
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>点赞视频</Text>
            <Text style={styles.taskPoints}>+1积分</Text>
          </View>
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>发布评论</Text>
            <Text style={styles.taskPoints}>+2积分</Text>
          </View>
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>分享内容</Text>
            <Text style={styles.taskPoints}>+5积分</Text>
          </View>
          <View style={styles.taskItem}>
            <Text style={styles.taskText}>每日登录</Text>
            <Text style={styles.taskPoints}>+5积分</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#1890ff',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#333',
  },
  taskList: {
    gap: 12,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  taskText: {
    fontSize: 14,
    color: '#333',
  },
  taskPoints: {
    fontSize: 14,
    color: '#1890ff',
    fontWeight: '600',
  },
});
