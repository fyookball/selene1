import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImportOutlined } from "@ant-design/icons";
import * as bip39 from "bip39";
import Button from "@/components/atoms/Button";
import Accordion from "@/components/atoms/Accordion";
import WalletManagerService from "@/services/WalletManagerService";
import AddressScannerService from "@/services/AddressScannerService";
import DatabaseService from "@/services/DatabaseService";
import LogService from "@/services/LogService";
import { Haptic } from "@/util/haptic";
import { translate } from "@/util/translations";
import translations from "./translations";

import { DEFAULT_DERIVATION_PATH, DERIVATION_PATHS } from "@/util/derivation";

const Log = LogService("WizardImport");

export default function SettingsWalletWizardImport() {
  const navigate = useNavigate();

  const [mnemonicInput, setMnemonicInput] = useState("");
  const [passphraseInput, setPassphraseInput] = useState("");
  const [walletNameInput, setWalletNameInput] = useState(
    translate(translations.importedWalletName)
  );
  const [message, setMessage] = useState("");
  const [derivationPath, setDerivationPath] = useState("auto");

  const handleMnemonicInput = (event) => {
    const sanitizedInput = event.target.value
      .toLowerCase()
      .replace(/[^a-z ]/g, "") // strip all non a-z
      .replace(/ {2,}/g, " "); // strip consecutive spaces

    setMnemonicInput(sanitizedInput);
    setMessage("");
  };

  const handleWalletNameInput = (event) => {
    setWalletNameInput(event.target.value);
  };

  const handlePassphraseInput = (event) => {
    setPassphraseInput(event.target.value);
  };

  const handleDerivationSelect = (event) => {
    setDerivationPath(event.target.value);
  };

  const handleImportWallet = async () => {
    const trimmedInput = mnemonicInput.trim();
    const wordCount = trimmedInput.split(" ").length;
    if (wordCount !== 12 && wordCount !== 24) {
      setMessage(translate(translations.exactWordCount));
      return;
    }

    const isValidMnemonic = bip39.validateMnemonic(trimmedInput);

    if (isValidMnemonic) {
      try {
        const WalletManager = WalletManagerService();

        const tempWallet = WalletManager.createTemporaryWallet({
          mnemonic: trimmedInput,
          passphrase: passphraseInput,
          derivation: DEFAULT_DERIVATION_PATH,
        });

        await WalletManager.openWalletDatabase(tempWallet.walletHash);

        const foundPath =
          derivationPath === "auto"
            ? await AddressScannerService(tempWallet).scanDerivationPaths()
            : derivationPath;

        Log.debug("Found path", foundPath);

        const walletData = {
          ...tempWallet,
          derivation: foundPath,
          name: walletNameInput,
        };

        const walletHash = WalletManager.calculateWalletHash(walletData);
        walletData.walletHash = walletHash;

        await WalletManagerService().importWallet(walletData);
        await DatabaseService().closeWalletDatabase(
          tempWallet.walletHash,
          true
        );

        navigate(`build/${walletHash}`);
      } catch (e) {
        setMessage(translate(translations.alreadyImported));
        await Haptic.error();
      }
    } else {
      setMessage(translate(translations.phraseInvalid));
      await Haptic.error();
    }
  };

  return (
    <>
      <div className="text-2xl text-center text-neutral-900">
        {translate(translations.enterRecoveryPhrase)}
      </div>
      <div className="flex justify-center">
        {message === "" ? (
          <ul className="list-disc list-inside p-2 text-left text-neutral-700">
            <li>{translate(translations.alsoKnownAs)}</li>
            <li>{translate(translations.exactly12Or24)}</li>
          </ul>
        ) : (
          <div className="text-error p-2">{message}</div>
        )}
      </div>
      <div className="rounded-md border-4 border-primary">
        <textarea
          className="w-full text-mono h-36 max-h-36 resize-none"
          onChange={handleMnemonicInput}
          value={mnemonicInput}
          autoComplete="off"
        />
      </div>
      <div className="my-1">
        <label>
          <span className="font-bold">Wallet Name</span>
          <input
            type="text"
            className="w-full border border-primary border-2 rounded-sm p-1"
            onChange={handleWalletNameInput}
            value={walletNameInput}
          />
        </label>
      </div>
      <div className="my-1">
        <Accordion icon={() => null} title="Additional Options">
          <Accordion.Child icon={() => null} label="Passphrase">
            <input
              type="text"
              className="w-full border border-primary"
              onChange={handlePassphraseInput}
              value={passphraseInput}
              autoComplete="off"
            />
          </Accordion.Child>
          <Accordion.Child icon={() => null} label="Derivation Path">
            <select onChange={handleDerivationSelect} value={derivationPath}>
              <option value="auto">Auto</option>
              {DERIVATION_PATHS.map((path) => (
                <option value={path}>{path}</option>
              ))}
            </select>
          </Accordion.Child>
        </Accordion>
      </div>
      <div className="my-2">
        <Button
          label={translate(translations.importWallet)}
          labelSize="lg"
          icon={ImportOutlined}
          iconSize="2xl"
          rounded="md"
          fullWidth
          inverted
          onClick={handleImportWallet}
        />
      </div>
    </>
  );
}
