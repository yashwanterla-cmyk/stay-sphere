param()

Write-Host "Removing netsh portproxy and firewall rule for StaySphere Dev"

try {
  netsh interface portproxy reset
} catch {
  Write-Warning "Failed to reset portproxy — you may need to remove specific entries manually."
}

try {
  netsh advfirewall firewall delete rule name="StaySphere Dev Port 80"
} catch {
  Write-Warning "Failed to remove firewall rule — it may not exist."
}

Write-Host "Done."
