//import { Geolocation } from "@capacitor/geolocation";

import ExploreView from "@/views/explore/ExploreView";
import ExploreViewHome from "@/views/explore/ExploreViewHome";

import TransactionManagerService from "@/services/TransactionManagerService";

export const routeExplore = [
  {
    path: "/explore",
    element: <ExploreView />,
    children: [
      {
        index: true,
        element: <ExploreViewHome />,
      },
      {
        path: "tx/:txid",
        async lazy() {
          const { default: ExploreTransactionView } = await import(
            "@/views/explore/ExploreTransactionView"
          );
          return { Component: ExploreTransactionView };
        },
        loader: async ({ params }) => {
          return TransactionManagerService().resolveTransaction(params.txid);
        },
      },
      /*{
        path: "map",
        async lazy() {
          const { default: ExploreMapView } = await import(
            "@/views/explore/map/ExploreMapView"
          );
          return { Component: ExploreMapView };
        },
        loader: async () =>
          Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
          }),
      },*/
      {
        path: "contacts",
        async lazy() {
          const { default: ExploreContactsView } = await import(
            "@/views/explore/contacts/ExploreContactsView"
          );
          return { Component: ExploreContactsView };
        },
      },
      {
        path: "help",
        async lazy() {
          const { default: ExploreHelpView } = await import(
            "@/views/explore/help/ExploreHelpView"
          );
          return { Component: ExploreHelpView };
        },
      },
      {
        path: "info",
        async lazy() {
          const { default: ExploreInfoView } = await import(
            "@/views/explore/info/ExploreInfoView"
          );
          return { Component: ExploreInfoView };
        },
      },
    ],
  },
];
