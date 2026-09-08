import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { shows, type Show } from '@/constants/catalog';
import { useColors } from '@/hooks/useColors';
import { formatExpiryDate, getRemainingDays, usePlayer } from '@/context/player-context';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { account, availableChannels, isFavorite, remoteCatalog, toggleFavorite } = usePlayer();
  const remainingDays = account ? getRemainingDays(account.expiresAt) : 0;
  const featured = shows[0];
  const catalogShows: Show[] = remoteCatalog?.movies?.length
    ? remoteCatalog.movies.slice(0, 8).map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      image: item.poster ? { uri: item.poster } : require('../../assets/images/city-neon.jpg'),
      duration: item.duration,
      streamUrl: item.streamUrl,
    }))
    : shows;

  const openPlayer = (title: string, channelId?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/player', params: { title, channelId } });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: 122 }}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
            <View>
              <Text style={[styles.brandName, { color: colors.foreground }]}>STREAMORA</Text>
              <Text style={[styles.brandCaption, { color: colors.mutedForeground }]}>رفاهية المشاهدة</Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push(account ? '/settings' : '/login')}
            style={({ pressed }) => [styles.profileButton, { backgroundColor: colors.card }, pressed && styles.pressed]}
          >
            <Feather name={account ? 'user-check' : 'user'} size={19} color={colors.primary} />
          </Pressable>
        </View>

        <View style={styles.greetingRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>مساحتك للمشاهدة</Text>
            <Text style={[styles.greeting, { color: colors.foreground }]}>أهلًا بك من جديد</Text>
          </View>
          <View style={[styles.livePill, { backgroundColor: colors.accent }]}>
            <View style={[styles.liveDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.livePillText, { color: colors.accentForeground }]}>مباشر الآن</Text>
          </View>
        </View>

        <Pressable
          onPress={() => openPlayer(featured.title, 'sports-1')}
          style={({ pressed }) => [styles.hero, pressed && styles.pressed]}
        >
          <ImageBackground source={featured.image} style={styles.heroImage} imageStyle={styles.heroImageRadius}>
            <LinearGradient
              colors={['transparent', 'rgba(11,11,13,0.5)', colors.background]}
              locations={[0.18, 0.56, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <View style={styles.heroBadgeDot} />
                <Text style={styles.heroBadgeText}>مباشر</Text>
              </View>
              <Text style={styles.heroTitle}>{featured.title}</Text>
              <Text style={styles.heroDescription}>{featured.description}</Text>
              <View style={styles.heroAction}>
                <Feather name="play" size={14} color={colors.foreground} fill={colors.foreground} />
                <Text style={[styles.heroActionText, { color: colors.foreground }]}>شاهد الآن</Text>
              </View>
            </View>
          </ImageBackground>
        </Pressable>

        {!account && (
          <Pressable
            onPress={() => router.push('/login')}
            style={({ pressed }) => [styles.connectBanner, { backgroundColor: colors.card, borderColor: colors.border }, pressed && styles.pressed]}
          >
            <View style={[styles.connectIcon, { backgroundColor: colors.accent }]}>
              <Feather name="zap" size={18} color={colors.primary} />
            </View>
            <View style={styles.connectCopy}>
              <Text style={[styles.connectTitle, { color: colors.foreground }]}>أضف اشتراكك وابدأ</Text>
              <Text style={[styles.connectSubtitle, { color: colors.mutedForeground }]}>سجّل عبر QR خلال ثوانٍ</Text>
            </View>
            <Feather name="chevron-left" size={20} color={colors.mutedForeground} />
          </Pressable>
        )}
        {account && (
          <View style={[styles.subscriptionBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.subscriptionIcon, { backgroundColor: colors.accent }]}>
              <Feather name="calendar" size={17} color={colors.primary} />
            </View>
            <View style={styles.subscriptionCopy}>
              <Text style={[styles.subscriptionTitle, { color: colors.foreground }]}>اشتراكك نشط</Text>
              <Text style={[styles.subscriptionSubtitle, { color: colors.mutedForeground }]}>
                ينتهي في {formatExpiryDate(account.expiresAt)}
              </Text>
            </View>
            <View style={[styles.daysPill, { backgroundColor: colors.accent }]}>
              <Text style={[styles.daysNumber, { color: colors.primary }]}>{remainingDays}</Text>
              <Text style={[styles.daysLabel, { color: colors.accentForeground }]}>يوم</Text>
            </View>
          </View>
        )}

        <SectionHeading title="القنوات الأكثر مشاهدة" action="عرض الكل" onPress={() => router.push('/live')} colors={colors} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
          {availableChannels.slice(0, 4).map((channel) => (
            <Pressable
              key={channel.id}
              onPress={() => openPlayer(channel.title, channel.id)}
              style={({ pressed }) => [styles.channelCard, { backgroundColor: colors.card }, pressed && styles.pressed]}
            >
              <View style={[styles.channelIcon, { backgroundColor: channel.color }]}>
                <Feather name={channel.icon as keyof typeof Feather.glyphMap} size={22} color="#FFFFFF" />
                {channel.isLive && <View style={styles.channelLiveDot} />}
              </View>
              <Text style={[styles.channelTitle, { color: colors.foreground }]} numberOfLines={1}>{channel.title}</Text>
              <Text style={[styles.channelMeta, { color: colors.mutedForeground }]}>{channel.viewers} مشاهد</Text>
            </Pressable>
          ))}
        </ScrollView>

        <SectionHeading title="قد يعجبك" action="كل المحتوى" onPress={() => router.push('/live')} colors={colors} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
            {catalogShows.map((show) => (
            <Pressable
              key={show.id}
                onPress={() => router.push({ pathname: '/player', params: { title: show.title, videoId: show.id } })}
              style={({ pressed }) => [styles.showCard, pressed && styles.pressed]}
            >
              <Image source={show.image} style={styles.showImage} />
              <View style={styles.showOverlay} />
              <View style={styles.showLabel}>
                <Text style={styles.showCategory}>{show.category}</Text>
                <Text style={styles.showTitle}>{show.title}</Text>
              </View>
              <Pressable
                onPress={() => toggleFavorite(show.id)}
                style={styles.favoriteButton}
                hitSlop={10}
              >
                <Feather name="heart" size={16} color="#FFFFFF" fill={isFavorite(show.id) ? '#FFFFFF' : 'transparent'} />
              </Pressable>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

function SectionHeading({
  title,
  action,
  onPress,
  colors,
}: {
  title: string;
  action: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <Pressable onPress={onPress} hitSlop={12}>
        <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 39,
    height: 39,
    borderRadius: 12,
  },
  brandName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    letterSpacing: 1.2,
  },
  brandCaption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greetingRow: {
    marginTop: 27,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  greeting: {
    fontFamily: 'Inter_700Bold',
    fontSize: 25,
    marginTop: 6,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  livePillText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 10,
  },
  hero: {
    marginTop: 20,
    marginHorizontal: 20,
    height: 246,
    borderRadius: 22,
    overflow: 'hidden',
  },
  heroImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroImageRadius: {
    borderRadius: 22,
  },
  heroContent: {
    padding: 20,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.88)',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  heroBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 10,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 25,
    marginTop: 9,
  },
  heroDescription: {
    color: 'rgba(255,255,255,0.78)',
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 4,
    maxWidth: 260,
    lineHeight: 18,
  },
  heroAction: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
  },
  heroActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
  connectBanner: {
    marginHorizontal: 20,
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 17,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionBanner: {
    marginHorizontal: 20,
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 17,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscriptionCopy: {
    flex: 1,
    marginHorizontal: 11,
  },
  subscriptionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  subscriptionSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 4,
  },
  daysPill: {
    minWidth: 48,
    borderRadius: 11,
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  daysNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  daysLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 8,
    marginTop: -1,
  },
  connectIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectCopy: {
    flex: 1,
    marginHorizontal: 11,
  },
  connectTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
  },
  connectSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    marginTop: 3,
  },
  sectionHeading: {
    marginTop: 27,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 17,
  },
  sectionAction: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
  },
  horizontalList: {
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  channelCard: {
    width: 124,
    borderRadius: 16,
    padding: 11,
  },
  channelIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  channelLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFDFDF',
    position: 'absolute',
    right: -2,
    top: -2,
  },
  channelTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    marginTop: 12,
  },
  channelMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    marginTop: 4,
  },
  showCard: {
    width: 216,
    height: 125,
    borderRadius: 17,
    overflow: 'hidden',
  },
  showImage: {
    ...StyleSheet.absoluteFill,
    width: undefined,
    height: undefined,
  },
  showOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.37)',
  },
  showLabel: {
    position: 'absolute',
    left: 13,
    bottom: 13,
  },
  showCategory: {
    color: '#FF9696',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 9,
    marginBottom: 3,
  },
  showTitle: {
    color: '#FFFFFF',
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  },
  favoriteButton: {
    position: 'absolute',
    top: 11,
    right: 11,
    width: 29,
    height: 29,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.36)',
  },
  pressed: {
    opacity: 0.76,
  },
});
