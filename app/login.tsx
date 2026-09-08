import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { QrPattern } from '@/components/QrPattern';
import { useColors } from '@/hooks/useColors';
import { usePlayer } from '@/context/player-context';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { connectAccount } = usePlayer();
  const [host, setHost] = useState('http://tv.business-cdn-8k.com');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [label, setLabel] = useState('');

  const submit = async () => {
    if (!host.trim() || host.trim() === 'https://' || !username.trim() || !password.trim()) {
      Alert.alert('بيانات ناقصة', 'أدخل رابط السيرفر واسم المستخدم وكلمة المرور للمتابعة.');
      return;
    }
    await connectAccount({ host, username, password, label });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace('/');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={{ paddingTop: insets.top + 15, paddingBottom: insets.bottom + 35 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-right" size={21} color={colors.foreground} />
          </Pressable>
          <Image source={require('../assets/images/icon.png')} style={styles.logo} />
        </View>
        <View style={styles.heading}>
          <Text style={[styles.kicker, { color: colors.primary }]}>WELCOME TO STREAMORA</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>أضف اشتراك IPTV</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>أدخل بيانات مزود الخدمة أو استخدم QR للدخول بسرعة.</Text>
        </View>
        <Pressable
          onPress={() => router.push('/qr')}
          style={({ pressed }) => [styles.qrBanner, { backgroundColor: colors.accent, borderColor: colors.primary }, pressed && styles.pressed]}
        >
          <View style={styles.qrMini}>
            <QrPattern seed="streamora-login" size={47} />
          </View>
          <View style={styles.qrCopy}>
            <Text style={[styles.qrTitle, { color: colors.foreground }]}>الدخول عبر QR</Text>
            <Text style={[styles.qrSubtitle, { color: colors.mutedForeground }]}>امسح رمز مزود الخدمة من الكاميرا</Text>
          </View>
          <Feather name="camera" size={18} color={colors.primary} />
        </Pressable>

        <Text style={[styles.formLabel, { color: colors.foreground }]}>بيانات الاشتراك</Text>
        <Field icon="server" label="رابط السيرفر" value={host} onChangeText={setHost} placeholder="https://provider.com" colors={colors} autoCapitalize="none" keyboardType="url" />
        <Field icon="user" label="اسم المستخدم" value={username} onChangeText={setUsername} placeholder="username" colors={colors} autoCapitalize="none" />
        <Field icon="lock" label="كلمة المرور" value={password} onChangeText={setPassword} placeholder="••••••••" colors={colors} secureTextEntry />
        <Field icon="tag" label="اسم الاشتراك (اختياري)" value={label} onChangeText={setLabel} placeholder="اشتراكي الرئيسي" colors={colors} />

        <Pressable
          onPress={submit}
          style={({ pressed }) => [styles.submitButton, { backgroundColor: colors.primary }, pressed && styles.pressed]}
        >
          <Text style={[styles.submitText, { color: colors.primaryForeground }]}>حفظ والبدء بالمشاهدة</Text>
          <Feather name="arrow-left" size={18} color={colors.primaryForeground} />
        </Pressable>
        <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>بياناتك تُحفظ على هذا الجهاز فقط ولا نوفّر أي قنوات أو محتوى.</Text>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function Field({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  colors,
  ...props
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  colors: ReturnType<typeof useColors>;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'url';
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.field, { backgroundColor: colors.card, borderColor: colors.input }]}>
        <Feather name={icon} size={17} color={colors.mutedForeground} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedForeground}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 42, height: 42, borderRadius: 14 },
  heading: { paddingHorizontal: 20, marginTop: 25 },
  kicker: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 0.8 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28, marginTop: 8 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 19, marginTop: 8 },
  qrBanner: { marginHorizontal: 20, marginTop: 24, borderRadius: 18, borderWidth: 1, padding: 12, flexDirection: 'row', alignItems: 'center' },
  qrMini: { width: 47, height: 47, borderRadius: 9, overflow: 'hidden' },
  qrCopy: { flex: 1, marginHorizontal: 11 },
  qrTitle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  qrSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 10, marginTop: 4 },
  formLabel: { fontFamily: 'Inter_700Bold', fontSize: 16, marginHorizontal: 20, marginTop: 29, marginBottom: 5 },
  fieldWrap: { marginHorizontal: 20, marginTop: 14 },
  fieldLabel: { fontFamily: 'Inter_500Medium', fontSize: 10, marginBottom: 6 },
  field: { minHeight: 52, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  input: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, marginLeft: 10, textAlign: 'left' },
  submitButton: { marginHorizontal: 20, marginTop: 26, minHeight: 54, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 11 },
  submitText: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  disclaimer: { fontFamily: 'Inter_400Regular', fontSize: 9, lineHeight: 15, textAlign: 'center', marginHorizontal: 35, marginTop: 14 },
  pressed: { opacity: 0.75 },
});