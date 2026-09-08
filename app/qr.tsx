import { CameraView, useCameraPermissions } from 'expo-camera';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { QrPattern } from '@/components/QrPattern';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/player-context';

export default function QrLoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { connectAccount } = usePlayer();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const onBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    const parsed = parsePayload(data);
    if (!parsed) {
      setScanned(false);
      Alert.alert('رمز غير معروف', 'استخدم QR صادرًا من مزود خدمة IPTV يدعم Streamora.');
      return;
    }
    await connectAccount({
      host: parsed.host,
      username: parsed.username,
      password: parsed.password,
      label: parsed.label,
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('تم الاتصال', 'تم حفظ بيانات الاشتراك بنجاح.', [{ text: 'ابدأ المشاهدة', onPress: () => router.replace('/') }]);
  };

  const showManual = () => {
    router.replace('/login');
  };

  const cameraUnavailable = Platform.OS === 'web' || !permission?.granted;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-right" size={21} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>الدخول عبر QR</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {cameraUnavailable ? (
          <View style={[styles.cameraFallback, { backgroundColor: colors.card }]}>
            <View style={[styles.fallbackIcon, { backgroundColor: colors.accent }]}>
              <Feather name={Platform.OS === 'web' ? 'monitor' : 'camera-off'} size={28} color={colors.primary} />
            </View>
            <Text style={[styles.fallbackTitle, { color: colors.foreground }]}>{Platform.OS === 'web' ? 'افتح التطبيق على هاتفك' : 'نحتاج إذن الكاميرا'}</Text>
            <Text style={[styles.fallbackText, { color: colors.mutedForeground }]}>{Platform.OS === 'web' ? 'استخدم Preview on your phone لمسح رمز QR فعليًا.' : 'اسمح للكاميرا ثم أعد المحاولة لمسح رمز مزود الخدمة.'}</Text>
            {Platform.OS !== 'web' && <Pressable onPress={requestPermission} style={[styles.primaryButton, { backgroundColor: colors.primary }]}><Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>السماح بالكاميرا</Text></Pressable>}
          </View>
        ) : (
          <View style={styles.cameraWrap}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={scanned ? undefined : onBarcodeScanned}
            />
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTopLeft, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerTopRight, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerBottomLeft, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerBottomRight, { borderColor: colors.primary }]} />
              <View style={[styles.scanLine, { backgroundColor: colors.primary }]} />
            </View>
            <View style={styles.cameraCaption}><Text style={styles.cameraCaptionText}>وجّه الكاميرا نحو رمز QR</Text></View>
          </View>
        )}

        <View style={styles.manualBlock}>
          <View style={[styles.orLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.orText, { color: colors.mutedForeground }]}>أو استخدم رمزًا يدويًا</Text>
          <Pressable onPress={showManual} style={({ pressed }) => [styles.manualButton, { borderColor: colors.border }, pressed && styles.pressed]}>
            <Feather name="edit-3" size={16} color={colors.primary} />
            <Text style={[styles.manualText, { color: colors.foreground }]}>إدخال بيانات الاشتراك</Text>
          </Pressable>
        </View>

        <View style={styles.trustRow}>
          <QrPattern seed="streamora-support" size={42} />
          <Text style={[styles.trustText, { color: colors.mutedForeground }]}>استخدم رمز QR من مزود الخدمة فقط.{'\n'}لا تشارك بيانات اشتراكك مع أي جهة.</Text>
        </View>
      </View>
    </View>
  );
}

type LoginPayload = { host: string; username: string; password: string; label?: string; expiresAt?: string };

function parsePayload(data: string): LoginPayload | null {
  try {
    if (data.trim().startsWith('{')) {
      const parsed = JSON.parse(data) as { host?: string; username?: string; password?: string; label?: string; expiresAt?: string; expiry?: string };
      if (parsed.host && parsed.username && parsed.password) {
        return { host: parsed.host, username: parsed.username, password: parsed.password, label: parsed.label, expiresAt: parsed.expiresAt || parsed.expiry };
      }
    }
    if (data.includes('|')) {
      const [host, username, password, label] = data.split('|');
      if (host && username && password) return { host, username, password, label };
    }
    const url = new URL(data);
    const host = url.searchParams.get('host');
    const username = url.searchParams.get('username');
    const password = url.searchParams.get('password');
    if (host && username && password) {
      return {
        host,
        username,
        password,
        label: url.searchParams.get('label') || undefined,
        expiresAt: url.searchParams.get('expiresAt') || url.searchParams.get('expiry') || undefined,
      };
    }
  } catch {
    return null;
  }
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
  headerSpacer: { width: 40 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 30 },
  cameraWrap: { height: 405, borderRadius: 22, overflow: 'hidden', backgroundColor: '#171719' },
  camera: { flex: 1 },
  scanFrame: { position: 'absolute', width: 220, height: 220, left: '50%', top: '50%', marginLeft: -110, marginTop: -110 },
  corner: { width: 33, height: 33, position: 'absolute' },
  cornerTopLeft: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 },
  cornerTopRight: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 },
  cornerBottomLeft: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 },
  cornerBottomRight: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 },
  scanLine: { height: 2, position: 'absolute', left: 8, right: 8, top: '50%' },
  cameraCaption: { position: 'absolute', bottom: 18, left: 0, right: 0, alignItems: 'center' },
  cameraCaptionText: { color: '#FFFFFF', fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  cameraFallback: { height: 405, borderRadius: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 35 },
  fallbackIcon: { width: 70, height: 70, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  fallbackTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginTop: 18 },
  fallbackText: { fontFamily: 'Inter_400Regular', fontSize: 11, textAlign: 'center', lineHeight: 18, marginTop: 8 },
  primaryButton: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 13, marginTop: 19 },
  primaryButtonText: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  manualBlock: { alignItems: 'center', marginTop: 24 },
  orLine: { position: 'absolute', top: 8, left: 0, right: 0, height: 1 },
  orText: { backgroundColor: '#0B0B0D', paddingHorizontal: 13, fontFamily: 'Inter_400Regular', fontSize: 10 },
  manualButton: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 17, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 15 },
  manualText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  trustRow: { flexDirection: 'row', alignItems: 'center', marginTop: 26, alignSelf: 'center' },
  trustText: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 15, marginLeft: 10 },
  pressed: { opacity: 0.74 },
});