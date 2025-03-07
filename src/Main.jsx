import { StrictMode as ReactStrictMode } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "@/apolloClient";
import { store } from "./redux";

import "./index.css";

import MainLayout from "@/layout/MainLayout";
import ErrorBoundary from "@/layout/ErrorBoundary";

import { routeWallet } from "@/routes/routeWallet";
import { routeAssets } from "@/routes/routeAssets";
import { routeExplore } from "@/routes/routeExplore";
import { routeSettings } from "@/routes/routeSettings";
import { routeApps } from "@/routes/routeApps";

export default function Main() {
  const routes = [
    {
      element: <MainLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: "/",
          element: <Navigate to="/wallet" />,
        },
        ...routeWallet,
        ...routeAssets,
        ...routeExplore,
        ...routeSettings,
        ...routeApps,
        {
          path: "/credits",
          async lazy() {
            const { default: CreditsView } = await import(
              "@/views/credits/CreditsView"
            );
            return { Component: CreditsView };
          },
        },
        {
          path: "/debug",
          async lazy() {
            const { default: DebugView } = await import(
              "@/views/debug/DebugView"
            );
            return { Component: DebugView };
          },
        },
      ],
    },
  ];

  const router = createBrowserRouter(routes);

  return (
    <ReactStrictMode>
      <Provider store={store}>
        <ApolloProvider client={apolloClient}>
          {/* Note: Duration has an inbuilt extra 1000ms dismissal delay */}
          <Toaster
            toastOptions={{ duration: 1250 }}
            containerClassName="toaster"
          />
          <RouterProvider router={router} />
        </ApolloProvider>
      </Provider>
    </ReactStrictMode>
  );
}
