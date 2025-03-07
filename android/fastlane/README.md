fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## Android

### android package

```sh
[bundle exec] fastlane android package
```

Build .aab and .apk packages for current version

### android screenshots

```sh
[bundle exec] fastlane android screenshots
```

Generates screenshots

### android deploy_testflight

```sh
[bundle exec] fastlane android deploy_testflight
```

Submit a new Release Candidate to Google Play Beta Track

### android deploy

```sh
[bundle exec] fastlane android deploy
```

Deploy a new version to the Google Play

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
