# Kimi Code 1.0.4, ORDL package revision 2

Moonshot AI application; Linux packaging maintained by Open Research Development Laboratories. Product: https://www.kimi.com/code. Documentation: https://www.kimi.com/code/docs/en/. Electron MIT and Chromium notices remain in LICENSE and LICENSES.chromium.html. Release owner confirmed Moonshot permission. No blanket open-source license or Moonshot endorsement is claimed.

This package installs to /opt/kimi-code-ordl. Launch its kimi-code executable or the desktop entry. The package manager owns this installation, including the root-owned sandbox helper mode 4755. Installation requires normal package-manager administrator authorization. The launcher verifies runtime hashes and protected parent permissions and fails closed if they are unsafe.

This accepted runtime requires GLIBC 2.42 because of its bundled node-pty native module. The package manager must reject systems with older glibc. Broad Debian, Ubuntu, or RPM-distribution compatibility is not established by building these package formats.

Release scope is modern Linux x86_64 only, as explicitly selected by the release owner. The installed runtime was accepted on Arch Linux rolling with glibc 2.44 and Wayland. Sparse-root DEB/Arch transaction mechanics passed with dependency resolution waived; RPM transactions were permission-blocked. Full distribution dependency resolution remains untested. No backport or host glibc upgrade is part of this release.

The local node-pty 1.1.0 Linux module imports cfsetispeed and cfsetospeed at GLIBC_2.42, and openpty/forkpty at GLIBC_2.34. All four Linux copies have SHA-256 7be4058f232bc88df150e0403775109bef4523818ded32ebeb9cfad455f1f5e3. The main Electron executable has a highest GLIBC requirement of 2.25; node-pty determines the higher package minimum.

Use your distribution's package manager to upgrade or remove this package. The package has no scripts that delete user settings or sessions. The separate /opt/kimi-code-review installation is retained. Portable installer/uninstaller scripts are excluded to avoid replacing package-manager files.

The accepted manual Check for Updates reports upstream version information and may offer an explicit official AppImage link. That upstream link is not an upgrade of this native package. Upgrade this package through its signed package repository once one is configured. No app-driven automatic installation is implemented for this portable runtime. No fake Electron package-type marker is added.

Live acceptance included smooth isolated startup, latest-version result, Maintainers external browser launch, and settings/themes/language/navigation controls. Documentation click was not explicitly tested. https://ordl.org/kimi currently returns 404 pending maintainer-page publication.
