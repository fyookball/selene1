
## Capacitor Plugin "Torboar" developer steps.

1. git clone https://github.com/fyookball/selene1/
2. cd selene1
3. git checkout b2
4. yarn install
5. cd torboar
6. yarn install
7. yarn build
8. cd ..
9. yarn add file:./torboar
10. yarn pretty
11. yarn run build
12. npx cap sync android
13. npx cap run android
14. After the emulator shows the wallet, open a new terminal and look for the output with adb logcat | grep -i "torboar"


# Selene Wallet: Join the Cash Economy!

[![Latest Release](https://git.xulu.tech/selene.cash/selene-wallet/-/badges/release.svg)](https://git.xulu.tech/selene.cash/selene-wallet/-/releases)

Website: https://selene.cash

Documentation: https://docs.selene.cash

We are fulfilling the mission of making Bitcoin Cash (BCH) the [global reserve currency](https://bitcoincashpodcast.com/faqs/Global-Reserve-Currency/what-do-you-mean-global-reserve-currency) by building a sleek, robust, user-friendly wallet that makes joining the BCH economy as easy and compelling as possible.

## Developer Quick Start

1. `git clone https://git.xulu.tech/selene.cash/selene-wallet`
2. `cd selene-wallet`
3. `yarn install`
4. `yarn run build`
5. `yarn dev`
6. http://localhost:5173

### Selene Server

You may also wish to run the [Selene Server](https://git.xulu.tech/selene.cash/selene-server) locally for statistics & other features, but the production server is fine for most purposes.

If you are running Selene Server locally, make sure to update the server URL in `src/apolloClient.tsx`.

## Building for Android

1. Install [Android Studio](https://developer.android.com/studio)
2. `yarn run build`
3. `npx cap sync`
4. `npx cap run android`
5. (optional) `npx cap open android` to open the app in android studio

## Building for iOS

1. Install [Xcode](https://developer.apple.com/xcode/)
2. `yarn run build`
3. `npx cap sync`
4. `npx cap run ios`
5. (optional) `npx cap open ios` to open the app in Xcode

## Contribution and Contact

Questions: [Telegram group](https://t.me/SeleneWallet)

Contributors: [Contributing](./CONTRIBUTING.md)

Testers: [Testing document](https://docs.google.com/document/d/1VKXeuwlIPFrudwEBrdtg6zIuC2rSF4QRginuq3C_-ro/edit?usp=sharing)

## Dev notes

### For merging from PRs to mirror

```
$ git remote add gitlabMirror https://gitlab.com/selene.cash/selene-wallet.git
# Replace the merge request number & choose a branch name
$ git fetch gitlabMirror merge-requests/1111111/head:MY_NEW_BRANCH
# Now that branch is local and can be merged as usual
$ git merge MY_NEW_BRANCH
```

### Auto-translations

Manually managing translations got super tiresome & unwieldy with so many languages, so it has been automated.

```
# Use a valid API key
$ GOOGLE_TRANSLATE_API_KEY="XXXXXXXXX" node ./automation/addLanguages.js
# Please read below about the cost of API credits!!
```

Translation files are colocated with the file needing the translation strings. The script scans the entire `src` folder for files that begin exactly `const translations = {`. For every found file, it recursively looks through the objects from until it hits an object containing an "en" key, translates it into every language key we support (skipping any that are already known), and overwrites the original file with the new values included in alphabetical order by language-key.

NOTE: Translation files cannot include ":" or "'" within the string values, as this will be incorrectly confused for JSON notation. You can prefer "-" to ":" and "`" to "'" to avoid this. The script will auto-replace any of those characters that appear in the translated version (which they sometimes do).

Start of a translation file sample:

BEFORE:

```
const translations = {
  walletSettings: {
    da: "Indstillinger for Tegnebog",
    de: "Wallet-Einstellungen",
    en: "Wallet Settings",
    es: "Configuración de la billetera",
```

AFTER:

```
const translations = {
  walletSettings: {
    ar: "إعدادات المحفظة",
    bn: "ওয়ালেট সেটিংস",
    da: "Indstillinger for Tegnebog",
    de: "Wallet-Einstellungen",
    el: "Ρυθμίσεις πορτοφολιού",
    en: "Wallet Settings",
    es: "Configuración de la billetera",
    fa: "تنظیمات کیف پول",
```

Translations are done with Google Cloud Translation API. It isn't super expensive, but it does cost money per translation. You can run the script to test, it skips over existing translations and only fills in missing translations, but if you're adding new text please don't run up the bill by running it unnecessarily. Decide on the English versions as part of concluding your feature pull request, prepare the translation files, then run translations script once to fill everything out.

NOTE: There is a bug in `src/components/views/walletView/WalletViewSend/translations.js` with the "notEnoughFee" key. Before running translation, copy-paste that key into a separate document, run the translation, then afterwards return the "notEnoughFee" key. Also, manually add any new "notEnoughFee" translations. If you don't do this, the entire file will miss out on having its translations updated.
