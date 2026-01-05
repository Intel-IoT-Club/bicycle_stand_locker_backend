$headers = @{
    "Content-Type" = "application/json"
}
$body = @{
    userName = "testuser_debug"
    email = "test_debug@example.com"
    password = "password123"
    phone = "9999999999"
    role = "user"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method Post -Headers $headers -Body $body
    Write-Host "Signup Success:"
    $response | Format-List
} catch {
    Write-Host "Signup Failed:"
    $_.Exception.Response
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        $reader.ReadToEnd()
    }
}

Write-Host "`n----------------`n"

$loginBody = @{
    email = "test_debug@example.com"
    password = "password123"
    role = "user"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Headers $headers -Body $loginBody
    Write-Host "Login Success:"
    $response | Format-List
} catch {
    Write-Host "Login Failed:"
    $_.Exception.Response
    $stream = $_.Exception.Response.GetResponseStream()
    if ($stream) {
        $reader = New-Object System.IO.StreamReader($stream)
        $reader.ReadToEnd()
    }
}
