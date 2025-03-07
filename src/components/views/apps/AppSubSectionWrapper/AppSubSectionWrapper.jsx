import { useState } from "react";

export default function AppSubSectionWrapper({ subsections }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedSubsectionIndex, setSelectedSubsectionIndex] = useState(0);

  const isSectionEmpty = !subsections[selectedSubsectionIndex]?.children;

  return (
    <div className="h-full">
      <div className="h-full pb-12">
        {subsections[selectedSubsectionIndex].children}
      </div>

      {!isMenuOpen && (
        <div
          className="fixed bottom-16 left-0 right-0 bg-gray-300 text-red p-3 flex justify-between items-center"
          onClick={() => setIsMenuOpen(true)}
        >
          <div className="w-6"></div>
          <span className="text-lg font-semibold">
            {subsections[selectedSubsectionIndex].name}
          </span>
          <button className="text-2xl">☰</button>
        </div>
      )}

      {isMenuOpen && (
        <div className="fixed bottom-16 left-0 right-0 bg-gray-200 text-red p-3 flex flex-col justify-between items-center">
          {subsections.map((subsection, i) => {
            const isLastElement = i === subsections.length - 1;
            return (
              <div
                key={subsection.name}
                className={`${i !== 0 && "mt-1"} w-full flex justify-between items-center text-center`}
                onClick={() => {
                  setSelectedSubsectionIndex(i);
                  setIsMenuOpen(false);
                }}
              >
                <div className="w-6"></div>
                <span className="text-center bg-zinc-300 w-full mx-3">
                  <span className="text-lg font-semibold">
                    {subsection.name}
                  </span>
                </span>
                {!isLastElement && <div className="w-6"></div>}
                {isLastElement && <button className="text-2xl">☰</button>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
