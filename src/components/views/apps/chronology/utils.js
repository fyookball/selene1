import { CATEGORIES } from "./timelineItems";

// Colours are chosen to match tailwind background options
// https://tailwindcss.com/docs/background-color
const COLOURS = {
  BLUE: {
    className: "text-blue-500",
    rgb: "rgb(59 130 246)",
  },
  RED: {
    className: "text-red-400",
    rgb: "rgb(248 113 113)",
  },
  LIME: {
    className: "text-lime-600",
    rgb: "rgb(101 163 13)",
  },
  CYAN: {
    className: "text-cyan-400",
    rgb: "rgb(34 211 238)",
  },
  INDIGO: {
    className: "text-indigo-500",
    rgb: "rgb(99 102 241)",
  },
  VIOLET: {
    className: "text-violet-500",
    rgb: "rgb(139 92 246)",
  },
  PINK: {
    className: "text-pink-500",
    rgb: "rgb(236 72 153)",
  },
  GRAY: {
    className: "text-gray-400",
    rgb: "rgb(156 163 175)",
  },
};

export const mapCategoryToColour = (category) => {
  switch (category) {
    case CATEGORIES.FORK.HARD_FORK:
      return COLOURS.LIME;
    case CATEGORIES.FORK.SOFT_FORK:
      return COLOURS.RED;
    case CATEGORIES.CONFERENCE:
      return COLOURS.CYAN;
    case CATEGORIES.PROJECT_LAUNCH:
      return COLOURS.INDIGO;
    case CATEGORIES.INFRASTRUCTURE:
      return COLOURS.VIOLET;
    case CATEGORIES.UPCOMING:
      return COLOURS.GRAY;
    case CATEGORIES.HISTORIC_EVENT:
      return COLOURS.PINK;
    default:
      return COLOURS.BLUE;
  }
};
