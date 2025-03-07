import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ViewHeader from "@/layout/ViewHeader";
import SeleneLogo from "@/components/atoms/SeleneLogo";
import { SELENE_WALLET_VERSION } from "@/util/version";
import { translate } from "@/util/translations";
import translations from "./CreditsViewTranslations";

export default function CreditsView() {
  const navigate = useNavigate();
  const [debugTaps, setDebugTaps] = useState(0);

  const handleDebugTap = () => {
    setDebugTaps((taps) => taps + 1);
    if (debugTaps >= 5) {
      navigate("/debug");
    } else {
      setTimeout(() => setDebugTaps((taps) => taps - 1), 1337);
    }
  };

  return (
    <>
      <ViewHeader icon={() => null} title={translate(translations.credits)} />
      <div className="bg-primary text-white text-center p-2">
        <div className="flex items-center justify-center h-40">
          <SeleneLogo className="h-full" onClick={handleDebugTap} />
        </div>
        <h1 className="text-2xl font-bold">
          Selene Wallet v{SELENE_WALLET_VERSION}
        </h1>
        <h2 className="text-xl font-bold">
          {translate(translations.developedWith)}
        </h2>
        <h2 className="text-xl font-semibold p-1">
          {translate(translations.contributors)}
        </h2>
      </div>
      <div className="p-2 w-5/6 mx-auto">
        <h2 className="font-bold text-2xl">
          {translate(translations.flipstarterContributors)}
        </h2>

        <h3 className="font-bold text-xl">March 2024</h3>
        <ol className="list-inside list-decimal">
          <li>molecular</li>
          <li>toorik</li>
          <li>majamalu</li>
          <li>Renegade</li>
          <li>Mike Komaransky</li>
          <li>ErdoganTalk</li>
          <li>Shadow Of Harbringer</li>
          <li>BigV</li>
          <li>@_minisatoshi</li>
          <li>imaginary_username</li>
          <li>Joemar Taganna / Paytaca</li>
          <li>emergent_reasons</li>
          <li>notme</li>
          <li>Bernanácatl</li>
          <li>Omar</li>
          <li>Steve2048</li>
          <li>coolcleaner</li>
          <li>2qx</li>
          <li>Dmoney$$</li>
          <li>yeahhhbeer</li>
          <li>sandakersmann</li>
          <li>George Engelmann</li>
          <li>Bitcoin Out Loud</li>
          <li>bchtoronto.com</li>
          <li>Remora_101</li>
          <li>Josh</li>
          <li>Nico MG</li>
          <li>Anonymous</li>
          <li>Killian</li>
          <li>George Donnelly</li>
          <li>chrome</li>
          <li>Anonymous</li>
          <li>Eggroley</li>
          <li>devperate</li>
          <li>bchforeveryone.net</li>
          <li>bchpls.org</li>
          <li>BCHTV</li>
          <li>Anonymous</li>
          <li>Anonymous</li>
          <li>Nick</li>
          <li>Deidor</li>
          <li>@HashmobMedia</li>
          <li>Manilo</li>
          <li>nemecis1000</li>
          <li>Biometric/PIN Authentica</li>
          <li>AVG</li>
          <li>Anonymous</li>
        </ol>
        <br />
        <h3 className="font-bold text-xl">May 2023</h3>
        <ol className="list-inside list-decimal">
          <li>majamalu</li>
          <li>toorik</li>
          <li>&quot;Satoshi Nakamoto&quot;</li>
          <li>ErdoganTalk</li>
          <li>Mike Komaransky</li>
          <li>Anonymous</li>
          <li>&quot;Philip J Fry&quot;</li>
          <li>Cheapy</li>
          <li>Jett</li>
          <li>imaginary_username</li>
          <li>fshinetop</li>
          <li>emergent_reasons</li>
          <li>2qx</li>
          <li>Bernanácatl</li>
          <li>pat</li>
          <li>Yasin</li>
          <li>&quot;ChatGPT&quot;</li>
          <li>Bitcoin Out Loud</li>
          <li>zmach1n3</li>
          <li>Omar</li>
          <li>Max Hastings</li>
          <li>sandakersmann</li>
          <li>Sydwell</li>
          <li>Steve2048</li>
          <li>Gustavo</li>
          <li>Coins4Clothes</li>
          <li>Remora_101</li>
          <li>PanteraBCH</li>
          <li>Anonymous (x5)</li>
        </ol>

        <h2 className="font-bold text-2xl mt-4">
          {translate(translations.developers)}
        </h2>
        <ul className="list-inside list-disc">
          <li>Jim Hamill</li>
        </ul>

        <h2 className="font-bold text-2xl mt-4">
          {translate(translations.testers)}
        </h2>
        <ul className="list-inside list-disc">
          <li>Gustavo</li>
          <li>nemecis1000</li>
        </ul>

        <h2 className="font-bold text-2xl mt-4">
          {translate(translations.translators)}
        </h2>
        <ul className="list-inside list-disc">
          <li>Marius Kjærstad (GitLab: @sandakersmann)</li>
          <li>Prashant Singh Pawar (GitLab: @prashantpawar)</li>
        </ul>

        <h2 className="font-bold text-2xl mt-4">
          {translate(translations.specialThanks)}
        </h2>
        <ul className="list-inside list-disc">
          <li>Jason Dreyzehner</li>
          <li>Lisa L</li>
          <li>NeonDaThal</li>
          <li>Johnathan Silverblood</li>
          <li>Mathieu Geukens</li>
          <li>Jim Hamill</li>
          <li>Calin Culianu</li>
          <li>Bitcoin Jason</li>
          <li>Sahid Miller</li>
          <li>Ian Blas</li>
          <li>@CM_Works</li>
          <li>Arthur</li>
          <li>XaYaZaZa</li>
          <li>@_minisatoshi</li>
          <li>Steve Thurmond</li>
        </ul>
      </div>
    </>
  );
}
