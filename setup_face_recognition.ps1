# Quick Setup Script for ESP32-CAM Face Recognition System

Write-Host "====================================================================" -ForegroundColor Yellow
Write-Host "  TripSync ESP32-CAM Face Recognition Setup" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Yellow
Write-Host ""

# Check Python installation
Write-Host "[1/6] Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  [OK] Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  [ERROR] Python not found! Please install Python 3.7+" -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
Write-Host ""
Write-Host "[2/6] Navigating to backend directory..." -ForegroundColor Yellow
Set-Location -Path "backend"
Write-Host "  [OK] Current directory: $(Get-Location)" -ForegroundColor Green

# Install Python dependencies
Write-Host ""
Write-Host "[3/6] Installing Python dependencies..." -ForegroundColor Yellow
Write-Host "  This may take 5-10 minutes (downloading DeepFace models)..." -ForegroundColor Cyan
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] All dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Create necessary directories
Write-Host ""
Write-Host "[4/6] Creating directories..." -ForegroundColor Yellow
$dirs = @("student_faces", "logs")
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
        Write-Host "  [OK] Created: $dir" -ForegroundColor Green
    } else {
        Write-Host "  [OK] Already exists: $dir" -ForegroundColor Gray
    }
}

# Check .env file
Write-Host ""
Write-Host "[5/6] Checking .env configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "  [OK] .env file found" -ForegroundColor Green
    
    # Check critical environment variables
    $envContent = Get-Content ".env" -Raw
    
    $requiredVars = @("MONGO_URI", "JWT_SECRET", "SECRET_KEY")
    $missing = @()
    
    foreach ($var in $requiredVars) {
        if (!($envContent -match "$var=")) {
            $missing += $var
        }
    }
    
    if ($missing.Count -gt 0) {
        Write-Host "  [WARNING] Missing environment variables:" -ForegroundColor Yellow
        $missing | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
    } else {
        Write-Host "  [OK] All required variables present" -ForegroundColor Green
    }
} else {
    Write-Host "  [WARNING] .env file not found!" -ForegroundColor Red
    Write-Host "  Creating .env.example..." -ForegroundColor Yellow
    
    $envExample = @"
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGO_DB=tripsync
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_change_me
SECRET_KEY=your_app_secret_key_change_me
APP_HOST=0.0.0.0
APP_PORT=3000

# Email Configuration (for student notifications)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# MQTT Configuration (optional - uses public broker by default)
MQTT_BROKER=broker.hivemq.com
MQTT_PORT=1883
"@
    
    Set-Content -Path ".env.example" -Value $envExample
    Write-Host "  [OK] Created .env.example - Please copy to .env and configure" -ForegroundColor Green
}

# Test imports
Write-Host ""
Write-Host "[6/6] Testing critical imports..." -ForegroundColor Yellow
$testScript = @"
import sys
try:
    import fastapi
    print('✓ FastAPI')
    import deepface
    print('✓ DeepFace')
    import cv2
    print('✓ OpenCV')
    import paho.mqtt.client
    print('✓ MQTT Client')
    import motor
    print('✓ Motor (MongoDB)')
    sys.exit(0)
except ImportError as e:
    print(f'✗ Import error: {e}')
    sys.exit(1)
"@

$testScript | python -
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] All imports successful" -ForegroundColor Green
} else {
    Write-Host "  [ERROR] Import test failed - check dependencies" -ForegroundColor Red
}

# Final instructions
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Yellow
Write-Host "  Setup Complete!" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Configure .env file with your settings" -ForegroundColor White
Write-Host "  2. Start backend: uvicorn main:app --reload --host 0.0.0.0 --port 3000" -ForegroundColor White
Write-Host "  3. Open browser: http://localhost:3000/docs" -ForegroundColor White
Write-Host "  4. Enroll student faces via Admin Dashboard" -ForegroundColor White
Write-Host "  5. Configure ESP32-CAM with your WiFi and server IP" -ForegroundColor White
Write-Host "  6. Upload ESP32_CAM_TripSync.ino to ESP32-CAM device" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  • ESP32-CAM Integration: ../ESP32_CAM_INTEGRATION_GUIDE.md" -ForegroundColor White
Write-Host "  • API Docs: http://localhost:3000/docs" -ForegroundColor White
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Yellow
