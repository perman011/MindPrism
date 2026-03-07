#!/bin/bash
# App Icon Generation for MindPrism
# Source logo: attached_assets/77531E8D-B1EB-4D23-A577-C8EC54A4B63C_1772158344341.png
#
# iOS requires icons at: 20, 29, 40, 60, 76, 83.5, 1024 (2x/3x variants)
# Android requires: mdpi (48), hdpi (72), xhdpi (96), xxhdpi (144), xxxhdpi (192), play store (512)
#
# Usage: Run with ImageMagick or use a service like makeappicon.com
# 1. Take the source logo and add a deep purple (#0a0118) background
# 2. Center the gold feather quill on the purple background
# 3. Generate all required sizes
#
# For now, Capacitor will use the default icons until custom icons are generated.
echo "Generate icons using the source logo and upload to ios/App/App/Assets.xcassets/AppIcon.appiconset/ and android/app/src/main/res/mipmap-*/"
