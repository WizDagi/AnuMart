# AnuMart Microservices & Frontend Orchestrator
# Author: Antigravity

$ErrorActionPreference = "Stop"

# Centralized Logs directory
$LogDir = Join-Path $PSScriptRoot "logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir | Out-Null
} else {
    # Clean up old logs from previous runs
    Remove-Item -Path "$LogDir\*" -Force -Recurse -ErrorAction SilentlyContinue
}

# Define services
$Services = @(
    @{ Name = "auth-service";         Port = 8080; Jar = "auth-service\target\auth-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "order-service";        Port = 8081; Jar = "order-service\target\order-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "payment-service";      Port = 8082; Jar = "payment-service\target\payment-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "inventory-service";    Port = 8083; Jar = "inventory-service\target\inventory-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "shipping-service";     Port = 8084; Jar = "shipping-service\target\shipping-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "notification-service"; Port = 8085; Jar = "notification-service\target\notification-service-0.0.1-SNAPSHOT.jar" },
    @{ Name = "product-service";      Port = 8086; Jar = "product-service\target\product-service-0.0.1-SNAPSHOT.jar" }
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "      ANUMART SYSTEM LOCAL ORCHESTRATOR                   " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check PostgreSQL (port 5432)
Write-Host "[*] Checking PostgreSQL port 5432..." -NoNewline
$portCheck = Get-NetTCPConnection -LocalPort 5432 -State Listen -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host " [RUNNING]" -ForegroundColor Green
} else {
    Write-Host " [NOT RUNNING]" -ForegroundColor Red
    Write-Host "[WARNING] PostgreSQL is not running on port 5432. Services may fail to connect!" -ForegroundColor Yellow
}

# 2. Check RabbitMQ (port 5672)
Write-Host "[*] Checking RabbitMQ port 5672..." -NoNewline
$rabbitCheck = Get-NetTCPConnection -LocalPort 5672 -State Listen -ErrorAction SilentlyContinue
if ($rabbitCheck) {
    Write-Host " [RUNNING]" -ForegroundColor Green
} else {
    Write-Host " [INACTIVE]" -ForegroundColor Yellow
    Write-Host "[INFO] RabbitMQ is not active on port 5672. Microservices will run, but event delivery will be simulated/handled lazily." -ForegroundColor Cyan
}

$ProcessList = @()

# 3. Launch Spring Boot Services
Write-Host "`nStarting Microservices..." -ForegroundColor Cyan
foreach ($service in $Services) {
    $JarPath = Join-Path $PSScriptRoot $service.Jar
    if (-not (Test-Path $JarPath)) {
        Write-Host "[ERROR] JAR not found for $($service.Name) at $JarPath. Please build first!" -ForegroundColor Red
        continue
    }

    $LogFile = Join-Path $LogDir "$($service.Name).log"
    $ErrFile = Join-Path $LogDir "$($service.Name)_error.log"

    Write-Host " -> Starting $($service.Name) on port $($service.Port)..." -NoNewline
    
    # Start Spring Boot process and override port in command-line arguments
    $proc = Start-Process java -ArgumentList "-jar", "`"$JarPath`"", "--server.port=$($service.Port)" `
        -NoNewWindow -PassThru -RedirectStandardOutput $LogFile -RedirectStandardError $ErrFile

    if ($proc) {
        $ProcessList += [PSCustomObject]@{
            Name = $service.Name
            Process = $proc
            Port = $service.Port
        }
        Write-Host " [OK] (PID: $($proc.Id))" -ForegroundColor Green
    } else {
        Write-Host " [FAILED]" -ForegroundColor Red
    }
}

# 4. Launch React Frontend (Vite)
Write-Host "`nStarting React Frontend..." -ForegroundColor Cyan
$FrontendDir = Join-Path $PSScriptRoot "frontend"
if (Test-Path $FrontendDir) {
    $LogFile = Join-Path $LogDir "frontend.log"
    $ErrFile = Join-Path $LogDir "frontend_error.log"
    
    Write-Host " -> Launching Vite dev server in background..." -NoNewline
    
    # We run 'npm run dev' using cmd.exe to ensure proper environment resolution on Windows
    $proc = Start-Process cmd.exe -ArgumentList "/c npm run dev" -WorkingDirectory $FrontendDir `
        -NoNewWindow -PassThru -RedirectStandardOutput $LogFile -RedirectStandardError $ErrFile

    if ($proc) {
        $ProcessList += [PSCustomObject]@{
            Name = "frontend"
            Process = $proc
            Port = 5173 # Vite default dev port
        }
        Write-Host " [OK] (PID: $($proc.Id))" -ForegroundColor Green
    } else {
        Write-Host " [FAILED]" -ForegroundColor Red
    }
} else {
    Write-Host "[WARNING] Frontend directory not found!" -ForegroundColor Yellow
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " All services have been launched in the background!" -ForegroundColor Green
Write-Host " Logs are available in the 'logs/' folder:" -ForegroundColor Green
Write-Host "   - logs/auth-service.log"
Write-Host "   - logs/order-service.log"
Write-Host "   - logs/frontend.log (etc.)"
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " >>> Press [Q] at any time to STOP all services and exit. <<<" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Monitor keypress to exit cleanly
$Running = $true
$Headless = $false
while ($Running) {
    if (-not $Headless) {
        try {
            if ([System.Console]::KeyAvailable) {
                $Key = [System.Console]::ReadKey($true)
                if ($Key.KeyChar -eq 'q' -or $Key.KeyChar -eq 'Q') {
                    $Running = $false
                }
            }
        } catch {
            $Headless = $true
            Write-Host "[SYSTEM] Running in headless environment mode." -ForegroundColor Cyan
        }
    }
    
    # Also verify processes are still running, if some crashed we notify
    foreach ($procObj in $ProcessList) {
        if ($procObj.Process.HasExited) {
            Write-Host "[INFO] $($procObj.Name) has stopped running (Exit Code: $($procObj.Process.ExitCode))" -ForegroundColor Yellow
            # Filter it out so we don't repeat
            $ProcessList = $ProcessList | Where-Object { $_.Name -ne $procObj.Name }
            break
        }
    }
    
    Start-Sleep -Seconds 1
}

# Clean shutdown
Write-Host "`nShutting down all services cleanly..." -ForegroundColor Yellow
foreach ($procObj in $ProcessList) {
    if ($procObj.Process -and -not $procObj.Process.HasExited) {
        Write-Host "Stopping $($procObj.Name) (PID: $($procObj.Process.Id))..." -NoNewline
        # Kill the process and all its children (especially important for npm/cmd)
        Stop-Process -Id $procObj.Process.Id -Force -ErrorAction SilentlyContinue
        Write-Host " [STOPPED]" -ForegroundColor Gray
    }
}

Write-Host "All background processes terminated. Goodbye!" -ForegroundColor Green
