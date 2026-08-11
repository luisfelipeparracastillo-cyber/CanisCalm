$cert = Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert | Select-Object -First 1
if (-not $cert) {
    $cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=AntigravityDev" -CertStoreLocation "Cert:\CurrentUser\My"
}
$certPath = "$env:TEMP\AntigravityDev.cer"
Export-Certificate -Cert $cert -FilePath $certPath -Force
Import-Certificate -FilePath $certPath -CertStoreLocation "Cert:\CurrentUser\Root" -ErrorAction SilentlyContinue
Import-Certificate -FilePath $certPath -CertStoreLocation "Cert:\CurrentUser\TrustedPublisher" -ErrorAction SilentlyContinue
Set-AuthenticodeSignature "node_modules\better-sqlite3\build\Release\better_sqlite3.node" -Certificate $cert
