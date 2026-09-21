Add-Type -AssemblyName System.Drawing

$publicDir = "d:\CEP\PromptWise\public"
$srcPath = Join-Path $publicDir "20260921_195054.png"

if (-not (Test-Path $srcPath)) {
    Write-Error "Source file $srcPath not found!"
    exit 1
}

function Resize-Image($sourcePath, $destinationPath, $targetWidth, $targetHeight) {
    $srcImage = [System.Drawing.Image]::FromFile($sourcePath)
    $destBitmap = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $graphics.DrawImage($srcImage, 0, 0, $targetWidth, $targetHeight)
    
    # Save to temp file first then replace to avoid locked file handle
    $tempFile = [System.IO.Path]::GetTempFileName()
    $destBitmap.Save($tempFile, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $graphics.Dispose()
    $destBitmap.Dispose()
    $srcImage.Dispose()
    
    Move-Item -Path $tempFile -Destination $destinationPath -Force
    Write-Host "Generated: $destinationPath ($targetWidth x $targetHeight)"
}

Resize-Image $srcPath (Join-Path $publicDir "pwa-192.png") 192 192
Resize-Image $srcPath (Join-Path $publicDir "pwa-512.png") 512 512
Resize-Image $srcPath (Join-Path $publicDir "apple-touch-icon.png") 180 180

Write-Host "All PWA & Apple icons generated successfully!"
