# Kimi Code Linux

ORDL-maintained Linux x86_64 packaging of Moonshot AI Kimi Code Desktop 1.0.4.

**Requires GLIBC >= 2.42.** This is an intentional initial-release limit. Accepted application testing was on Arch Linux rolling, glibc 2.44, Wayland. Package format availability does not establish support for every Debian, Ubuntu or RPM distribution.

Official [product](https://www.kimi.com/code) and [documentation](https://www.kimi.com/code/docs/en/). Maintained by [Open Research Development Laboratories](https://github.com/Open-Research-Development-Laboratories).

Developed and maintained by Open Research and Development Laboratories for the Kimi ecosystem, with encouragement from the Kimi team.

## Downloads and installation

Use [GitHub Releases](https://github.com/Open-Research-Development-Laboratories/kimi-code-linux/releases). Verify the downloaded files against SHA256SUMS. These initial artifacts are unsigned; checksums provide integrity, not independent publisher authentication.

- Portable installer archive: `KimiCode-1.0.4-ordl.2-linux-x64.tar.xz`. Extract, then run `./install-kimi-code --check --prefix /opt/kimi-code` followed by `./install-kimi-code --prefix /opt/kimi-code`. Launch `/opt/kimi-code/kimi-code`. Installation uses confirmation and normal administrator authentication. The desktop entry targets that default prefix; adjust both Exec and Icon for a custom prefix before registering it. The installer does not register a desktop entry automatically. This archive is not an unpack-and-run sandbox bypass.
- DEB: `kimi-code-ordl_1.0.4-1_amd64.deb`.
- RPM: `kimi-code-ordl-1.0.4-1.x86_64.rpm`.
- Arch: `kimi-code-ordl-1.0.4-1-x86_64.pkg.tar.zst`.

Install native packages with your package manager on a compatible system. They own `/opt/kimi-code-ordl` and its desktop entry. Do not overlay the portable installer. The launcher requires protected installation paths and a root-owned sandbox helper mode 4755. Do not disable the sandbox to fix a launch failure.

Native package removal retains user settings and sessions. Portable uninstall moves the identified protected installation to a timestamped sibling for recovery and retains user data; see its included README.

## Updates

Manual Check for Updates reports upstream version information and can offer an explicit official AppImage link. That upstream link does not upgrade an ORDL native package. No automatic installation is implemented. Obtain subsequent ORDL revisions from this repository's releases. Signed APT/RPM/Arch repositories are planned, not currently configured.

## Verification and limitations

All four artifact checksums passed. Portable extraction, runtime manifest, desktop validation and complete runtime comparison passed. Portable revision 2 changes only desktop integration, README and revision metadata; the accepted application, installer, launcher, uninstaller and manual updater remain unchanged.

DEB and Arch disposable-root install, same-version replacement, helper ownership/mode, runtime integrity, removal and user-data retention passed with dependency resolution waived against empty databases. RPM header and payload digests, payload comparison and metadata passed; transaction testing was blocked by a chroot permission restriction. Full distribution dependency resolution, graphical package launch, genuine revision upgrades and rollback are not established by those tests.

User acceptance covered smooth isolated startup, latest-version update result, external Maintainers browser launch and application controls. Documentation click was not explicitly tested. The correct Maintainers URL, https://ordl.org/kimi, returned 404 while the page was unpublished.

Embedded README text in native revision-1 artifacts predates the permission confirmation and later DEB/Arch transaction tests. This README and release notes provide the current status without changing those verified artifact bytes.

## Source and provenance

This repository contains ORDL launcher, installer, manual updater and packaging work. The assembled application is distributed separately as release assets. It combines vendor desktop 1.0.4 inputs with Electron 43.1.1 Linux and a locally built node-pty 1.1.0 component. The latter requires GLIBC 2.42 and has SHA256 `7be4058f232bc88df150e0403775109bef4523818ded32ebeb9cfad455f1f5e3` in all four Linux copies.

Archive packaging is deterministic from assembled inputs; this is not a claim of a reproducible proprietary upstream source build. Published packaging recipes target corrected archive revision 2 and native packaging revision 2 for future rebuilds. Initial native release assets remain revision 1; those recipes must not be described as reproducing their exact bytes.

Electron MIT, Chromium and dependency notices remain in the application bundles. Those notices apply to their components. No blanket open-source license is asserted for the Moonshot application or the whole distribution; do not infer one from component notices.

Content checks found no credential-pattern matches beyond a library parser literal. Local developer paths were removed from the corrected portable desktop entry. This scoped publication check is not a full application security audit.
