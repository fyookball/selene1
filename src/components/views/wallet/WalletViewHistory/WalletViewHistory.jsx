import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { DateTime } from "luxon";
import {
  SyncOutlined,
  HourglassOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { selectTransactionHistory, txHistoryFetch } from "@/redux/txHistory";
import { selectSyncState } from "@/redux/sync";
import translations from "./translations";
import { translate } from "@/util/translations";

import ViewHeader from "@/layout/ViewHeader";
import Satoshi from "@/atoms/Satoshi";

function useTransactionHistory() {
  const dispatch = useDispatch();
  const txHistory = useSelector(selectTransactionHistory);

  useEffect(
    function loadTxHistory() {
      dispatch(txHistoryFetch());
    },
    [dispatch]
  );

  return txHistory;
}

export default function WalletViewHistory() {
  const txHistory = useTransactionHistory();
  const { syncPending } = useSelector(selectSyncState);

  const receiveStyle = "text-secondary";
  const sendStyle = "text-error";

  return (
    <div className="flex flex-col justify-start h-full">
      <ViewHeader
        icon={HistoryOutlined}
        title={translate(translations.recentTransactions)}
        small
      />
      <div className="h-full pb-2">
        <ul className="bg-zinc-100 text-zinc-500 divide-y divide-zinc-300 rounded-b-sm px-1 overflow-y-scroll border border-zinc-400 shadow-inner h-full">
          {txHistory.length === 0 && (
            <li className="flex px-1 py-2 items-center justify-center tracking-tighter font-bold">
              {syncPending.txHistory === 0 ? (
                <span>-----</span>
              ) : (
                <SyncOutlined className="text-3xl" spin />
              )}
            </li>
          )}
          {txHistory.map((tx, i) =>
            i < 100 ? (
              <li key={`${tx.txid}${tx.address}`} className="py-2">
                <Link to={`/explore/tx/${tx.txid}`}>
                  <div className="flex text-sm">
                    <div className="shrink flex flex-col items-center justify-center mr-1 text-xs">
                      {tx.height <= 0 ? (
                        <HourglassOutlined className="text-zinc-400" />
                      ) : (
                        <CheckCircleOutlined className="text-primary" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div
                        className={`${tx.amount > 0 ? receiveStyle : sendStyle}`}
                      >
                        {(tx.height <= 0
                          ? DateTime.fromISO(tx.time_seen)
                          : DateTime.fromSeconds(tx.time)
                        ).toLocaleString(DateTime.DATE_SHORT)}
                      </div>
                      <div>
                        {(tx.height <= 0
                          ? DateTime.fromISO(tx.time_seen)
                          : DateTime.fromSeconds(tx.time)
                        ).toLocaleString(DateTime.TIME_WITH_SECONDS)}
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <div
                        className={`font-mono ${
                          tx.amount > 0 ? receiveStyle : sendStyle
                        }`}
                      >
                        {tx.amount > 0 && "+"}
                        <Satoshi value={tx.amount} />
                      </div>
                      <div>
                        <Satoshi value={tx.amount} flip />
                      </div>
                    </div>
                  </div>
                  {tx.memo && (
                    <div className="text-sm text-zinc-500">Memo: {tx.memo}</div>
                  )}
                </Link>
              </li>
            ) : null
          )}
        </ul>
      </div>
    </div>
  );
}
