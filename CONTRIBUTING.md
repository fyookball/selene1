# Contributing

We love contributors! Welcome!

To get started review the following code style guide and pull request format notes as part of contributing to Selene. Of course if you have any questions, feel free to ask in [the Telegram group](https://t.me/+MMbV2KEPFt84MDQ8).

Note: Please **DO NOT** fork from `main`, instead it's best to fork from the branch for the next upcoming release (which will be named `vX.X.X` and clearly have recent activity). Upcoming release serves as the defacto development branch, and can be noticeably ahead of main.

## Bounties

There are bounties (in BCH of course) available for some desired features, ask in the Telegram group.

### Bounty Specification

Will be negotiated on a case by case basis, but some requirements for bounty payout that have proven valuable to make explicit from the beginning:

- No degredation in wallet performance, responsiveness, maintainability, significant bundle size increases or other "anti-progress" in the useability of the software, except where discussed otherwise as relevant to the feature at hand
- No introduction of new bugs or regressions
- Compliance with the project's style and PR guidelines, as specified below. Don't fret, review will help with this!
- Depending on the quality of code and feature, 1-2 rounds of review (and follow up revisions) should be expected, potentially more.

As relevant to the issue at hand, screen designs or non-functional UI scaffold branches and other specification material will be provided. This is a developing process to determine what is best included.

These points aren't set out to discourage contributors, but to appropriately set expectations that Selene is aiming to maintain a high standard of engineering and bounty payouts will be granted in alignment with that.

## Code Style Guidelines

- Prefer use of longer, descriptive variable names. E.g. `transactionId` not `txId`. Easier to mentally parse by reducing the cognitive load of (often unspecified or nonstandard) abbreviations.
- Use hooks, not class components in React.
- Use TypeScript wherever possible for ease of maintenance.
- Use absolute file import paths (`import COLOURS from "@selene-wallet/common/design/colours";`) rather than relative ones (`import COLOURS from "../../../common/design/colours";`), makes Find+Replace on imports after relocating files much simpler.
- Boolean variables should be named `isX` e.g. `isDarkMode`.

## Pull Request Guidelines

- Where access is available to the Trello board, please link to the relevant issue. If no access, ask for it!
- Selene reviewers will use a system of "ASCII annotations" to prefix comments. This system comes from commercial experience with developers creating conflict over the severity or intent of context-less and tone-free typed review comments. See [these Google Slides](https://docs.google.com/presentation/d/1AA-ddE828xhXMaGKUp21vBMx20q9xOArw2-TuzkL3xM/edit?usp=sharing) for examples/details.

```
-* = Suggestion, small style nitpicks or tweaks, [typically] 2-6 / review, merge non-blocking
-? = Question, reviewer needs a bit more clarity, [typically] 0-2 / review, merge blocking
-! = Critical, severe bug introductions or security issues, [typically] 0-1 / review, merge blocking
-+ = Recognition, encouragement and praise of smart or cool code, [typically] 0-3 / review, merge non-blocking
```

- Where a change has been made impacting the UI, a "Before" and "After" screenshot showing the difference is immensely helpful for reviewing developers.
- If this is your first PR, feel free to include a change adding yourself as a contributor on the Credits page in the app!!
