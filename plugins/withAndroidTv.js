const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withAndroidTv(config) {
  return withAndroidManifest(config, (manifestConfig) => {
    const manifest = manifestConfig.modResults.manifest;
    const application = manifest.application?.[0];
    const activity = application?.activity?.find(
      (item) => item.$?.['android:name'] === '.MainActivity' || item.$?.['android:name']?.endsWith('.MainActivity'),
    );

    if (activity) {
      const filters = activity['intent-filter'] || [];
      const launchFilter = filters.find((filter) =>
        filter.category?.some((category) => category.$?.['android:name'] === 'android.intent.category.LAUNCHER'),
      );
      const targetFilter = launchFilter || filters[0] || { action: [], category: [] };
      targetFilter.category = targetFilter.category || [];
      if (!targetFilter.category.some((category) => category.$?.['android:name'] === 'android.intent.category.LEANBACK_LAUNCHER')) {
        targetFilter.category.push({ $: { 'android:name': 'android.intent.category.LEANBACK_LAUNCHER' } });
      }
      if (!filters.includes(targetFilter)) filters.push(targetFilter);
      activity['intent-filter'] = filters;
    }

    manifest['uses-feature'] = manifest['uses-feature'] || [];
    if (!manifest['uses-feature'].some((feature) => feature.$?.['android:name'] === 'android.software.leanback')) {
      manifest['uses-feature'].push({
        $: {
          'android:name': 'android.software.leanback',
          'android:required': 'false',
        },
      });
    }
    if (!manifest['uses-feature'].some((feature) => feature.$?.['android:name'] === 'android.hardware.touchscreen')) {
      manifest['uses-feature'].push({
        $: {
          'android:name': 'android.hardware.touchscreen',
          'android:required': 'false',
        },
      });
    }

    return manifestConfig;
  });
};