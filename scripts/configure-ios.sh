#!/bin/bash
INFO_PLIST="ios/App/App/Info.plist"

# === URL Schemes ===
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes array" "$INFO_PLIST" 2>/dev/null

# App URL scheme for OAuth callback
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0 dict" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLName string com.pieve.shelf" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes array" "$INFO_PLIST"
/usr/libexec/PlistBuddy -c "Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string com.pieve.shelf" "$INFO_PLIST"

# === App Icon ===
ICON_SRC="public/icon-512.svg"
ICON_DST="ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
# SVG icons need conversion - check for PNG first
if [ -f "public/icons/icon-512.png" ]; then
  ICON_SRC="public/icons/icon-512.png"
elif [ -f "public/icon-512.png" ]; then
  ICON_SRC="public/icon-512.png"
fi

if [ -f "$ICON_SRC" ] && [[ "$ICON_SRC" == *.png ]]; then
  sips -z 1024 1024 "$ICON_SRC" --out /tmp/icon_resized.png > /dev/null 2>&1
  sips -s format jpeg -s formatOptions 100 /tmp/icon_resized.png --out /tmp/icon_flat.jpg > /dev/null 2>&1
  sips -s format png /tmp/icon_flat.jpg --out "$ICON_DST" > /dev/null 2>&1
  rm -f /tmp/icon_resized.png /tmp/icon_flat.jpg
  echo "App icon set (alpha removed)"
fi

# === Share Extension ===
# Add the Share Extension target to the Xcode project.
# Requires: APPLE_TEAM_ID, SHARE_API_KEY env vars
# The Ruby script copies source files, creates the target, and configures build settings.
if [ -f "scripts/add-share-extension.rb" ]; then
  echo "Adding Share Extension target..."
  # Ensure xcodeproj gem is available (may already be installed)
  gem install xcodeproj 2>/dev/null || true
  ruby scripts/add-share-extension.rb
  echo "Share Extension added"

  # Set the share extension build number to match the main app
  EXT_INFO_PLIST="ios/App/ShelfShareExtension/Info.plist"
  if [ -f "$EXT_INFO_PLIST" ]; then
    BUILD_NUMBER=${GITHUB_RUN_NUMBER:-1}
    /usr/libexec/PlistBuddy -c "Set :CFBundleVersion $BUILD_NUMBER" "$EXT_INFO_PLIST" 2>/dev/null || true
    echo "Share Extension build number set to $BUILD_NUMBER"
  fi
fi

# === Dark Launch Screen ===

LAUNCH_STORYBOARD="ios/App/App/LaunchScreen.storyboard"
cat > "$LAUNCH_STORYBOARD" << 'LAUNCHXML'
<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="32700.99.1234" targetRuntime="AppleSDK" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="01J-lp-oVM">
    <scenes>
        <scene sceneID="EHf-IW-A2E">
            <objects>
                <viewController id="01J-lp-oVM" sceneMemberID="viewController">
                    <view key="view" contentMode="scaleToFill" id="Ze5-6b-2t3">
                        <rect key="frame" x="0.0" y="0.0" width="393" height="852"/>
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                        <color key="backgroundColor" red="0.102" green="0.094" blue="0.078" alpha="1" colorSpace="custom" customColorSpace="sRGB"/>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="iYj-Kq-Ea1" userLabel="First Responder" sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="53" y="375"/>
        </scene>
    </scenes>
</document>
LAUNCHXML
echo "Dark launch screen installed"

echo "iOS configuration complete"
