require 'xcodeproj'

# ── Configuration ──
PROJECT_PATH   = 'ios/App/App.xcodeproj'
EXT_NAME       = 'ShelfShareExtension'
EXT_BUNDLE_ID  = 'com.pieve.shelf.share-extension'
EXT_SRC_DIR    = 'share-extension'
EXT_DST_DIR    = "ios/App/#{EXT_NAME}"
TEAM_ID        = ENV['APPLE_TEAM_ID']
SHARE_API_KEY  = ENV['SHARE_API_KEY'] || '__SHARE_API_KEY__'

# ── Open project ──
project = Xcodeproj::Project.open(PROJECT_PATH)
app_target = project.targets.find { |t| t.name == 'App' }

# Check if extension target already exists
if project.targets.find { |t| t.name == EXT_NAME }
  puts "#{EXT_NAME} target already exists, skipping."
  exit 0
end

# ── Copy source files into iOS project ──
require 'fileutils'
FileUtils.mkdir_p(EXT_DST_DIR)

# Copy and template the Swift source (inject API key)
swift_src = File.read("#{EXT_SRC_DIR}/ShareViewController.swift")
swift_src.gsub!('__SHARE_API_KEY__', SHARE_API_KEY)
File.write("#{EXT_DST_DIR}/ShareViewController.swift", swift_src)

# Copy Info.plist
FileUtils.cp("#{EXT_SRC_DIR}/Info.plist", "#{EXT_DST_DIR}/Info.plist")

# Copy entitlements
FileUtils.cp("#{EXT_SRC_DIR}/ShelfShareExtension.entitlements", "#{EXT_DST_DIR}/#{EXT_NAME}.entitlements")

puts "Source files copied to #{EXT_DST_DIR}"

# ── Create the extension target ──
ext_target = project.new_target(
  :app_extension,
  EXT_NAME,
  :ios,
  '16.0'  # minimum deployment target
)

# ── Add source files to the target ──
# Create a group with a path relative to the project (SRCROOT = ios/App/)
ext_group = project.main_group.new_group(EXT_NAME, EXT_NAME)

swift_ref = ext_group.new_file('ShareViewController.swift')
ext_target.source_build_phase.add_file_reference(swift_ref)

# ── Configure build settings ──
# Paths in build settings are relative to SRCROOT (ios/App/)
ext_target.build_configurations.each do |config|
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = EXT_BUNDLE_ID
  config.build_settings['INFOPLIST_FILE'] = "#{EXT_NAME}/Info.plist"
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] = "#{EXT_NAME}/#{EXT_NAME}.entitlements"
  config.build_settings['SWIFT_VERSION'] = '5.0'
  config.build_settings['TARGETED_DEVICE_FAMILY'] = '1,2'
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '16.0'
  config.build_settings['GENERATE_INFOPLIST_FILE'] = 'NO'
  config.build_settings['CURRENT_PROJECT_VERSION'] = '1'
  config.build_settings['MARKETING_VERSION'] = '1.0'
  config.build_settings['PRODUCT_NAME'] = EXT_NAME
  config.build_settings['SKIP_INSTALL'] = 'YES'

  # Signing — will be configured by configure-signing.rb
  if TEAM_ID
    config.build_settings['DEVELOPMENT_TEAM'] = TEAM_ID
  end
end

# ── Add extension as a dependency + embed it ──
app_target.add_dependency(ext_target)

# Create "Embed App Extensions" copy files build phase if it doesn't exist
embed_phase = app_target.build_phases.find { |bp|
  bp.is_a?(Xcodeproj::Project::Object::PBXCopyFilesBuildPhase) &&
  bp.symbol_dst_subfolder_spec == :plug_ins
}

unless embed_phase
  embed_phase = project.new(Xcodeproj::Project::Object::PBXCopyFilesBuildPhase)
  embed_phase.name = 'Embed App Extensions'
  embed_phase.symbol_dst_subfolder_spec = :plug_ins
  app_target.build_phases << embed_phase
end

# Add the extension product to the embed phase
ext_product_ref = ext_target.product_reference
build_file = embed_phase.add_file_reference(ext_product_ref)
build_file.settings = { 'ATTRIBUTES' => ['RemoveHeadersOnCopy'] }

# ── Also add App Groups entitlements to the main App target ──
# Create entitlements file for the main app if it doesn't exist
app_entitlements_path = 'ios/App/App/App.entitlements'
unless File.exist?(app_entitlements_path)
  File.write(app_entitlements_path, <<-'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.security.application-groups</key>
	<array>
		<string>group.com.pieve.shelf</string>
	</array>
</dict>
</plist>
PLIST
  )
  puts "Created App.entitlements with App Groups"
end

# Set the entitlements on the main app target
app_target.build_configurations.each do |config|
  config.build_settings['CODE_SIGN_ENTITLEMENTS'] = 'App/App.entitlements'
end

# ── Save ──
project.save
puts "Share extension target '#{EXT_NAME}' added to project."
puts "Bundle ID: #{EXT_BUNDLE_ID}"
puts "API key injected: #{SHARE_API_KEY[0..3]}...#{SHARE_API_KEY[-4..]}" if SHARE_API_KEY.length > 8
