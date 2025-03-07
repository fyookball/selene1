import React from "react";
import { TELEGRAM_CHANNELS } from "./channels";

export const TelegramSubsection = () => {
  return (
    <div className="px-2 pb-20">
      <div>
        <p>
          The BCH community has a thriving set of Telegram channels for
          discussion and collaboration.
        </p>
        <p>Channels vary by topic, moderation policy, activity & more.</p>
        <p>Lurk or participate in any that interest you!</p>
      </div>
      <hr className="m-2" />
      <div>
        {TELEGRAM_CHANNELS.map((category) => {
          return (
            <div key={category.header}>
              <span className="text-lg">{category.header}</span>
              <div>
                {category.groups.map((channel) => (
                  <div key={channel.name}>
                    <span>
                      <span>{"- "}</span>
                      <a
                        href={channel.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 decoration-underline"
                      >
                        {channel.name}
                      </a>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
