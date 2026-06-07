Add-Type -AssemblyName System.Drawing

$imagesPath = "C:\Saranga_ayurveda_application_updates\Production_folder_final\02\cosmetics_app\my-app\webapp\public\images"

Write-Host "--- Scanning public/images ---"
Get-ChildItem -Path $imagesPath -Filter *.png -Recurse | ForEach-Object {
    try {
        $img = [System.Drawing.Image]::FromFile($_.FullName)
        $sizeKB = [Math]::Round($_.Length / 1024, 2)
        Write-Host "$($_.RelativeName) | Resolution: $($img.Width)x$($img.Height) | Size: $sizeKB KB"
        $img.Dispose()
    } catch {
        Write-Host "Failed to load: $($_.FullName)"
    }
}
