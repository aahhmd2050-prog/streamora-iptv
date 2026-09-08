import { Feather } from '@expo/vector-icons';
import { useVideoPlayer, VideoView } from 'expo-video';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/player-context';

export default function PlayerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ title?: string; channelId?: string; videoId?: string }>();
  const [playing, setPlaying] = useState(false);
  const { availableChannels, getProgress, isFavorite, remoteCatalog, saveProgress, toggleFavorite } = usePlayer();
  const channel = availableChannels.find((item) => item.id === params.channelId);
  const video = remoteCatalog?.movies.concat(remoteCatalog.series).find((item) => item.id === params.videoId);
  const title = params.title || channel?.title || 'Streamora Player';
  const streamUrl = channel?.streamUrl || video?.streamUrl;
  const videoSource = streamUrl
    ? { uri: streamUrl, contentType: streamUrl.includes('.m3u8') ? 'hls' as const : 'auto' as const, metadata: { title } }
    : null;
  const videoPlayer = useVideoPlayer(videoSource, (instance) => {
    instance.timeUpdateEventInterval = 1;
  });
  const progressKey = params.channelId || params.videoId || title;
  const savedProgress = getProgress(progressKey);
  const [position, setPosition] = useState(savedProgress);
  const positionRef = useRef(savedProgress);

  const togglePlayback = () => {
    if (streamUrl) {
      if (videoPlayer.playing) videoPlayer.pause();
      else videoPlayer.play();
    } else {
      setPlaying((current) => !current);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    if (!streamUrl) return undefined;
    const statusSubscription = videoPlayer.addListener('statusChange', ({ status }) => {
      if (status === 'readyToPlay') {
        if (savedProgress > 0 && videoPlayer.duration > 0 && !videoPlayer.isLive) {
          videoPlayer.currentTime = (savedProgress / 100) * videoPlayer.duration;
        }
        videoPlayer.play();
      }
    });
    const timeSubscription = videoPlayer.addListener('timeUpdate', ({ currentTime }) => {
      if (videoPlayer.duration > 0 && Number.isFinite(videoPlayer.duration) && !videoPlayer.isLive) {
        setPosition(Math.max(0, Math.min(100, Math.round((currentTime / videoPlayer.duration) * 100))));
      }
    });
    const playingSubscription = videoPlayer.addListener('playingChange', ({ isPlaying }) => {
      setPlaying(isPlaying);
    });
    return () => {
      statusSubscription.remove();
      timeSubscription.remove();
      playingSubscription.remove();
    };
  }, [savedProgress, streamUrl, videoPlayer]);

  useEffect(() => {
    if (streamUrl) return undefined;
    if (!playing) return undefined;
    const timer = setInterval(() => {
      setPosition((current) => {
        const next = Math.min(100, current + 1);
        if (next >= 100) {
          void saveProgress(progressKey, 0);
          setPlaying(false);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [playing, progressKey, saveProgress, streamUrl]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') void saveProgress(progressKey, positionRef.current);
    });
    return () => subscription.remove();
  }, [progressKey, saveProgress]);

  useEffect(() => {
    return () => {
      void saveProgress(progressKey, positionRef.current);
    };
  }, [progressKey, saveProgress]);

  const resumeTime = formatPlaybackTime(position);

  return (
    <View style={[styles.container, { backgroundColor: '#050506' }]}>
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <Feather name="arrow-right" size={21} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>{title}</Text>
        <Pressable onPress={() => channel && toggleFavorite(channel.id)} style={styles.iconButton}>
          <Feather name="heart" size={19} color={channel && isFavorite(channel.id) ? colors.primary : '#FFFFFF'} fill={channel && isFavorite(channel.id) ? colors.primary : 'transparent'} />
        </Pressable>
      </View>
        <View style={styles.videoStage}>
          {streamUrl && (
            <VideoView
              player={videoPlayer}
              style={styles.video}
              contentFit="contain"
              nativeControls
              fullscreenOptions={{ enable: true, orientation: 'landscape' }}
              allowsPictureInPicture
            />
          )}
        <View style={[styles.videoGlow, { backgroundColor: channel?.color || colors.primary }]} />
          {!streamUrl && (
            <>
              <View style={styles.videoBrand}>
                <View style={styles.playRing}><Feather name="play" size={30} color="#FFFFFF" fill="#FFFFFF" /></View>
                <Text style={styles.videoBrandName}>STREAMORA</Text>
                <Text style={styles.videoBrandMeta}>{playing ? 'جاري تشغيل البث' : 'جاهز للمشاهدة'}</Text>
              </View>
              <Pressable onPress={togglePlayback} style={({ pressed }) => [styles.centerPlay, pressed && styles.pressed]}>
                <Feather name={playing ? 'pause' : 'play'} size={25} color="#FFFFFF" fill="#FFFFFF" />
              </Pressable>
            </>
          )}
        <View style={styles.controls}>
          <View style={styles.progressTrack}><View style={[styles.progress, { backgroundColor: colors.primary, width: `${Math.max(7, position)}%` }]} /></View>
          <View style={styles.controlsRow}>
            <Text style={styles.controlTime}>{resumeTime}</Text>
            <View style={styles.controlActions}>
              <Pressable onPress={() => Haptics.selectionAsync()}><Feather name="volume-2" size={17} color="#FFFFFF" /></Pressable>
              <Pressable onPress={() => Haptics.selectionAsync()}><Feather name="settings" size={17} color="#FFFFFF" /></Pressable>
              <Pressable onPress={() => Haptics.selectionAsync()}><Feather name="maximize" size={17} color="#FFFFFF" /></Pressable>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.details}>
        <View style={styles.liveRow}>
          <View style={[styles.liveBadge, { backgroundColor: colors.accent }]}><View style={[styles.liveDot, { backgroundColor: colors.primary }]} /><Text style={[styles.liveText, { color: colors.accentForeground }]}>مباشر الآن</Text></View>
          <Text style={styles.quality}>HD · 1080p</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{channel?.subtitle || 'استمتع بتجربة بث مستقرة وواجهة مشاهدة بلا تشتيت.'}</Text>
        {savedProgress > 0 && !playing && (
          <View style={styles.resumeNotice}>
            <Feather name="rotate-ccw" size={14} color={colors.primary} />
            <Text style={[styles.resumeText, { color: colors.mutedForeground }]}>سيتم الاستكمال من {formatPlaybackTime(savedProgress)}</Text>
          </View>
        )}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}><Feather name="wifi" size={15} color="#A7A5A5" /><Text style={styles.infoText}>اتصال مستقر</Text></View>
          <View style={styles.infoItem}><Feather name="users" size={15} color="#A7A5A5" /><Text style={styles.infoText}>{channel?.viewers || '2.1K'} يشاهدون</Text></View>
        </View>
      </View>
    </View>
  );
}

function formatPlaybackTime(progress: number) {
  const totalSeconds = Math.round((progress / 100) * 3600);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.10)' },
  topTitle: { flex: 1, color: '#FFFFFF', textAlign: 'center', fontFamily: 'Inter_600SemiBold', fontSize: 13, marginHorizontal: 14 },
  videoStage: { height: 265, marginTop: 14, backgroundColor: '#111113', position: 'relative', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  video: { ...StyleSheet.absoluteFill },
  videoGlow: { width: 280, height: 180, opacity: 0.17, position: 'absolute', borderRadius: 150 },
  videoBrand: { alignItems: 'center', opacity: 0.72 },
  playRing: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' },
  videoBrandName: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 14, letterSpacing: 1.4, marginTop: 12 },
  videoBrandMeta: { color: '#A7A5A5', fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 5 },
  centerPlay: { position: 'absolute', width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(239,68,68,0.92)', alignItems: 'center', justifyContent: 'center' },
  controls: { position: 'absolute', left: 18, right: 18, bottom: 13 },
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.27)', borderRadius: 2 },
  progress: { height: 3, borderRadius: 2 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 },
  controlTime: { color: '#FFFFFF', fontFamily: 'Inter_500Medium', fontSize: 10 },
  controlActions: { flexDirection: 'row', gap: 17 },
  details: { paddingHorizontal: 20, paddingTop: 25 },
  liveRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontFamily: 'Inter_600SemiBold', fontSize: 9 },
  quality: { color: '#A7A5A5', fontFamily: 'Inter_500Medium', fontSize: 10 },
  title: { color: '#FFFFFF', fontFamily: 'Inter_700Bold', fontSize: 23, marginTop: 14 },
  subtitle: { color: '#A7A5A5', fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 19, marginTop: 7 },
  resumeNotice: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 13 },
  resumeText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  infoRow: { flexDirection: 'row', gap: 18, marginTop: 22 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  infoText: { color: '#A7A5A5', fontFamily: 'Inter_400Regular', fontSize: 10 },
  pressed: { opacity: 0.75 },
});