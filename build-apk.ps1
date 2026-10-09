# ==============================================================================
# Aegis Protocol Native Android APK Build Script
# Standalone high-speed build using Android SDK Build-Tools 36.0.0 & Java 21
# ==============================================================================

$ErrorActionPreference = "Stop"

$SdkDir = "C:\Users\w\Android\Sdk"
$BuildTools = "$SdkDir\build-tools\36.0.0"
$AndroidJar = "$SdkDir\platforms\android-36\android.jar"
$JavaHome = "C:\Program Files\Java\jdk-21"
$Javac = "$JavaHome\bin\javac.exe"
$Jar = "$JavaHome\bin\jar.exe"
$Keytool = "$JavaHome\bin\keytool.exe"

$Aapt2 = "$BuildTools\aapt2.exe"
$D8 = "$BuildTools\d8.bat"
$Zipalign = "$BuildTools\zipalign.exe"
$ApkSigner = "$BuildTools\apksigner.bat"

Write-Host "[Aegis Build] Initializing Native APK Build..." -ForegroundColor Cyan

# 1. Clean & create build directories
$BuildDir = "android-native\build"
if (Test-Path $BuildDir) { Remove-Item -Recurse -Force $BuildDir }
New-Item -ItemType Directory -Force -Path "$BuildDir\compiled_res", "$BuildDir\gen", "$BuildDir\classes", "$BuildDir\dex" | Out-Null

# 2. Compile Resources
Write-Host "[1/6] Compiling resources with aapt2..." -ForegroundColor Yellow
& $Aapt2 compile --dir "android-native\res" -o "$BuildDir\compiled_res\res.zip"

# 3. Link Resources & Generate R.java & Unaligned APK
Write-Host "[2/6] Linking resources & generating unaligned APK..." -ForegroundColor Yellow
& $Aapt2 link -o "$BuildDir\unaligned.apk" `
    -I $AndroidJar `
    --manifest "android-native\AndroidManifest.xml" `
    --java "$BuildDir\gen" `
    --auto-add-overlay `
    "$BuildDir\compiled_res\res.zip"

# 4. Compile Java Sources
Write-Host "[3/6] Compiling Java sources with javac..." -ForegroundColor Yellow
$ClassPath = "$AndroidJar;android-native\libs\wireguard-tunnel.jar;android-native\libs\collection-1.2.0.jar;android-native\libs\annotation-1.6.0.jar"
$Sources = Get-ChildItem -Recurse "android-native\src\*.java", "$BuildDir\gen\*.java" | ForEach-Object { $_.FullName }

& $Javac -encoding UTF-8 -cp $ClassPath -d "$BuildDir\classes" $Sources

# 5. Dex with D8
Write-Host "[4/6] Converting bytecode to Dalvik Executable (classes.dex) with d8..." -ForegroundColor Yellow
$ClassFiles = Get-ChildItem -Recurse "$BuildDir\classes\*.class" | ForEach-Object { $_.FullName }
& $D8 --output "$BuildDir\dex" `
    --min-api 24 `
    --lib $AndroidJar `
    $ClassFiles `
    "android-native\libs\wireguard-tunnel.jar" `
    "android-native\libs\collection-1.2.0.jar" `
    "android-native\libs\annotation-1.6.0.jar"

# 6. Assemble APK with classes.dex and native JNI libraries
Write-Host "[5/6] Bundling classes.dex and native WireGuard Go engine (lib/)..." -ForegroundColor Yellow

# Copy classes.dex into unaligned.apk
& $Jar uf "$BuildDir\unaligned.apk" -C "$BuildDir\dex" classes.dex

# Prepare native libraries directory (lib/arm64-v8a, lib/armeabi-v7a, etc.)
$NativeStaging = "$BuildDir\native_staging"
New-Item -ItemType Directory -Force -Path "$NativeStaging\lib" | Out-Null
Copy-Item -Recurse -Force "android-native\libs\jni\*" "$NativeStaging\lib"

& $Jar uf "$BuildDir\unaligned.apk" -C "$NativeStaging" lib

# 7. ZipAlign & Sign
Write-Host "[6/6] Aligning & signing APK..." -ForegroundColor Yellow
& $Zipalign -f -v -p 4 "$BuildDir\unaligned.apk" "$BuildDir\aligned.apk" | Out-Null

$Keystore = "android-native\debug.keystore"
if (-not (Test-Path $Keystore)) {
    Write-Host "Creating debug signing keystore..." -ForegroundColor Cyan
    & $Keytool -genkey -v -keystore $Keystore -storepass android -keypass android -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=AegisProtocol,OU=Mesh,O=Security,C=US"
}

$FinalApk = "$BuildDir\AegisProtocol.apk"
& $ApkSigner sign --ks $Keystore --ks-pass pass:android --key-pass pass:android --out $FinalApk "$BuildDir\aligned.apk"

# Verify signature
& $ApkSigner verify -v $FinalApk

$ApkInfo = Get-Item $FinalApk
Write-Host "==============================================================================" -ForegroundColor Green
Write-Host "AEGIS PROTOCOL NATIVE ANDROID APK BUILT SUCCESSFULLY!" -ForegroundColor Green
Write-Host "File: $($ApkInfo.FullName)" -ForegroundColor Green
Write-Host "Size: $([math]::Round($ApkInfo.Length / 1MB, 2)) MB" -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Green
