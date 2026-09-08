/**
 * Release values are injected when an Android build is made.
 *
 * Keeping these values empty by default is intentional: a local preview must
 * never advertise a made-up APK URL or Downloader code. The release build
 * supplies both values through EXPO_PUBLIC_ANDROID_APK_URL and
 * EXPO_PUBLIC_DOWNLOADER_CODE.
 */
export const releaseInfo = {
  apkUrl: (process.env.EXPO_PUBLIC_ANDROID_APK_URL || '').trim(),
  downloaderCode: (process.env.EXPO_PUBLIC_DOWNLOADER_CODE || 'STREAMORA').trim(),
  version: '1.0.0',
};