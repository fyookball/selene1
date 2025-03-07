import { DateTime } from "luxon";

import { translate } from "@/util/translations";
import translations from "./translations";

const WHITEPAPER_READ_MORE_URL = "https://bitcoincashpodcast.com/bitcoin.pdf";

const SELENE_VIDEO_URL = "https://www.youtube.com/watch?v=5RqI6tByySQ";
const SELENE_READ_MORE_URL = "https://selene.cash/";

const BCH_GURU_GRAPHIC_URL =
  "https://pbs.twimg.com/profile_images/1649794915344465925/E8tlHvcJ_400x400.jpg";
const BCH_GURU_READ_MORE_URL = "https://bch.guru/";

const MT_GOX_READ_MORE_URL = "https://en.wikipedia.org/wiki/Mt._Gox";

const GENESIS_READ_MORE_URL = "https://blockchair.com/bitcoin-cash/block/0";

const AFOG_GRAPHIC_URL =
  "https://pbs.twimg.com/profile_images/1719547852722946048/Ap4rOTHp_400x400.jpg";
const AFOG_APP_URL = "/explore/afog";

const BCH_ARGENTINA_CONFERENCE_VIDEO_URL =
  "https://www.youtube.com/watch?v=zmt1RiFHMOA";
const BCH_ARGENTINA_CONFERENCE_READ_MORE_URL = "https://2024.bcharg.com/";

const LOCK_IN_2025_URL = "https://youtu.be/oPQ8w0yZ88E?t=247";
const LOCK_IN_2025_READ_MORE_URL =
  "https://bitcoincashresearch.org/t/chip-2021-05-targeted-virtual-machine-limits/437/26";

const CASHTOKENS_EXPLANER_VIDEO_URL =
  "https://www.youtube.com/watch?v=uIhQKQ4efnQ";
const CASHTOKENS_FAQ_URL =
  "https://bitcoincashpodcast.com/faqs/Tech/what-is-cashtokens";

const ABLA_EXPLAINER_VIDEO_URL = "https://www.youtube.com/watch?v=YkkzIjZQNH0";
const ABLA_FAQ_URL =
  "https://bitcoincashpodcast.com/faqs/BCH/what-is-the-maximum-bch-blocksize";

const BLISS_FAQ_URL = "https://bitcoincashpodcast.com/faqs/Events/BLISS";

const BCH22_STREAM_URL = "https://www.youtube.com/watch?v=1W0-N_0K6jQ";
const BCH22_FAQ_URL = "https://bitcoincashpodcast.com/faqs/Events/BCH22";

const BITCOIN_CASH_PODCAST_GRAPHIC_URL =
  "https://bitcoincashpodcast.com/sunglasses.jpg";
const BITCOIN_CASH_PODCAST_URL = "https://bitcoincashpodcast.com/";

const BCH_CITY_VIDEO_URL = "https://www.youtube.com/watch?v=UuhH1lL6BAw";

const FLIPSTARTER_READ_MORE_URL = "https://flipstarter.cash/";
const FLIPSTARTER_GRAPHIC_URL =
  "https://flipstarter.cash/static/img/logo-alt.svg";

const CASHSCRIPT_READ_MORE_URL = "https://cashscript.org/";
const CASHSCRIPT_VIDEO_URL = "https://www.youtube.com/watch?v=5fsqU0lvA8c";

const JOGS_READ_MORE_URL = "https://jogs.one/";

const UAHF_READ_MORE_URL =
  "https://bitcoincashpodcast.com/start#episode-8-of-10-bitcoin-cash";

const CW_144_READ_MORE_URL =
  "https://reference.cash/protocol/forks/hf-20171113";
const MONOLITH_READ_MORE_URL =
  "https://reference.cash/protocol/forks/hf-20180515";
const MAGNETIC_ANOMALY_READ_MORE_URL =
  "https://reference.cash/protocol/forks/hf-20181115";
const GREAT_WALL_READ_MORE_URL =
  "https://reference.cash/protocol/forks/hf-20190515";
const GRAVITON_READ_MORE_URL =
  "https://reference.cash/protocol/forks/hf-20191115";
const PHONON_READ_MORE_URL =
  "https://reference.cash/protocol/forks/hf-20200515";
const AXION_READ_MORE_URL = "https://reference.cash/protocol/forks/hf-20201115";
const BIGBLOCKIFTRUE_READ_MORE_URL =
  "https://reference.cash/protocol/forks/hf-20210515";
const U8_READ_MORE_URL = "https://reference.cash/protocol/forks/hf-20220515";

const HIJACKING_BITCOIN_READ_MORE_URL =
  "https://bitcoincashpodcast.com/faqs/Media/what-about-roger-vers-book-hijacking-bitcoin";
const HIJACKING_BITCOIN_GRAPHIC_URL =
  "https://bitcoincashpodcast.com/assets/images/hijacking-bitcoin-5542bf1c53b9af5dc7226cbb569cc105.png";

const {
  categories: {
    fork,
    softFork,
    hardFork,
    conference,
    projectLaunch,
    infrastructure,
    upcoming,
    historicEvent,
  },
  upgrades,
  conferences,
  infra,
  projects,
  upcomingEvents,
  historic,
} = translations;

export const CATEGORIES = {
  FORK: {
    FORK: translate(fork),
    HARD_FORK: translate(hardFork),
    SOFT_FORK: translate(softFork),
  },
  CONFERENCE: translate(conference),
  PROJECT_LAUNCH: translate(projectLaunch),
  INFRASTRUCTURE: translate(infrastructure),
  UPCOMING: translate(upcoming),
  HISTORIC_EVENT: translate(historicEvent),
};

const UPGRADES = [
  {
    title: "nLockTimeEnforcement",
    date: DateTime.fromISO("2009-10-28"),
    category: CATEGORIES.FORK.SOFT_FORK,
    videoUrl: null,
    description: [translate(upgrades.nLockTimeEnforcement.description)],
    readMoreUrl: null,
  },
  {
    title: "OP_NOP Functions",
    date: DateTime.fromISO("2010-07-31"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [translate(upgrades.opNopFunctions.description)],
    readMoreUrl: null,
  },
  {
    title: "Separation of evaluation of scriptSig and scriptPubKey",
    date: DateTime.fromISO("2010-07-31"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [translate(upgrades.separationOfEval.description)],
    readMoreUrl: null,
  },
  {
    title: "Value Overflow Incident",
    date: DateTime.fromISO("2010-08-15"),
    category: CATEGORIES.FORK.SOFT_FORK,
    videoUrl: null,
    description: [translate(upgrades.valueOverflowIncident.description)],
    readMoreUrl: null,
  },
  {
    title: "Blocksize Limit Introduced",
    date: DateTime.fromISO("2010-10-12"),
    category: CATEGORIES.FORK.SOFT_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.blockSizeLimitIntroduced.description),
      translate(upgrades.blockSizeLimitIntroduced.description2),
      translate(upgrades.blockSizeLimitIntroduced.description3),
    ],
    readMoreUrl: null,
  },
  {
    title: "Disallow Transactions with Same TXID",
    date: DateTime.fromISO("2012-03-15"),
    category: CATEGORIES.FORK.SOFT_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.disallowTransactionsWithSameTXID.description),
    ],
    readMoreUrl: null,
  },
  {
    title: "Pay-to-Script-Hash",
    date: DateTime.fromISO("2012-04-01"),
    category: CATEGORIES.FORK.SOFT_FORK,
    videoUrl: null,
    description: [translate(upgrades.payToScriptHash.description)],
    readMoreUrl: null,
  },
  {
    title: "Block Height in Coinbase",
    date: DateTime.fromISO("2013-03-24"),
    category: CATEGORIES.FORK.SOFT_FORK,
    videoUrl: null,
    description: [translate(upgrades.blockHeightInCoinbase.description)],
    readMoreUrl: null,
  },
  {
    title: "Migration from Berkely DB to LevelDB",
    date: DateTime.fromISO("2013-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.migrationFromBerkelyDBToLevelDB.description),
    ],
    readMoreUrl: null,
  },
  {
    title: "Strict DER Encoding for Signatures",
    date: DateTime.fromISO("2015-07-04"),
    category: CATEGORIES.FORK.SOFT_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.strictDEREncodingForSignatures.description),
    ],
    readMoreUrl: null,
  },
  {
    title: "OP_CHECKLOCKTIMEVERIFY",
    date: DateTime.fromISO("2015-12-14"),
    category: CATEGORIES.FORK.SOFT_FORK,
    videoUrl: null,
    description: [translate(upgrades.opCheckLocks.description)],
    readMoreUrl: null,
  },
  {
    title: "Addition of Opt-In Replace-By-Fee (RBF)",
    date: DateTime.fromISO("2016-02-23"),
    category: CATEGORIES.FORK.SOFT_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.additionOfOptInReplaceByFee.description),
      translate(upgrades.additionOfOptInReplaceByFee.description2),
      translate(upgrades.additionOfOptInReplaceByFee.description3),
      translate(upgrades.additionOfOptInReplaceByFee.description4),
    ],
    readMoreUrl: null,
  },
  {
    title: "OP_CHECKSEQUENCEVERIFY",
    date: DateTime.fromISO("2016-07-04"),
    category: CATEGORIES.FORK.SOFT_FORK,
    videoUrl: null,
    description: [translate(upgrades.opCheckSeqVerify.description)],
    readMoreUrl: null,
  },
  {
    title: "UAHF - BCH/BTC Split",
    date: DateTime.fromISO("2017-08-01"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.uahf.description),
      translate(upgrades.uahf.description2),
      translate(upgrades.uahf.description3),
    ],
    readMoreUrl: UAHF_READ_MORE_URL,
  },
  {
    title: "CW-144",
    date: DateTime.fromISO("2017-11-13"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.cw144.description),
      translate(upgrades.cw144.description2),
    ],
    readMoreUrl: CW_144_READ_MORE_URL,
  },
  {
    title: "Monolith",
    date: DateTime.fromISO("2018-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.monolith.description),
      translate(upgrades.monolith.description2),
      translate(upgrades.monolith.description3),
    ],
    readMoreUrl: MONOLITH_READ_MORE_URL,
  },
  {
    title: "Magnetic Anomaly - BCH/BSV Split",
    date: DateTime.fromISO("2018-11-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.magneticAnomaly.description),
      translate(upgrades.magneticAnomaly.description2),
      translate(upgrades.magneticAnomaly.description3),
      translate(upgrades.magneticAnomaly.description4),
    ],
    readMoreUrl: MAGNETIC_ANOMALY_READ_MORE_URL,
  },
  {
    title: "Great Wall",
    date: DateTime.fromISO("2019-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.greatWall.description),
      translate(upgrades.greatWall.description2),
      translate(upgrades.greatWall.description3),
    ],
    readMoreUrl: GREAT_WALL_READ_MORE_URL,
  },
  {
    title: "Graviton",
    date: DateTime.fromISO("2019-11-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.graviton.description),
      translate(upgrades.graviton.description2),
      translate(upgrades.graviton.description3),
    ],
    readMoreUrl: GRAVITON_READ_MORE_URL,
  },
  {
    title: "Phonon",
    date: DateTime.fromISO("2020-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.phonon.description),
      translate(upgrades.phonon.description2),
    ],
    readMoreUrl: PHONON_READ_MORE_URL,
  },
  {
    title: "Axion - BCH/XEC Split",
    date: DateTime.fromISO("2020-11-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.axion.description),
      translate(upgrades.axion.description2),
      translate(upgrades.axion.description3),
    ],
    readMoreUrl: AXION_READ_MORE_URL,
  },
  {
    title: "BigBlockIfTrue",
    date: DateTime.fromISO("2021-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.bigBlockIfTrue.description),
      translate(upgrades.bigBlockIfTrue.description2),
      translate(upgrades.bigBlockIfTrue.description3),
    ],
    readMoreUrl: BIGBLOCKIFTRUE_READ_MORE_URL,
  },
  {
    title: "U8",
    date: DateTime.fromISO("2022-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: null,
    description: [
      translate(upgrades.u8.description),
      translate(upgrades.u8.description2),
      translate(upgrades.u8.description3),
      translate(upgrades.u8.description4),
    ],
    readMoreUrl: U8_READ_MORE_URL,
  },
  {
    title: "CashTokens",
    date: DateTime.fromISO("2023-05-15"),
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: CASHTOKENS_EXPLANER_VIDEO_URL,
    description: [translate(upgrades.cashtokens.description)],
    readMoreUrl: CASHTOKENS_FAQ_URL,
  },
  {
    title: "ABLA",
    date: DateTime.fromISO("2024-05-15"),
    subtitle: "Adjustable Blocksize Limit Algorithm",
    category: CATEGORIES.FORK.HARD_FORK,
    videoUrl: ABLA_EXPLAINER_VIDEO_URL,
    description: [
      translate(upgrades.abla.description),
      translate(upgrades.abla.description2),
    ],
    readMoreUrl: ABLA_FAQ_URL,
  },
];

const CONFERENCES = [
  {
    title: "Bitcoin Cash City Conference",
    date: DateTime.fromISO("2019-09-04"),
    category: CATEGORIES.CONFERENCE,
    videoUrl: BCH_CITY_VIDEO_URL,
    description: [
      translate(conferences.bchCity.description),
      translate(conferences.bchCity.description2),
    ],
    readMoreUrl: null,
  },
  {
    title: "BCH22",
    date: DateTime.fromISO("2022-11-12"),
    category: CATEGORIES.CONFERENCE,
    videoUrl: BCH22_STREAM_URL,
    description: [
      translate(conferences.bch22.description),
      translate(conferences.bch22.description2),
    ],
    readMoreUrl: BCH22_FAQ_URL,
  },
  {
    title: "BLISS",
    date: DateTime.fromISO("2024-05-14"),
    category: CATEGORIES.CONFERENCE,
    videoUrl: null,
    description: [
      translate(conferences.bliss.description),
      translate(conferences.bliss.description2),
    ],
    readMoreUrl: BLISS_FAQ_URL,
  },
];

const INFRASTRUCTURE = [
  {
    title: "CashScript",
    date: DateTime.fromISO("2019-07-01"), // July 2019, check exact date
    category: CATEGORIES.INFRASTRUCTURE,
    videoUrl: CASHSCRIPT_VIDEO_URL,
    graphicUrl: null,
    description: [translate(infra.cashscript.description)],
    readMoreUrl: CASHSCRIPT_READ_MORE_URL,
  },
];

const PROJECTS = [
  {
    title: "Flipstarter",
    date: DateTime.fromISO("2020-03-01"), // March 2020, check exact date
    category: CATEGORIES.PROJECT_LAUNCH,
    videoUrl: null,
    graphicUrl: FLIPSTARTER_GRAPHIC_URL,
    description: [translate(projects.flipstarter.description)],
    readMoreUrl: FLIPSTARTER_READ_MORE_URL,
  },
  {
    title: "Journal of Global Surgery",
    date: DateTime.fromISO("2021-06-01"), // June 2021, check exact date
    category: CATEGORIES.PROJECT_LAUNCH,
    videoUrl: null,
    graphicUrl: null,
    description: [
      translate(projects.jogs.description),
      translate(projects.jogs.description2),
    ],
    readMoreUrl: JOGS_READ_MORE_URL,
  },
  {
    title: "The Bitcoin Cash Podcast",
    date: DateTime.fromISO("2021-01-23"),
    category: CATEGORIES.PROJECT_LAUNCH,
    videoUrl: null,
    graphicUrl: BITCOIN_CASH_PODCAST_GRAPHIC_URL,
    description: [translate(projects.bitcoinCashPodcast.description)],
    readMoreUrl: BITCOIN_CASH_PODCAST_URL,
  },
  {
    title: "BCH GURU",
    date: DateTime.fromISO("2023-05-01"),
    category: CATEGORIES.PROJECT_LAUNCH,
    videoUrl: null,
    graphicUrl: BCH_GURU_GRAPHIC_URL,
    description: [
      translate(projects.bchGuru.description),
      translate(projects.bchGuru.description2),
    ],
    readMoreUrl: BCH_GURU_READ_MORE_URL,
  },
  {
    title: "Selene Wallet",
    date: DateTime.fromISO("2023-05-15"),
    category: CATEGORIES.PROJECT_LAUNCH,
    videoUrl: SELENE_VIDEO_URL,
    graphicUrl: null,
    description: [translate(projects.seleneWallet.description)],
    readMoreUrl: SELENE_READ_MORE_URL,
  },
  {
    title: "A Fifth Of Gaming",
    date: DateTime.fromISO("2023-09-22"),
    category: CATEGORIES.PROJECT_LAUNCH,
    videoUrl: null,
    graphicUrl: AFOG_GRAPHIC_URL,
    description: [translate(projects.aFifthOfGaming.description)],
    readMoreUrl: null,
    appUrl: AFOG_APP_URL,
  },
];

const UPCOMING = [
  {
    title: "BCH Argentina Conference",
    date: DateTime.fromISO("2024-10-12"),
    category: CATEGORIES.UPCOMING,
    videoUrl: BCH_ARGENTINA_CONFERENCE_VIDEO_URL,
    description: [
      translate(upcomingEvents.bchArgentinaConference.description),
      translate(upcomingEvents.bchArgentinaConference.description2),
      translate(upcomingEvents.bchArgentinaConference.description3),
    ],
    readMoreUrl: BCH_ARGENTINA_CONFERENCE_READ_MORE_URL,
  },
  {
    title: "Upgrade Lock in for 2025 Upgrade",
    date: DateTime.fromISO("2024-11-15"),
    category: CATEGORIES.UPCOMING,
    videoUrl: LOCK_IN_2025_URL,
    description: [
      translate(upcomingEvents.lockIn2025.description),
      translate(upcomingEvents.lockIn2025.description2),
      translate(upcomingEvents.lockIn2025.description3),
      translate(upcomingEvents.lockIn2025.description4),
    ],
    readMoreUrl: LOCK_IN_2025_READ_MORE_URL,
  },
];

const HISTORIC_EVENT = [
  {
    title: "Bitcoin Whitepaper",
    date: DateTime.fromISO("2008-10-31"),
    category: CATEGORIES.HISTORIC_EVENT,
    videoUrl: null,
    description: [
      translate(historic.whitePaper.description),
      translate(historic.whitePaper.description2),
      translate(historic.whitePaper.description3),
    ],
    readMoreUrl: WHITEPAPER_READ_MORE_URL,
  },
  {
    title: "Genesis Block",
    date: DateTime.fromISO("2009-01-03"),
    category: CATEGORIES.HISTORIC_EVENT,
    videoUrl: null,
    description: [
      translate(historic.genesisBlock.description),
      translate(historic.genesisBlock.description2),
      translate(historic.genesisBlock.description3),
    ],
    readMoreUrl: GENESIS_READ_MORE_URL,
  },
  {
    title: "Mt. Gox Collapse",
    date: DateTime.fromISO("2014-02-24"),
    category: CATEGORIES.HISTORIC_EVENT,
    videoUrl: null,
    description: [
      translate(historic.mtGox.description),
      translate(historic.mtGox.description2),
      translate(historic.mtGox.description3),
      translate(historic.mtGox.description4),
      translate(historic.mtGox.description5),
      translate(historic.mtGox.description6),
    ],
    readMoreUrl: MT_GOX_READ_MORE_URL,
  },
  {
    title: "Hijacking Bitcoin",
    date: DateTime.fromISO("2024-04-05"),
    category: CATEGORIES.HISTORIC_EVENT,
    videoUrl: null,
    graphicUrl: HIJACKING_BITCOIN_GRAPHIC_URL,
    description: [
      translate(historic.hijackingBitcoin.description),
      translate(historic.hijackingBitcoin.description2),
    ],
    readMoreUrl: HIJACKING_BITCOIN_READ_MORE_URL,
  },
];

// Default sort by reverse-chronological
const TIMELINE_ITEMS = [
  ...UPCOMING,
  ...CONFERENCES,
  ...UPGRADES,
  ...PROJECTS,
  ...INFRASTRUCTURE,
  ...HISTORIC_EVENT,
].sort((a, b) => b.date - a.date);

export default TIMELINE_ITEMS;
