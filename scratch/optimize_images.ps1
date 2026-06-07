Add-Type -AssemblyName System.Drawing

function Optimize-Png {
    param (
        [string]$filePath,
        [int]$maxWidth = 1920,
        [int]$maxHeight = 1080,
        [bool]$convertToJpeg = $false
    )

    try {
        if (-not (Test-Path $filePath)) {
            Write-Host "File not found: $filePath"
            return
        }

        $oldSize = (Get-Item $filePath).Length
        $image = [System.Drawing.Image]::FromFile($filePath)
        
        # Calculate new dimensions preserving aspect ratio
        $ratioX = $maxWidth / $image.Width
        $ratioY = $maxHeight / $image.Height
        $ratio = [System.Math]::Min($ratioX, $ratioY)
        
        if ($ratio -lt 1.0) {
            $newWidth = [int]($image.Width * $ratio)
            $newHeight = [int]($image.Height * $ratio)
        } else {
            $newWidth = $image.Width
            $newHeight = $image.Height
            if (-not $convertToJpeg) {
                $image.Dispose()
                Write-Host "Skipped (no resize needed): $filePath"
                return
            }
        }

        # Create new bitmap
        $newBmp = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
        $g = [System.Drawing.Graphics]::FromImage($newBmp)
        
        # Setup high quality rendering
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        
        # Clear background to white if converting to JPEG
        if ($convertToJpeg) {
            $g.Clear([System.Drawing.Color]::White)
        }
        
        # Draw original image onto new canvas
        $g.DrawImage($image, 0, 0, $newWidth, $newHeight)
        
        $g.Dispose()
        $image.Dispose()

        $tempPath = $filePath + ".tmp"
        
        if ($convertToJpeg) {
            $codecs = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()
            $jpegCodec = $codecs | Where-Object { $_.MimeType -eq "image/jpeg" }
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $qualityParam = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 82)
            $encoderParams.Param[0] = $qualityParam
            
            $newBmp.Save($tempPath, $jpegCodec, $encoderParams)
        } else {
            $newBmp.Save($tempPath, [System.Drawing.Imaging.ImageFormat]::Png)
        }
        
        $newBmp.Dispose()
        
        $newSize = (Get-Item $tempPath).Length
        if ($newSize -lt $oldSize) {
            Remove-Item $filePath -Force
            Rename-Item $tempPath (Split-Path $filePath -Leaf) -Force
            $oldSizeKB = [Math]::Round($oldSize / 1024, 2)
            $newSizeKB = [Math]::Round($newSize / 1024, 2)
            $savedKB = [Math]::Round(($oldSize - $newSize) / 1024, 2)
            Write-Host "Optimized: $filePath ($oldSizeKB KB -> $newSizeKB KB | Saved $savedKB KB)"
        } else {
            Remove-Item $tempPath -Force
            Write-Host "Skipped (original is smaller): $filePath"
        }
    } catch {
        Write-Host "Error processing $($filePath): $($_.Exception.Message)"
    }
}

$imagesDir = "C:\Saranga_ayurveda_application_updates\Production_folder_final\02\cosmetics_app\my-app\webapp\public\images"

Write-Host "=== Starting Image Optimization ==="

# 1. Optimize Logo (Keep PNG with transparency, drop to 400x400)
Optimize-Png -filePath "$imagesDir\logo.png" -maxWidth 400 -maxHeight 400 -convertToJpeg $false

# 2. Optimize Banners (Large solid backgrounds, convert to JPEG)
Get-ChildItem -Path "$imagesDir\banner" -Filter *.png | ForEach-Object {
    Optimize-Png -filePath $_.FullName -maxWidth 1920 -maxHeight 1080 -convertToJpeg $true
}

# 3. Optimize Combo images (Convert to JPEG)
Get-ChildItem -Path "$imagesDir\combos" -Filter *.png | ForEach-Object {
    Optimize-Png -filePath $_.FullName -maxWidth 1200 -maxHeight 1200 -convertToJpeg $true
}

# 4. Optimize Routines images (Convert to JPEG)
Get-ChildItem -Path "$imagesDir\routine" -Filter *.png | ForEach-Object {
    Optimize-Png -filePath $_.FullName -maxWidth 1000 -maxHeight 1000 -convertToJpeg $true
}

# 5. Optimize other large pages/bg images (Convert to JPEG)
Optimize-Png -filePath "$imagesDir\Our Story - Page 01_BG Image.png" -maxWidth 1920 -maxHeight 1080 -convertToJpeg $true
Optimize-Png -filePath "$imagesDir\about-hero.png" -maxWidth 1200 -maxHeight 1200 -convertToJpeg $true
Optimize-Png -filePath "$imagesDir\about-hero.jpg" -maxWidth 1200 -maxHeight 1200 -convertToJpeg $false
Optimize-Png -filePath "$imagesDir\contact-hero.png" -maxWidth 1200 -maxHeight 1200 -convertToJpeg $true
Optimize-Png -filePath "$imagesDir\contact-faq.png" -maxWidth 1000 -maxHeight 1000 -convertToJpeg $true
Optimize-Png -filePath "$imagesDir\careers-book.png" -maxWidth 1000 -maxHeight 1000 -convertToJpeg $true
Optimize-Png -filePath "$imagesDir\profile_wellness_banner.png" -maxWidth 1000 -maxHeight 1000 -convertToJpeg $true

# 6. Optimize general About-Us page illustrations (Convert to JPEG)
Optimize-Png -filePath "$imagesDir\about-heritage-ashram.png" -maxWidth 1000 -maxHeight 1000 -convertToJpeg $true
Optimize-Png -filePath "$imagesDir\about-harvest.png" -maxWidth 1000 -maxHeight 1000 -convertToJpeg $true
Optimize-Png -filePath "$imagesDir\about-community-gathering.png" -maxWidth 1000 -maxHeight 1000 -convertToJpeg $true
Optimize-Png -filePath "$imagesDir\about-step-1.png" -maxWidth 800 -maxHeight 800 -convertToJpeg $true
Optimize-Png -filePath "$imagesDir\about-step-2.png" -maxWidth 800 -maxHeight 800 -convertToJpeg $true
Optimize-Png -filePath "$imagesDir\about-step-3.png" -maxWidth 800 -maxHeight 800 -convertToJpeg $true
Optimize-Png -filePath "$imagesDir\about-step-4.png" -maxWidth 800 -maxHeight 800 -convertToJpeg $true

# 7. Optimize decorative leaves & watercolors (Keep PNG transparency, downscale width)
Optimize-Png -filePath "$imagesDir\about-us-leaves.png" -maxWidth 800 -maxHeight 800 -convertToJpeg $false
Optimize-Png -filePath "$imagesDir\watercolor-leaves-branch.png" -maxWidth 800 -maxHeight 800 -convertToJpeg $false
Optimize-Png -filePath "$imagesDir\profile_leaf_bg.png" -maxWidth 800 -maxHeight 800 -convertToJpeg $false

Write-Host "=== Image Optimization Completed ==="
