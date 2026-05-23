# Backup Script for Laxly AI Law
# This script pulls the database from the remote server to your local machine.

$ServerUser = "root"
$ServerIP = "195.58.34.47"
$RemotePath = "/opt/law-ai-agent/backend/laxly.db"
$LocalBackupDir = "$HOME\Laxly_Backups"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$LocalFileName = "laxly_backup_$Timestamp.db"

# Create local backup directory if it doesn't exist
if (-not (Test-Path $LocalBackupDir)) {
    New-Item -ItemType Directory -Path $LocalBackupDir
    Write-Host "Created local backup directory: $LocalBackupDir"
}

Write-Host "Starting backup from $ServerIP..."

# Execute SCP command
# Note: If you haven't set up SSH keys, this will prompt for a password.
scp "$($ServerUser)@$($ServerIP):$RemotePath" "$LocalBackupDir\$LocalFileName"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backup successful! Saved to $LocalBackupDir\$LocalFileName" -ForegroundColor Green
    
    # Optional: Keep only last 30 backups to save space
    $Backups = Get-ChildItem -Path $LocalBackupDir -Filter "laxly_backup_*.db" | Sort-Object LastWriteTime -Descending
    if ($Backups.Count -gt 30) {
        $Backups[30..($Backups.Count-1)] | Remove-Item -Force
        Write-Host "Deleted old backups. Kept the latest 30."
    }
} else {
    Write-Host "❌ Backup failed. Check your connection and password." -ForegroundColor Red
}
