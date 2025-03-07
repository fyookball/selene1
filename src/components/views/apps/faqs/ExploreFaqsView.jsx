import AppSubSectionWrapper from "@/apps/AppSubSectionWrapper/AppSubSectionWrapper";
import EmbeddedIframe from "@/atoms/EmbeddedIframe";

const BCH_PODCAST_FAQ_URL = "https://bitcoincashpodcast.com/faqs";
const HELPME_CASH_URL = "https://helpme.cash/";
const DISCOVER_CASH_URL = "https://discover.cash/";
const BCHF_URL = "https://bitcoincashfoundation.org/";
const BCH_FAQ_URL = "https://bchfaq.com/";
const BCH_EDUCATION_URL = "https://bch.education/";

const SUBSECTIONS = [
  {
    name: "The Bitcoin Cash Podcast",
    children: <EmbeddedIframe src={BCH_PODCAST_FAQ_URL} />,
  },
  {
    name: "HelpMe.Cash",
    children: <EmbeddedIframe src={HELPME_CASH_URL} />,
  },
  {
    name: "Discover.cash",
    children: <EmbeddedIframe src={DISCOVER_CASH_URL} />,
  },
  // TODO: https://git.xulu.tech/selene.cash/selene-wallet/-/issues/431
  // {
  //   name: "Bitcoin Cash Foundation",
  //   children: <EmbeddedIframe src={BCHF_URL} />,
  // },
  // {
  //   name: "BCH FAQ",
  //   children: <EmbeddedIframe src={BCH_FAQ_URL} />,
  // },
  {
    name: "BCH.education",
    children: <EmbeddedIframe src={BCH_EDUCATION_URL} />,
  },
];

export default function ExploreFaqsView() {
  return <AppSubSectionWrapper subsections={SUBSECTIONS} />;
}
