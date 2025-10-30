# Test all 6 programming languages
Write-Host "Testing NeuroCoder AI - All 6 Languages" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$prompt = "create number sorting from the biggest to smallest 7 5 0 3 9 2 4 8 5 4"
$languages = @("python", "javascript", "typescript", "rust", "go", "solidity")

foreach ($lang in $languages) {
    Write-Host "Testing $lang..." -ForegroundColor Yellow
    
    $body = @{
        prompt = $prompt
        language = $lang
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3000/api/generate" -Method POST -Body $body -ContentType "application/json"
        
        Write-Host "Success!" -ForegroundColor Green
        Write-Host "  Quality Score: $($response.reviewScore)" -ForegroundColor Cyan
        Write-Host "  Complexity: $($response.complexity)" -ForegroundColor Cyan
        Write-Host "  Processing Time: $($response.metadata.processingTime)s" -ForegroundColor Cyan
        Write-Host "  Lines of Code: $($response.metadata.linesOfCode)" -ForegroundColor Cyan
        
        # Check for issues
        if ($response.issues.Count -gt 0) {
            Write-Host "  Issues found:" -ForegroundColor Yellow
            foreach ($issue in $response.issues) {
                Write-Host "    - $($issue.message)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  No issues found!" -ForegroundColor Green
        }
        
        # Save code to file
        $filename = "test-output-$lang.txt"
        $response.code | Out-File -FilePath $filename -Encoding UTF8
        Write-Host "  Code saved to: $filename" -ForegroundColor Gray
    }
    catch {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All tests complete!" -ForegroundColor Green
