# Build-High-AI-4Day 저장소 푸시 스크립트
# GitHub에서 저장소를 생성한 후 이 스크립트를 실행하세요.

Write-Host "=== Build-High-AI-4Day 저장소 푸시 ===" -ForegroundColor Green
Write-Host ""

# 원격 저장소 확인
Write-Host "원격 저장소 확인 중..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "현재 원격 저장소: $remoteUrl" -ForegroundColor Cyan
} else {
    Write-Host "원격 저장소가 설정되지 않았습니다." -ForegroundColor Red
    exit 1
}

# 저장소 존재 확인
Write-Host ""
Write-Host "저장소 연결 확인 중..." -ForegroundColor Yellow
$checkRemote = git ls-remote origin 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ 저장소를 찾을 수 없습니다!" -ForegroundColor Red
    Write-Host ""
    Write-Host "다음 단계를 수행하세요:" -ForegroundColor Yellow
    Write-Host "1. https://github.com/new 에서 새 저장소 생성" -ForegroundColor White
    Write-Host "2. 저장소 이름: build-high-ai-4day" -ForegroundColor White
    Write-Host "3. Public 또는 Private 선택" -ForegroundColor White
    Write-Host "4. README, .gitignore, license 추가하지 않기" -ForegroundColor White
    Write-Host "5. 저장소 생성 후 이 스크립트를 다시 실행하세요" -ForegroundColor White
    exit 1
}

Write-Host "✅ 저장소 연결 확인 완료" -ForegroundColor Green
Write-Host ""

# 현재 브랜치 확인
$currentBranch = git branch --show-current
Write-Host "현재 브랜치: $currentBranch" -ForegroundColor Cyan
Write-Host ""

# 푸시 실행
Write-Host "저장소로 푸시 중..." -ForegroundColor Yellow
git push -u origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ 푸시 완료!" -ForegroundColor Green
    Write-Host ""
    Write-Host "저장소 URL: https://github.com/rwhalelab/build-high-ai-4day" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ 푸시 실패" -ForegroundColor Red
    Write-Host "에러를 확인하고 다시 시도하세요." -ForegroundColor Yellow
}
