$certPath = "$env:TEMP\AntigravityDev.cer"
Import-Certificate -FilePath $certPath -CertStoreLocation "Cert:\LocalMachine\Root"
Import-Certificate -FilePath $certPath -CertStoreLocation "Cert:\LocalMachine\TrustedPublisher"
