import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { categories } from '@/constants/catalog';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/player-context';

export default function LiveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const { availableChannels, catalogError, isFavorite, isSyncing, refreshCatalog, remoteCatalog, toggleFavorite } = usePlayer();
  const channelCategories = useMemo(() => {
    const remoteCategories = Array.from(new Set(availableChannels.map((channel) => channel.category).filter(Boolean)));
    return remoteCategories.length ? ['الكل', ...remoteCategories] : categories;
  }, [availableChannels]);
  const filteredChannels = useMemo(
    () => selectedCategory === 'الكل' ? availableChannels : availableChannels.filter((channel) => channel.category === selectedCategory),
    [availableChannels, selectedCategory],
  );

  const openPlayer = (title: string, channelId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/player', params: { title, channelId } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredChannels}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.topRow}>
              <View>
                <Text style={[styles.kicker, { color: colors.primary }]}>LIVE TV</Text>
                <Text style={[styles.title, { color: colors.foreground }]}>القنوات المباشرة</Text>
              </View>
              <View style={[styles.countPill, { backgroundColor: colors.card }]}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.countText, { color: colors.mutedForeground }]}>{availableChannels.length} قناة</Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <Text style={[styles.description, { color: colors.mutedForeground }]}>
                {isSyncing ? 'جاري تحديث القنوات والبرامج...' : remoteCatalog ? 'القنوات محدثة من مزود اشتراكك.' : 'كل ما تحب، في بث واحد مستقر وسريع.'}
              </Text>
              {!!remoteCatalog && (
                <Pressable onPress={() => void refreshCatalog()} hitSlop={10}>
                  <Feather name="refresh-cw" size={15} color={colors.primary} />
                </Pressable>
              )}
            </View>
            {!!catalogError && <Text style={[styles.errorText, { color: colors.primary }]}>{catalogError}</Text>}
            <FlatList
              horizontal
              data={channelCategories}
              keyExtractor={(item) => item}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryList}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setSelectedCategory(item)}
                  style={[
                    styles.categoryPill,
                    { backgroundColor: selectedCategory === item ? colors.primary : colors.card },
                  ]}
                >
                  <Text style={[styles.categoryText, { color: selectedCategory === item ? colors.primaryForeground : colors.mutedForeground }]}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => openPlayer(item.title, item.id)}
            style={({ pressed }) => [styles.channelRow, { backgroundColor: colors.card }, pressed && styles.pressed]}
          >
            <View style={[styles.channelIcon, { backgroundColor: item.color }]}>
              <Feather name={item.icon as keyof typeof Feather.glyphMap} size={23} color="#FFFFFF" />
            </View>
            <View style={styles.channelCopy}>
              <View style={styles.channelNameRow}>
                <Text style={[styles.channelName, { color: colors.foreground }]}>{item.title}</Text>
                {item.isLive && <View style={[styles.liveBadge, { backgroundColor: colors.accent }]}><View style={[styles.dot, { backgroundColor: colors.primary }]} /><Text style={[styles.liveText, { color: colors.accentForeground }]}>مباشر</Text></View>}
              </View>
               <Text style={[styles.channelSubtitle, { color: colors.mutedForeground }]}>
                 {remoteCatalog?.epg.find((event) => event.channelId === item.id)?.title || item.subtitle}
               </Text>
              <Text style={[styles.viewerText, { color: colors.mutedForeground }]}><Feather name="users" size={11} color={colors.mutedForeground} />  {item.viewers} يشاهدون الآن</Text>
            </View>
            <Pressable
              onPress={() => toggleFavorite(item.id)}
              hitSlop={10}
              style={styles.heartButton}
            >
              <Feather name="heart" size={18} color={isFavorite(item.id) ? colors.primary : colors.mutedForeground} fill={isFavorite(item.id) ? colors.primary : 'transparent'} />
            </Pressable>
            <Feather name="chevron-left" size={18} color={colors.mutedForeground} />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRow: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.1 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 26, marginTop: 7 },
  description: { fontFamily: 'Inter_400Regular', fontSize: 12, paddingHorizontal: 20, marginTop: 8 },
  statusRow: { paddingHorizontal: 20, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  errorText: { fontFamily: 'Inter_400Regular', fontSize: 10, paddingHorizontal: 20, marginTop: 7 },
  countPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 18, paddingHorizontal: 10, paddingVertical: 8 },
  countText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  categoryList: { gap: 8, paddingHorizontal: 20, paddingVertical: 22 },
  categoryPill: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 },
  categoryText: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  channelRow: { marginHorizontal: 20, marginBottom: 10, borderRadius: 17, padding: 12, flexDirection: 'row', alignItems: 'center' },
  channelIcon: { width: 49, height: 49, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  channelCopy: { flex: 1, marginHorizontal: 12 },
  channelNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  channelName: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  channelSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4 },
  viewerText: { fontFamily: 'Inter_400Regular', fontSize: 9, marginTop: 7 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 3 },
  liveText: { fontFamily: 'Inter_600SemiBold', fontSize: 8 },
  heartButton: { padding: 7, marginRight: 5 },
  pressed: { opacity: 0.74 },
});