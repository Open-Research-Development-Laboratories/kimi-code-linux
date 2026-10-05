Name: kimi-code-ordl
Version: 1.0.4
Release: 2%{?dist}
Summary: Kimi Code Desktop community Linux packaging by ORDL
License: LicenseRef-Moonshot-Permission AND MIT
URL: https://www.kimi.com/code
Source0: KimiCode-1.0.4-ordl.2-linux-x64.tar.xz
Source1: stage.sh
Source2: NATIVE-README.md
Source3: kimi-code-ordl.desktop
Source4: kimi-code
ExclusiveArch: x86_64
AutoReqProv: yes
Requires: libc.so.6(GLIBC_2.42)(64bit)
%global debug_package %{nil}
%global __os_install_post %{nil}

%description
Moonshot AI application with ORDL Linux packaging revision 2.
Manual update notifications; installation and updates belong to RPM.
Release owner confirmed Moonshot permission. Component notices remain intact.

%prep
echo 'dfd35672af395c7a1da5d80fda3f7e2c463a642c97ff5fc70d97e00141f8c299  %{SOURCE0}' | sha256sum --strict -c -
%setup -q -n KimiCode-linux-x64

%build

%install
bash %{SOURCE1} "$PWD" "%{buildroot}"

%files
%defattr(-,root,root,-)
/opt/kimi-code-ordl
%attr(4755,root,root) /opt/kimi-code-ordl/chrome-sandbox
/usr/share/applications/kimi-code-ordl.desktop
/usr/bin/kimi-code
