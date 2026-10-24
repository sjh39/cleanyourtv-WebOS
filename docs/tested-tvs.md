# Tested TVs

CleanYourTV is written for rooted LG webOS TVs. Only a few models have been tried, and reports are welcome: open an issue with
the output of **Share log** (see [Troubleshooting](troubleshooting.md#reporting-a-problem)) and say whether it worked.

| TV | Firmware | webOS (SDK) | Status |
|---|---|---|---|
| OLED65G26LA | 33.23.05 | webOS 25 (10.2.2) | **Tested.** The maintainer's TV; everything in these pages was checked on it. |
| Two models | 23.25.55 | | Reported working. |
| OLED65C54LA | 43.21.77 | SDK 11.2.0 | Reported in [issue #3](https://github.com/lasharor/cleanyourtv-WebOS/issues/3): runs; app icons were drawn badly. A fix is available as a test build. |
| 55UN7200PTF | 04.64.00 | webOS 5.6.2 (Node.js 8.12) | Reported in [issue #4](https://github.com/lasharor/cleanyourtv-WebOS/issues/4): works with the Home Style set to Basic and a few fixes that are available as a test build. |
| 65UT7000PUA | 33.31.75 | webOS 25 (10.3.2) | Reported in [issue #11](https://github.com/lasharor/cleanyourtv-WebOS/issues/11): setup completed and the home screen works. The Input key opens the Inputs list in under a second; the TV closed the hidden picker, so it starts on each press. |

!!! note "What the status words mean"
    *Tested* means the maintainer ran it. *Reported* means someone else told us it works or what did not. A TV that is not on
    this list may still work: see [unlisted firmware](install.md#unlisted-firmware).

## webOS version numbers

LG names its webOS versions in two ways: a marketing name and the version the TV reports to software. The **SDK version**
(**Settings > About**, or `sdkVersion` in the setup log) is the second one and is what the setup reads.

| Marketing name | First shipped on | SDK version reported |
|---|---|---|
| webOS 5 | 2020 | 5.x |
| webOS 6 | 2021 | 6.x |
| webOS 22 | 2022 | 7.x |
| webOS 23 | 2023 | 8.x |
| webOS 24 | 2024 | 9.x |
| webOS 25 | 2025 | 10.x |
| webOS 26 | 2026 | 11.x |

LG also updates older TVs to newer versions, so the SDK version, not the model year, is what counts. The service avoids features the older versions lack: webOS 5 and 6 ship **Node.js 8** (and Chromium 79 on webOS 6). The
details are in [Internals](development/internals.md#older-webos-versions).
