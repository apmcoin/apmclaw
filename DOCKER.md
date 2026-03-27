# Docker 실행 가이드 (Windows)

## Windows 환경에서 Docker 명령어

**Git Bash에서 실행:**

```bash
# Docker Compose 명령어 (Git Bash 경로)
DOCKER="/c/Program Files/Docker/Docker/resources/bin/docker.exe"

# 빌드
"$DOCKER" compose build

# 시작
"$DOCKER" compose up -d

# 로그 확인
"$DOCKER" compose logs -f apmclaw
"$DOCKER" compose logs apmclaw --tail 100

# 재시작
"$DOCKER" compose restart apmclaw

# 중지
"$DOCKER" compose down

# 상태 확인
"$DOCKER" ps -a
"$DOCKER" compose ps
```

**PowerShell에서 실행:**

```powershell
# PowerShell은 & 연산자로 공백 포함 경로 실행
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose up -d
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose logs -f apmclaw
& "C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose down
```

**CMD에서 실행:**

```cmd
REM CMD는 따옴표만 사용
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose up -d
"C:\Program Files\Docker\Docker\resources\bin\docker.exe" compose logs -f apmclaw
```

---

## 일반 Linux/Mac 환경

```bash
# 일반적인 docker 명령어 (PATH에 있음)
docker compose up -d
docker compose logs -f apmclaw
docker compose down
```

---

## 주의사항

**Windows Git Bash:**

- `&&` 연산자 사용 가능
- 경로는 `/c/Program Files/...` 형식 (Unix 스타일)

**Windows PowerShell:**

- `&&` 연산자 **사용 불가** (별도 명령어로 분리)
- `Select-Object -First N` 또는 `-Last N` 사용
- 공백 포함 경로는 `&` 연산자 + 따옴표 필수

**Windows CMD:**

- `&&` 연산자 사용 가능
- 공백 포함 경로는 따옴표만 사용
