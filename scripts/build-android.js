const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const projectRoot = path.resolve(__dirname, '..');
const androidRoot = path.join(projectRoot, 'android');
const releaseDir = path.join(projectRoot, 'releases');
const outputPath = path.join(releaseDir, 'streamora-android.apk');

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: 'inherit',
    env: process.env,
  });

  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
}

if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) {
  throw new Error('Android SDK not found. Set ANDROID_HOME or ANDROID_SDK_ROOT before building.');
}

run('pnpm', ['exec', 'expo', 'prebuild', '--platform', 'android', '--no-install']);
run(process.env.GRADLE_BIN || 'gradle', ['-p', androidRoot, 'assembleRelease', '--no-daemon']);

const candidates = [
  path.join(androidRoot, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'),
  path.join(androidRoot, 'app', 'build', 'outputs', 'apk', 'release', 'app-release-unsigned.apk'),
];
const builtApk = candidates.find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).size > 0);

if (!builtApk) {
  throw new Error('Gradle completed but no Android release APK was produced.');
}

fs.mkdirSync(releaseDir, { recursive: true });
fs.copyFileSync(builtApk, outputPath);
console.log(`Android APK ready: ${outputPath}`);