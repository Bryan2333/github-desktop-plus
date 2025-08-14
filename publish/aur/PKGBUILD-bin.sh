# Maintainer: Pol Rivero < aur AT polrivero DOT com >
# Contributor: Padraic Fanning < fanninpm AT miamioh DOT edu >
# Contributor: Jake <aur@ja-ke.tech>
# Contributor: Ian MacKay <immackay0@gmail.com>

_pkgname='github-desktop-plus'
pkgname="${_pkgname}-bin"
pkgver=[[VERSION_WITHOUT_V]]
pkgrel=1
pkgdesc="Fork of GitHub Desktop with extra features and improvements (binary release)."
arch=('x86_64' 'aarch64' 'armv7h')
url="https://github.com/pol-rivero/github-desktop-plus"
license=('MIT')
provides=(${_pkgname})
conflicts=(${_pkgname})
depends=(
    'curl'
    'libcurl-gnutls'
    'git'
    'libsecret'
    'libxss'
    'nspr'
    'nss'
    'org.freedesktop.secrets'
    'unzip'
)
optdepends=('hub: CLI interface for GitHub.')
source=(
    "${_pkgname}.desktop"
    'launch-app.sh'
)

_common_download_url="${url}/releases/download/v${pkgver}/GitHubDesktopPlus-v${pkgver}-linux"
source_x86_64=(${_common_download_url}-x86_64.deb)
source_aarch64=(${_common_download_url}-arm64.deb)
source_armv7h=(${_common_download_url}-armhf.deb)

sha256sums=(
    '[[DESKTOP_FILE_SHA256]]'
    '[[LAUNCH_SCRIPT_SHA256]]'
)
sha256sums_x86_64=('[[X86_64_SHA256]]')
sha256sums_aarch64=('[[AARCH64_SHA256]]')
sha256sums_armv7h=('[[ARMV7H_SHA256]]')
package() {
    tar --zstd -xf data.tar.zst -C "${pkgdir}"
    install -d "${pkgdir}/opt/${_pkgname}"

    mv "${pkgdir}/usr/lib/github-desktop-plus/"* "${pkgdir}/opt/${_pkgname}/"
    rmdir "${pkgdir}/usr/lib/github-desktop-plus"
    rmdir "${pkgdir}/usr/lib"

    rm "${pkgdir}/usr/share/applications/github-desktop-plus.desktop"
    install -Dm644 "${_pkgname}.desktop" "${pkgdir}/usr/share/applications/${_pkgname}.desktop"

    install -Dm755 "$srcdir/launch-app.sh" "$pkgdir/usr/bin/${_pkgname}"
}
