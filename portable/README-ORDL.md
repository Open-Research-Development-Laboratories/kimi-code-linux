# Kimi Code Desktop 1.0.4, ORDL packaging revision 2

Linux x64 community packaging prepared by Open Research Development Laboratories. Upstream application authorship remains Moonshot AI. The application version is unchanged at 1.0.4.

Install from an independently verified archive:

```bash
./install-kimi-code --check --prefix /opt/kimi-code
./install-kimi-code --prefix /opt/kimi-code
/opt/kimi-code/kimi-code
```

The installer asks for confirmation and administrator authentication. It validates runtime hashes and protected installation paths, stages root-owned files, and installs the sandbox helper with mode 4755. The launcher refuses unsafe helper or parent permissions and prints repair instructions. User extraction may remove the source helper's setuid bit; safe source mode 0755 is supported. Do not disable the sandbox to resolve an installation error.

Modern Linux x86_64 only: GLIBC >= 2.42 is required. The accepted runtime was tested on Arch rolling, glibc 2.44, Wayland. This tar archive is installable with the included installer, not an unpack-and-run sandbox bypass.

The included kimi-code.desktop targets the documented default /opt/kimi-code prefix. After installation, it may be registered with your desktop environment. The installer does not register it automatically. If you choose a custom prefix, update both Exec and Icon to that installed prefix before registering a separate desktop entry; %U must remain outside the executable path. Do not register the default entry for a different prefix. For example, the retained review installation uses /opt/kimi-code-review and needs those two paths adjusted. Command-line launch works directly from your chosen protected prefix.

Updates use a manual feed check. A newer version is reported with an explicit official download action. This package does not install updates automatically. Its portable tar format is distinct from the official AppImage and Debian packages.

Uninstall by identifying the exact install prefix and running its `uninstall-kimi-code --prefix PATH`. Uninstallation moves the installation to a timestamped sibling for recovery and retains all user data. Delete the retired directory manually after confirming it is no longer needed.

Official product and documentation: https://www.kimi.com/code and https://www.kimi.com/code/docs/en/.

The Help menu retains Documentation and adds Maintainers, opening https://ordl.org/kimi in an external browser. The maintainer page returned 404 during acceptance because it had not yet been published.

The user accepted the isolated installed build after smooth startup, a latest-version update result, successful Maintainers browser launch, and working settings, themes, languages, navigation, console, zoom, fullscreen, reload, and developer tools. Documentation was not explicitly click-tested.

Aaron confirmed Moonshot permission for this release on 2026-10-04. Component licenses are retained in LICENSE and LICENSES.chromium.html; those notices do not grant a blanket open-source license to the whole application. This is ORDL-maintained packaging, not represented as an official Moonshot-built release. Revision 2 changes only desktop integration and packaging documentation/metadata; accepted application, launcher, installer, manual updater and uninstaller remain unchanged.
