import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/player-context';

export default function FavoritesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { availableChannels, favorites, toggleFavorite } = usePlayer();
  const favoriteChannels = availableChannels.filter((channel) => favorites.includes(channel.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={favoriteChannels}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 120, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[styles.kicker, { color: colors.primary }]}>YOUR LIST</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>المفضلة</Text>
            <Text style={[styles.description, { color: colors.mutedForeground }]}>قنواتك وبرامجك المفضلة في مكان واحد.</Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.card }]}>
              <Feather name="heart" size={27} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>قائمتك ما زالت فارغة</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>اضغط على القلب بجانب أي قناة لإضافتها هنا.</Text>
            <Pressable onPress={() => router.push('/live')} style={[styles.emptyButton, { backgroundColor: colors.primary }]}>
              <Text style={[styles.emptyButtonText, { color: colors.primaryForeground }]}>استكشف القنوات</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: '/player', params: { title: item.title, channelId: item.id } });
            }}
            style={({ pressed }) => [styles.row, { backgroundColor: colors.card }, pressed && styles.pressed]}
          >
            <View style={[styles.icon, { backgroundColor: item.color }]}>
              <Feather name={item.icon as keyof typeof Feather.glyphMap} size={22} color="#FFFFFF" />
            </View>
            <View style={styles.copy}>
              <Text style={[styles.name, { color: colors.foreground }]}>{item.title}</Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{item.subtitle}</Text>
            </View>
            <Pressable onPress={() => toggleFavorite(item.id)} hitSlop={12}>
              <Feather name="heart" size={18} color={colors.primary} fill={colors.primary} />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.1 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 27, marginTop: 7 },
  description: { fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 8 },
  row: { marginHorizontal: 20, marginTop: 10, borderRadius: 17, padding: 12, flexDirection: 'row', alignItems: 'center' },
  icon: { width: 49, height: 49, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, marginHorizontal: 12 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 5 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 50, paddingTop: 80 },
  emptyIcon: { width: 70, height: 70, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginTop: 18 },
  emptyText: { fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center', lineHeight: 19, marginTop: 8 },
  emptyButton: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 13, marginTop: 20 },
  emptyButtonText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  pressed: { opacity: 0.74 },
});