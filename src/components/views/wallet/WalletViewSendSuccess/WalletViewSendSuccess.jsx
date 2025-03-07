import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Clipboard } from "@capacitor/clipboard";
import { CopyOutlined, CheckCircleFilled } from "@ant-design/icons";
import { useSelector } from "react-redux";
import { selectCurrencySettings } from "@/redux/preferences";
import { selectActiveWallet } from "@/redux/wallet";

import TransactionHistoryService from "@/services/TransactionHistoryService";
import ToastService from "@/services/ToastService";

import Address from "@/atoms/Address";
import Satoshi from "@/atoms/Satoshi";

import { logos } from "@/util/logos";
import { translate } from "@/util/translations";
import translations from "./translations";

function WalletViewSendSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tx, header, prefillMemo } = location.state;

  const wallet = useSelector(selectActiveWallet);
  const { localCurrency } = useSelector(selectCurrencySettings);

  const [memo, setMemo] = useState(prefillMemo || "");

  const handleMemoChange = (event) => {
    setMemo(event.target.value);
    TransactionHistoryService(wallet, localCurrency).setTransactionMemo(
      tx.txid,
      event.target.value
    );
  };

  const handleCopyTransactionId = async (event) => {
    event.stopPropagation();

    await Clipboard.write({ string: tx.txid });
    ToastService().clipboardCopy("Transaction ID", tx.txid);
  };

  return (
    <div
      className="fixed top-0 left-0 w-screen h-screen z-50 bg-primary"
      onClick={() => navigate("/")}
    >
      <div className="flex items-center justify-center p-4 h-56 bg-zinc-800 shadow">
        <img src={logos.selene.img} className="h-full" alt="" />
      </div>
      <div className="p-1 bg-primary text-white shadow-inner">
        <div className="p-2 flex justify-center items-center">
          <span className="text-4xl font-bold">
            {header || translate(translations.transactionSent)}
          </span>
        </div>
        <div className="p-2 flex justify-center items-center">
          <span className="text-2xl font-semibold">
            {translate(translations.tapAnywhereToContinue)}
          </span>
        </div>
      </div>
      <div className="p-2">
        <div
          className="border rounded mb-2 border-primary"
          onClick={handleCopyTransactionId}
        >
          <div className="p-1 bg-zinc-500 rounded-t-sm">
            <span className="font-semibold text-zinc-200">
              Transaction ID <CopyOutlined />
            </span>
          </div>
          <div className="bg-zinc-200 p-1 rounded-b-sm">
            <span className="font-mono text-sm tracking-tighter break-all select-none">
              {tx.txid}
            </span>
          </div>
        </div>
        <div
          className="border rounded mb-2 border-primary"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1 bg-zinc-500 rounded-t-sm">
            <span className="font-semibold text-zinc-200">Memo</span>
          </div>
          <div className="bg-zinc-200 p-1 rounded-b-sm flex items-center">
            <input
              type="text"
              className="flex-1 rounded-sm p-1"
              value={memo}
              onChange={handleMemoChange}
            />
            {memo && (
              <CheckCircleFilled className="shrink text-primary text-lg ml-2 mr-1 font-bold" />
            )}
          </div>
        </div>
        <div
          className="bg-zinc-200 p-1 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-semibold pb-1 text-sm">Outputs</div>
          {tx.vout.map((output, i) => (
            <OutputListItem key={output.n} output={output} i={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default WalletViewSendSuccess;

/* eslint-disable react/prop-types */
function OutputListItem({ output, i }) {
  const zebraCss = i % 2 === 0 ? "bg-zinc-100" : "bg-zinc-50";

  return (
    <div className={`p-1.5 ${zebraCss} rounded-sm`}>
      <div className="flex text-sm items-center">
        <div>
          <Address address={output.scriptPubKey.addresses[0]} />
        </div>
      </div>
      <div className="">
        <span className="text-xs tracking-tighter mr-1.5 opacity-70">
          #{output.n}
        </span>
        <span className="font-mono">
          <Satoshi value={output.value} />
        </span>
        <span className="mx-1 text-zinc-500">/</span>
        <span className="text-sm opacity-80">
          <Satoshi value={output.value} flip />
        </span>
      </div>
    </div>
  );
}
