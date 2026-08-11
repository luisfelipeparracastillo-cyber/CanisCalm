$cert = New-SelfSignedCertificate -Type CodeSigningCert -Subject "CN=AntigravityDev" -CertStoreLocation "Cert:\CurrentUser\My"
Set-AuthenticodeSignature -FilePath "node_modules\better-sqlite3\build\Release\better_sqlite3.node" -Certificate $cert
