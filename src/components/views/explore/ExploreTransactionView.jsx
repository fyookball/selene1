/* eslint-disable react/prop-types */
import { useLoaderData, Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Clipboard } from "@capacitor/clipboard";
import { DateTime } from "luxon";
import {
  CopyOutlined,
  ArrowLeftOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { selectCurrencySettings } from "@/redux/preferences";
import { selectActiveWallet } from "@/redux/wallet";
import { selectChaintip } from "@/redux/sync";

import TransactionHistoryService from "@/services/TransactionHistoryService";
import ToastService from "@/services/ToastService";
//import LogService from "@/services/LogService";

import Address from "@/atoms/Address";
import Satoshi from "@/atoms/Satoshi";
import Accordion from "@/atoms/Accordion";
import Button from "@/atoms/Button";

import { translate } from "@/util/translations";
import translations from "./translations";

//const Log = LogService("ExploreTransactionView");

export default function ExploreTransactionView() {
  const navigate = useNavigate();
  const tx = useLoaderData();

  const wallet = useSelector(selectActiveWallet);
  const { localCurrency } = useSelector(selectCurrencySettings);
  const chaintip = useSelector(selectChaintip);

  const memo = TransactionHistoryService(
    wallet,
    localCurrency
  ).getTransactionMemo(tx.txid);

  const isConfirmed = tx.blockhash !== null;
  const confirmations = isConfirmed ? chaintip.height - tx.height : 0;

  const txDate = (
    isConfirmed ? DateTime.fromSeconds(tx.time) : DateTime.fromISO(tx.time_seen)
  ).toLocaleString(DateTime.DATETIME_FULL);

  const handleCopyTransactionId = async () => {
    await Clipboard.write({ string: tx.txid });
    ToastService().clipboardCopy("Transaction ID", tx.txid);
  };

  //Log.debug(tx, confirmations);

  return (
    <>
      <div
        className="p-2 bg-zinc-100 border-b border-zinc-400"
        onClick={handleCopyTransactionId}
      >
        <span className="text-lg font-semibold mr-1">Transaction ID:</span>
        <span className="break-all font-mono text-sm">{tx.txid}</span>
        <CopyOutlined className="ml-1" />
      </div>
      <div className="p-2">
        <div className="text-zinc-700 font-bold flex items-center justify-start">
          <span>{txDate}</span>
        </div>
        {isConfirmed ? (
          <div className="flex items-center font-bold text-zinc-500 text-sm">
            <CheckCircleOutlined className="text-secondary mr-1" /> Confirmed in
            block #{tx.height}
            <span className="text-zinc-500/80 ml-1">
              [{confirmations} blocks]
            </span>
          </div>
        ) : (
          <div className="flex items-center font-bold text-zinc-500 text-sm">
            <HourglassOutlined className="text-zinc-500 mr-1" /> Pending
            Confirmation
          </div>
        )}
        {memo && (
          <div className="text-zinc-800 my-2">
            <span className="font-bold">Memo:</span> {memo}
          </div>
        )}
        <div className="mt-1.5">
          <Accordion title="Outputs" open>
            {tx.vout.map((output, i) => (
              <OutputListItem key={output.n} output={output} i={i} />
            ))}
          </Accordion>
          <Accordion title="Inputs">
            {tx.vin.map((input, i) => (
              <InputListItem
                key={`${input.txid}:${input.vout}`}
                input={input}
                i={i}
              />
            ))}
          </Accordion>
        </div>
      </div>
      <Button
        label={translate(translations.back)}
        icon={ArrowLeftOutlined}
        fullWidth
        onClick={() => navigate(-1)}
      />
    </>
  );
}

function OutputListItem({ output, i }) {
  const zebraCss = i % 2 === 0 ? "bg-zinc-100" : "bg-zinc-50";

  const isOpReturn =
    output.type === "nulldata" || !output.scriptPubKey.addresses;

  return (
    <div className={`p-1.5 ${zebraCss}`}>
      <div className="flex text-sm items-center">
        {isOpReturn ? (
          <div className="font-mono font-bold">OP_RETURN</div>
        ) : (
          <div>
            <Address address={output.scriptPubKey.addresses[0]} />
          </div>
        )}
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

function InputListItem({ input, i }) {
  const zebraCss = i % 2 === 0 ? "bg-zinc-100" : "bg-zinc-50";

  return (
    <div className={`p-1.5 ${zebraCss} truncate tracking-tight`}>
      <Link className="font-mono text-xs" to={`/explore/tx/${input.txid}`}>
        {input.txid}:{input.vout}
      </Link>
    </div>
  );
}
