#!/bin/sh
# this gets executed from ios/App/fastlane dir by fastlane
sed -i.bak 's/source="$(readlink "${source}")"/source="$(readlink -f "${source}")"/' '../Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh' && rm -f '../Pods/Target Support Files/Pods-App/Pods-App-frameworks.sh.bak'
