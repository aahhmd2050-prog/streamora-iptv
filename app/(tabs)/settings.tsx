import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { formatExpiryDate, getRemainingDays, usePlayer } from '@/context/player-context';
import { releaseInfo } from '@/constants/release';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { account, disconnectAccount } = usePlayer();
  const remainingDays = account ? getRemainingDays(account.expiresAt) : 0;
  const validityProgress = Math.min(100, Math.max(2, Math.round((remainingDays / 365) * 100)));
  const [autoPlay, setAutoPlay] = useState(true);
  const [rememberPosition, setRememberPosition] = useState(true);

  const signOut = () => {
    Alert.alert('إزالة الاشتراك', 'هل تريد إزالة بيانات هذا الاشتراك من الجهاز؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'إزالة', style: 'destructive', onPress: () => disconnectAccount() },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.kicker, { color: colors.primary }]}>CONTROL CENTER</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>الإعدادات</Text>
        </View>
        <Image source={require('../../assets/images/icon.png')} style={styles.logo} />
      </View>

      <View style={[styles.accountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.accountIcon, { backgroundColor: colors.accent }]}>
          <Feather name={account ? 'user-check' : 'user-plus'} size={23} color={colors.primary} />
        </View>
        <View style={styles.accountCopy}>
          <Text style={[styles.accountLabel, { color: colors.mutedForeground }]}>حساب IPTV</Text>
          <Text style={[styles.accountName, { color: colors.foreground }]}>{account?.label || 'لم تتم إضافة اشتراك'}</Text>
          <Text style={[styles.accountMeta, { color: colors.mutedForeground }]}>{account ? `ينتهي في ${account.expiresAt}` : 'أضف بياناتك أو استخدم QR'}</Text>
        </View>
        <Pressable
          onPress={() => router.push(account ? '/qr' : '/login')}
          style={({ pressed }) => [styles.manageButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}
        >
          <Text style={[styles.manageText, { color: colors.primaryForeground }]}>{account ? 'تحديث' : 'إضافة'}</Text>
        </Pressable>
      </View>
      {account && (
        <View style={[styles.validityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.validityHeader}>
            <View>
              <Text style={[styles.validityLabel, { color: colors.mutedForeground }]}>مدة صلاحية الاشتراك</Text>
              <Text style={[styles.validityDays, { color: colors.foreground }]}>
                {remainingDays === 0 ? 'منتهي' : <>{remainingDays} <Text style={[styles.validityUnit, { color: colors.primary }]}>يوم متبقي</Text></>}
              </Text>
            </View>
            <View style={[styles.validityIcon, { backgroundColor: colors.accent }]}>
              <Feather name="calendar" size={18} color={colors.primary} />
            </View>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${validityProgress}%` }]} />
          </View>
          <View style={styles.validityFooter}>
            <Text style={[styles.validityHint, { color: colors.mutedForeground }]}>تاريخ الانتهاء</Text>
            <Text style={[styles.validityDate, { color: colors.foreground }]}>{formatExpiryDate(account.expiresAt)}</Text>
          </View>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>تجربة المشاهدة</Text>
      <View style={[styles.settingsGroup, { backgroundColor: colors.card }]}>
        <SettingRow icon="play-circle" title="تشغيل تلقائي" subtitle="ابدأ البث عند فتح القناة" value={autoPlay} onValueChange={setAutoPlay} colors={colors} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <SettingRow icon="rotate-ccw" title="تذكر موضع المشاهدة" subtitle="استكمل من آخر نقطة توقفت عندها" value={rememberPosition} onValueChange={setRememberPosition} colors={colors} />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <Pressable style={styles.settingRow} onPress={() => Haptics.selectionAsync()}>
          <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}><Feather name="maximize" size={17} color={colors.mutedForeground} /></View>
          <View style={styles.settingCopy}><Text style={[styles.settingTitle, { color: colors.foreground }]}>جودة البث</Text><Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>تلقائي · حسب سرعة الإنترنت</Text></View>
          <Feather name="chevron-left" size={18} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>المساعدة</Text>
      <View style={[styles.settingsGroup, { backgroundColor: colors.card }]}>
        <Pressable style={styles.settingRow} onPress={() => Alert.alert('مركز المساعدة', 'للدعم الفني، تواصل مع مزود اشتراكك أو فريق Streamora.')}>
          <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}><Feather name="help-circle" size={17} color={colors.mutedForeground} /></View>
          <View style={styles.settingCopy}><Text style={[styles.settingTitle, { color: colors.foreground }]}>مركز المساعدة</Text><Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>إجابات سريعة وإرشادات الاتصال</Text></View>
          <Feather name="chevron-left" size={18} color={colors.mutedForeground} />
        </Pressable>
        {account && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Pressable style={styles.settingRow} onPress={signOut}>
              <View style={[styles.settingIcon, { backgroundColor: colors.accent }]}><Feather name="log-out" size={17} color={colors.primary} /></View>
              <View style={styles.settingCopy}><Text style={[styles.settingTitle, { color: colors.primary }]}>إزالة بيانات الاشتراك</Text><Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>مسح الحساب المحفوظ من هذا الجهاز</Text></View>
              <Feather name="chevron-left" size={18} color={colors.mutedForeground} />
            </Pressable>
          </>
        )}
      </View>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>تحديث التطبيق</Text>
      <View style={[styles.settingsGroup, { backgroundColor: colors.card }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="تحميل آخر نسخة من Streamora"
          focusable
          onPress={() => {
            if (releaseInfo.apkUrl) {
              Linking.openURL(releaseInfo.apkUrl);
            } else {
              Alert.alert('الرابط غير جاهز', 'سيظهر رابط التحميل بعد نشر نسخة Android على خادم التوزيع.');
            }
          }}
          style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}
        >
          <View style={[styles.settingIcon, { backgroundColor: colors.accent }]}><Feather name="download" size={17} color={colors.primary} /></View>
          <View style={styles.settingCopy}>
            <Text style={[styles.settingTitle, { color: colors.foreground }]}>تحميل نسخة Android</Text>
            <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>
              {releaseInfo.apkUrl ? 'رابط APK الرسمي · هاتف وAndroid TV' : 'الرابط سيُفعّل عند نشر الإصدار'}
            </Text>
          </View>
          <Feather name="external-link" size={17} color={colors.mutedForeground} />
        </Pressable>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.settingRow}>
          <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}><Feather name="hash" size={17} color={colors.mutedForeground} /></View>
          <View style={styles.settingCopy}>
            <Text style={[styles.settingTitle, { color: colors.foreground }]}>كود Downloader</Text>
            <Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>
              {releaseInfo.downloaderCode || 'سيظهر بعد تسجيل رابط التوزيع'}
            </Text>
          </View>
        </View>
      </View>
      <Text style={[styles.version, { color: colors.mutedForeground }]}>STREAMORA · الإصدار {releaseInfo.version}</Text>
    </ScrollView>
  );
}

function SettingRow({
  icon,
  title,
  subtitle,
  value,
  onValueChange,
  colors,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}><Feather name={icon} size={17} color={colors.mutedForeground} /></View>
      <View style={styles.settingCopy}><Text style={[styles.settingTitle, { color: colors.foreground }]}>{title}</Text><Text style={[styles.settingSubtitle, { color: colors.mutedForeground }]}>{subtitle}</Text></View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.border, true: colors.accent }} thumbColor={value ? colors.primary : colors.mutedForeground} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.1 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 27, marginTop: 7 },
  logo: { width: 43, height: 43, borderRadius: 14 },
  accountCard: { marginHorizontal: 20, marginTop: 24, borderRadius: 19, borderWidth: 1, padding: 14, flexDirection: 'row', alignItems: 'center' },
  accountIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  accountCopy: { flex: 1, marginHorizontal: 11 },
  accountLabel: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  accountName: { fontFamily: 'Inter_700Bold', fontSize: 13, marginTop: 3 },
  accountMeta: { fontFamily: 'Inter_400Regular', fontSize: 9, marginTop: 4 },
  manageButton: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 11 },
  manageText: { fontFamily: 'Inter_700Bold', fontSize: 10 },
  validityCard: { marginHorizontal: 20, marginTop: 12, borderRadius: 18, borderWidth: 1, padding: 14 },
  validityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  validityLabel: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  validityDays: { fontFamily: 'Inter_700Bold', fontSize: 22, marginTop: 5 },
  validityUnit: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  validityIcon: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  progressTrack: { height: 6, borderRadius: 3, marginTop: 16, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
  validityFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 9 },
  validityHint: { fontFamily: 'Inter_400Regular', fontSize: 9 },
  validityDate: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, paddingHorizontal: 20, marginTop: 28, marginBottom: 11 },
  settingsGroup: { marginHorizontal: 20, borderRadius: 18, paddingHorizontal: 13 },
  settingRow: { minHeight: 70, flexDirection: 'row', alignItems: 'center' },
  settingIcon: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  settingCopy: { flex: 1, marginHorizontal: 11 },
  settingTitle: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  settingSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4 },
  divider: { height: 1, marginLeft: 45 },
  version: { textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 27 },
  pressed: { opacity: 0.74 },
});