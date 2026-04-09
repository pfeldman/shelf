require 'xcodeproj'

team_id = ENV['APPLE_TEAM_ID']
pp_uuid = ENV['PP_UUID']
ext_pp_uuid = ENV['EXT_PP_UUID']

project = Xcodeproj::Project.open('ios/App/App.xcodeproj')

# ── Configure main App target ──
target = project.targets.find { |t| t.name == 'App' }

target.build_configurations.each do |config|
  config.build_settings['CODE_SIGN_STYLE'] = 'Manual'
  config.build_settings['CODE_SIGN_IDENTITY'] = 'Apple Distribution'
  config.build_settings['DEVELOPMENT_TEAM'] = team_id
  config.build_settings['PROVISIONING_PROFILE'] = pp_uuid
  config.build_settings['PROVISIONING_PROFILE_SPECIFIER'] = ''
end

puts "Signing configured for App target: team=#{team_id}, profile=#{pp_uuid}"

# ── Configure Share Extension target ──
ext_target = project.targets.find { |t| t.name == 'ShelfShareExtension' }

if ext_target
  ext_profile = ext_pp_uuid || pp_uuid  # Fall back to main profile if extension profile not set
  ext_target.build_configurations.each do |config|
    config.build_settings['CODE_SIGN_STYLE'] = 'Manual'
    config.build_settings['CODE_SIGN_IDENTITY'] = 'Apple Distribution'
    config.build_settings['DEVELOPMENT_TEAM'] = team_id
    config.build_settings['PROVISIONING_PROFILE'] = ext_profile
    config.build_settings['PROVISIONING_PROFILE_SPECIFIER'] = ''
  end
  puts "Signing configured for ShelfShareExtension target: team=#{team_id}, profile=#{ext_profile}"
else
  puts "ShelfShareExtension target not found, skipping extension signing."
end

project.save
