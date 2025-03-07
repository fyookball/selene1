# create .env symlinks for android and ios projects
# Execute from project root!
touch ./.env
ln -sv ../../.env android/fastlane/.env 2>/dev/null
ln -sv ../../../.env ios/App/fastlane/.env 2>/dev/null
