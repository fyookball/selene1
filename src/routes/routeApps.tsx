import AppsView from "@/views/apps/AppsView";

export const routeApps = [
  {
    path: "/apps",
    element: <AppsView />,
  },
  {
    path: "/apps/stats",
    async lazy() {
      const { default: AppStatsView } = await import(
        "@/views/apps/stats/AppStatsView"
      );
      return { Component: AppStatsView };
    },
  },
  {
    path: "/apps/price",
    async lazy() {
      const { default: AppPriceView } = await import(
        "@/views/apps/price/AppPriceView"
      );
      return { Component: AppPriceView };
    },
  },
  {
    path: "/apps/faqs",
    async lazy() {
      const { default: ExploreFaqsView } = await import(
        "@/views/apps/faqs/ExploreFaqsView"
      );
      return { Component: ExploreFaqsView };
    },
  },
  {
    path: "/apps/socialMedia",
    async lazy() {
      const { default: ExploreSocialMediaView } = await import(
        "@/views/apps/socialMedia/ExploreSocialMediaView"
      );
      return { Component: ExploreSocialMediaView };
    },
  },
  {
    path: "/apps/afog",
    async lazy() {
      const { default: ExploreAfogView } = await import(
        "@/views/apps/afog/ExploreAfogView"
      );
      return { Component: ExploreAfogView };
    },
  },
  {
    path: "/apps/chronology",
    async lazy() {
      const { default: ExploreChronologyView } = await import(
        "@/views/apps/chronology/ExploreChronologyView"
      );
      return { Component: ExploreChronologyView };
    },
  },
];
