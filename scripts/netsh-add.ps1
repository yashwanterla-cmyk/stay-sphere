param(
  [int]$TargetPort = 5173
)

Write-Host "Adding netsh portproxy from port 80 -> 127.0.0.1:$TargetPort"

# Allow inbound on port 80 through Windows Firewall
netsh advfirewall firewall add rule name="StaySphere Dev Port 80" dir=in action=allow protocol=TCP localport=80 | Out-Null

# Add port proxy
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=$TargetPort connectaddress=127.0.0.1

Write-Host "Portproxy added. To remove run scripts\\netsh-remove.ps1 as Administrator."
