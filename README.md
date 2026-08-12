# SakuraQ

**A quest-style focus timer that turns study sessions into points — shipped as an Android APK and an installable web app.**

You pick a category, name the thing you're about to do, set a length, and start. The app times it,
scores it, and keeps a history you can't quietly edit later. Built because tracking systems that
ask you to write things down by hand always died within a week.

![Home](screens/sakuraq-1-home.png)
![Timer](screens/sakuraq-3-run.png)

## What's interesting in here

- **One file, no build step.** The entire app — markup, styles, and logic — is 28,270 lines in a
  single `index.html`. No framework, no bundler, no transpiler. It loads as-is.
- **Alarms that survive the app being closed.** Background timers in a web view stop running, so
  the app pre-schedules an OS-level alarm at the quest's end time instead of relying on its own
  tick loop.
- **Cloud sync that doesn't mix accounts.** Google sign-in with Firestore sync, and every storage
  key is namespaced per user id, so two accounts on the same device never read each other's data.
- **Works offline and installs.** Service worker app shell, installable on Android and iOS.
- **Cosmetics that actually re-skin the app** — purchasable themes and skins that change the timer
  screen, buttons, and home scene, not just an accent color.
- **Bilingual (Thai / English)** through a small i18n engine written for this app.

## Shipped

- Android APK, currently `v0.18.14`, distributed through GitHub Releases
- Installable web app

## Stack

Vanilla JavaScript · Capacitor 6 · Firebase Auth + Firestore · Service Worker

## Honest notes

Built and maintained solo. Ten people tested it and none of them kept using it — I found that out
because I built the usage tracking myself, and that result is what most of the recent work has been
reacting to.
