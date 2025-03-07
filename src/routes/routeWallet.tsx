import WalletView from "@/views/wallet/WalletView";
import WalletViewHome from "@/views/wallet/WalletViewHome/WalletViewHome";
import WalletViewSend from "@/views/wallet/WalletViewSend/WalletViewSend";
import WalletViewPay from "@/views/wallet/WalletViewPay/WalletViewPay";
import WalletViewSweep from "@/views/wallet/WalletViewSweep/WalletViewSweep";
import WalletViewSendSuccess from "@/views/wallet/WalletViewSendSuccess/WalletViewSendSuccess";

export const routeWallet = [
  {
    path: "/wallet",
    element: <WalletView />,
    children: [
      {
        index: true,
        element: <WalletViewHome />,
      },
      {
        path: "send/",
        element: <WalletViewSend />,
      },
      {
        path: "send/:address",
        element: <WalletViewSend />,
      },
      {
        path: "pay/",
        element: <WalletViewPay />,
      },
      {
        path: "send/success",
        element: <WalletViewSendSuccess />,
      },
      {
        path: "sweep/:wif",
        element: <WalletViewSweep />,
      },
      {
        path: "history",
        async lazy() {
          const { default: WalletViewHistory } = await import(
            "@/views/wallet/WalletViewHistory/WalletViewHistory"
          );
          return { Component: WalletViewHistory };
        },
      },
    ],
  },
];
