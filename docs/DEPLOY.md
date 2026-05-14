# Glowmax — Deploy & Infra Runbook

Toàn bộ cách dựng AWS + deploy backend Glowmax từ zero, viết theo **state thực tế** đang chạy production. Đọc xong làm theo là chạy được.

---

## 1. Architecture (Production hiện tại)

```
Mobile App (React Native)
       │  HTTPS
       ▼
   Name.com DNS
api.glowmax.instory.codes  ──►  52.76.154.191 (Elastic IP)
       │
       ▼
┌──────────────────────────────────────────┐
│  EC2 t4g.small (ARM64, Ubuntu)           │
│  Region: ap-southeast-1 (Singapore)      │
│  Instance ID: i-001812e08b9a24e16        │
│                                          │
│  ┌──────────────────────────────────┐    │
│  │ Caddy 2  :80 :443                │    │  Auto HTTPS (Let's Encrypt)
│  │ reverse_proxy → api:8080         │    │  Email: minhdang875425@gmail.com
│  └──────────────┬───────────────────┘    │
│                 │ Docker network          │
│  ┌──────────────▼───────────────────┐    │
│  │ Spring Boot 4.0 / Java 25        │    │  ghcr.io/mindangg/glowmax-api:latest
│  │ :8080 (internal only)            │    │
│  └──────────────┬───────────────────┘    │
└─────────────────┼────────────────────────┘
                  │
        ┌─────────┼─────────┐
        ▼                   ▼
   ┌─────────┐         ┌─────────┐
   │  RDS    │         │   S3    │
   │ Postgres│         │ avatars │
   │  17.9   │         │ bucket  │
   │t4g.micro│         │         │
   │ 20GB gp3│         │         │
   └─────────┘         └─────────┘
glowmax-db.chi86g00cnay   glowmax-avatars
.ap-southeast-1.rds          (ap-southeast-1)
.amazonaws.com:5432
```

**Chi phí thực tế:** ~$33-36/tháng (EC2 ~$12 + RDS ~$21 + S3 ~$0.5). Năm đầu có thể dùng AWS $200 credits.

---

## 2. Resources hiện đang chạy

| Resource | Identifier | Region | Note |
|---|---|---|---|
| EC2 instance | `i-001812e08b9a24e16` | ap-southeast-1 | t4g.small, Ubuntu, ARM64 |
| Elastic IP | `52.76.154.191` | ap-southeast-1 | Associated to EC2 |
| RDS instance | `glowmax-db` | ap-southeast-1 | PostgreSQL 17.9, db.t4g.micro |
| RDS endpoint | `glowmax-db.chi86g00cnay.ap-southeast-1.rds.amazonaws.com:5432` | | DB name: `glowmax`, master user: `postgres` |
| S3 bucket | `glowmax-avatars` | ap-southeast-1 | Public read cho avatar |
| IAM user | `glowmax-app` | global | Access key đã cấp cho backend |
| Container registry | `ghcr.io/mindangg/glowmax-api` | global | Private, dùng GHCR_TOKEN để pull |
| Domain | `api.glowmax.instory.codes` | name.com | A record → Elastic IP, không proxy |

SSH key: `~/.ssh/glowmax.pem` trên máy dev (đã chmod 400).

---

## 3. Setup AWS từ zero

### 3.1. AWS account + IAM

1. Tạo AWS account → bật MFA cho root
2. IAM → Users → Create user `mindang` → attach `AdministratorAccess` → enable Console access + MFA
3. Billing → Budgets → tạo budget $40/tháng, alert khi > 80%
4. Region mặc định: **ap-southeast-1** (Singapore — gần VN nhất)

### 3.2. S3 bucket cho avatar

1. S3 → Create bucket
   - Name: `glowmax-avatars`
   - Region: `ap-southeast-1`
   - **Block all public access**: OFF (avatar cần public read)
   - Versioning: Enable
2. Bucket policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::glowmax-avatars/*"
     }]
   }
   ```
3. CORS (cho mobile app upload trực tiếp nếu cần):
   ```json
   [{
     "AllowedOrigins": ["*"],
     "AllowedMethods": ["GET", "PUT", "POST"],
     "AllowedHeaders": ["*"],
     "MaxAgeSeconds": 3000
   }]
   ```

### 3.3. IAM user cho backend (`glowmax-app`)

1. IAM → Users → Create user `glowmax-app` (KHÔNG cấp Console access)
2. Attach inline policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"],
       "Resource": "arn:aws:s3:::glowmax-avatars/*"
     }]
   }
   ```
3. Security credentials → Create access key → loại **Application running outside AWS**
4. Lưu **Access Key ID** + **Secret Access Key** → điền vào `/opt/glowmax/.env.prod` trên EC2 (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)

### 3.4. EC2 instance

1. EC2 → Launch instance
   - Name: `glowmax-api`
   - AMI: **Ubuntu Server 24.04 LTS (ARM64)** (hoặc 26.04 nếu có)
   - Type: `t4g.small` (2 vCPU ARM, 2GB RAM)
   - Key pair: tạo mới `glowmax-key` → download `.pem` → lưu cẩn thận
   - Network: default VPC, public subnet, auto-assign public IP: Enable
   - Security group `glowmax-sg`:
     | Type | Port | Source | Purpose |
     |---|---|---|---|
     | SSH | 22 | My IP | dev access |
     | HTTP | 80 | 0.0.0.0/0 | Caddy redirect → HTTPS |
     | HTTPS | 443 | 0.0.0.0/0 | API traffic |
   - Storage: 30GB gp3
2. EC2 → Elastic IPs → Allocate → Associate vào instance vừa tạo
3. Ghi nhớ Elastic IP (`52.76.154.191` trong trường hợp này)

### 3.5. RDS PostgreSQL

1. RDS → Databases → Create database
   - Engine: **PostgreSQL 17.x**
   - Template: **Free tier** (nếu còn) hoặc **Dev/Test**
   - DB instance identifier: `glowmax-db`
   - Master username: `postgres`
   - Master password: lưu vào password manager
   - Instance class: `db.t4g.micro`
   - Storage: **20 GB gp3** (gp3 rẻ hơn gp2, IOPS bao gồm 3000)
   - Storage autoscaling: max 50GB
   - VPC: cùng VPC với EC2
   - Public access: **No** (chỉ EC2 trong cùng VPC connect được)
   - VPC security group: tạo mới hoặc dùng default
   - Initial database name: `glowmax`
   - Backup retention: 7 ngày
2. Sau khi tạo xong, vào RDS security group → Inbound:
   - Type: PostgreSQL, Port 5432, Source: security group của EC2 (`glowmax-sg`)
3. Ghi nhớ endpoint: `glowmax-db.<random>.ap-southeast-1.rds.amazonaws.com:5432`

**Note:** Hiện tại Spring Boot connect bằng master user `postgres`. Sau khi app stable, **nên** tạo `glowmax_app` user với quyền DML only — xem section 9.1.

---

## 4. DNS — Name.com

Không dùng Cloudflare, trỏ DNS trực tiếp ở name.com:

1. Đăng nhập name.com → `instory.codes` → Manage → DNS
2. Add record:
   ```
   Type   Host         Answer                TTL
   A      api.glowmax  52.76.154.191         300
   ```
3. Verify propagation:
   ```bash
   dig api.glowmax.instory.codes +short
   # → 52.76.154.191
   ```

DNS-only (không proxy) — Caddy issue cert Let's Encrypt trực tiếp, không cần Cloudflare API.

---

## 5. EC2 bootstrap

SSH từ máy dev (WSL hoặc Git Bash):

```bash
chmod 400 ~/.ssh/glowmax.pem
ssh -i ~/.ssh/glowmax.pem ubuntu@52.76.154.191
```

Trên EC2:

```bash
# 1. Update + install Docker
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg

# 2. Add Docker official repo
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=arm64 signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 3. Add ubuntu user vào group docker (log out + log in lại sau)
sudo usermod -aG docker ubuntu

# 4. Tạo app directory
sudo mkdir -p /opt/glowmax
sudo chown ubuntu:ubuntu /opt/glowmax
cd /opt/glowmax

# 5. Tạo caddy config folder
mkdir -p caddy
```

Logout + SSH lại để group `docker` có hiệu lực.

---

## 6. Config files trên EC2

### 6.1. `/opt/glowmax/docker-compose.prod.yml`

Copy từ `infra/docker-compose.prod.yml` trong repo (đã đúng):

```bash
scp -i ~/.ssh/glowmax.pem infra/docker-compose.prod.yml \
    ubuntu@52.76.154.191:/opt/glowmax/
scp -i ~/.ssh/glowmax.pem infra/Caddyfile \
    ubuntu@52.76.154.191:/opt/glowmax/caddy/
```

### 6.2. `/opt/glowmax/.env.prod`

```bash
nano /opt/glowmax/.env.prod
chmod 600 /opt/glowmax/.env.prod
```

Nội dung (điền giá trị thật):

```env
SPRING_PROFILES_ACTIVE=prod

# Database — RDS endpoint
DB_URL=jdbc:postgresql://glowmax-db.chi86g00cnay.ap-southeast-1.rds.amazonaws.com:5432/glowmax
DB_USERNAME=postgres
DB_PASSWORD=<RDS master password>

# JWT
JWT_SECRET=<32+ char random string — openssl rand -base64 48>
JWT_ISSUER=api.glowmax.instory.codes

# OAuth
GOOGLE_CLIENT_ID=<Google Cloud Console OAuth Web Client ID>
GOOGLE_CLIENT_SECRET=<Google secret>

# Apple Sign-In (sau khi có Apple Developer)
# APPLE_CLIENT_ID=
# APPLE_TEAM_ID=
# APPLE_KEY_ID=
# APPLE_PRIVATE_KEY_PATH=

# OpenAI
OPENAI_API_KEY=<sk-...>

# AWS (IAM user glowmax-app)
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=<glowmax-app access key>
AWS_SECRET_ACCESS_KEY=<glowmax-app secret>
S3_AVATAR_BUCKET=glowmax-avatars

# CORS — mobile app dùng scheme glowmax://
CORS_ALLOWED_ORIGINS=glowmax://

# GHCR token để pull image private
GHCR_TOKEN=<GitHub Personal Access Token có scope read:packages>
```

Tạo JWT secret:
```bash
openssl rand -base64 48
```

### 6.3. `/opt/glowmax/deploy.sh`

```bash
nano /opt/glowmax/deploy.sh
chmod +x /opt/glowmax/deploy.sh
```

Nội dung:

```bash
#!/bin/bash
set -e

source /opt/glowmax/.env.prod

echo "$GHCR_TOKEN" | docker login ghcr.io -u mindangg --password-stdin

cd /opt/glowmax
docker compose -f docker-compose.prod.yml pull api
docker compose -f docker-compose.prod.yml up -d
docker image prune -f

echo "Deploy done!"
```

---

## 7. CI/CD — GitHub Actions

File: `.github/workflows/ci-cd.yml` (đã có sẵn trong repo).

### 7.1. GitHub Secrets cần setup

GitHub repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Giá trị | Dùng để |
|---|---|---|
| `EC2_HOST` | `52.76.154.191` | SSH target |
| `EC2_SSH_KEY` | Toàn bộ nội dung file `glowmax.pem` (kể cả `-----BEGIN/END-----`) | SSH auth |

`GITHUB_TOKEN` có sẵn — không cần tạo, dùng để push image lên ghcr.io.

### 7.2. GHCR Personal Access Token (cho EC2 pull image)

EC2 cần token riêng để `docker pull` từ ghcr.io (vì image là private):

1. GitHub → Settings → Developer settings → Personal access tokens → **Tokens (classic)**
2. Generate new token (classic) → name `glowmax-ec2-pull`
3. Scope: chỉ tick **`read:packages`**
4. Copy token → paste vào `/opt/glowmax/.env.prod` ở dòng `GHCR_TOKEN=...`

### 7.3. Image package visibility

Lần đầu push image lên ghcr.io, package mặc định là private. Verify:
- GitHub → profile → Packages → `glowmax-api` → Package settings
- Đảm bảo connect đúng repo `mindangg/glowmax` (Manage Actions access)

### 7.4. Workflow tóm tắt

- **Trigger:** PR vào main hoặc push lên main, paths `backend/**` hoặc `.github/workflows/ci-cd.yml`
- **Job `test`:** chạy `./mvnw verify` với Postgres 17 service + H2 in-memory
- **Job `deploy`** (chỉ khi push main + test pass):
  1. Build JAR
  2. Build ARM64 Docker image qua QEMU + buildx
  3. Push lên `ghcr.io/mindangg/glowmax-api:latest` + tag SHA
  4. SSH vào EC2, chạy `/opt/glowmax/deploy.sh`

---

## 8. First deploy

Trên EC2 (sau khi config xong section 5 + 6):

```bash
cd /opt/glowmax

# Login ghcr.io 1 lần
source .env.prod
echo "$GHCR_TOKEN" | docker login ghcr.io -u mindangg --password-stdin

# Pull + start
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Theo dõi logs (Ctrl+C để dừng — container vẫn chạy)
docker compose -f docker-compose.prod.yml logs -f

# Verify
curl https://api.glowmax.instory.codes/actuator/health
# → {"status":"UP"}
```

Caddy mất 1-2 phút để issue Let's Encrypt cert lần đầu. Theo dõi:
```bash
docker logs glowmax-caddy 2>&1 | grep -i "obtain\|cert"
```

---

## 9. Hardening & Operations

### 9.1. (TODO) Tạo DB app user least-privilege

Hiện tại app dùng master `postgres` — không khuyến nghị lâu dài. Khi rảnh:

```bash
# SSH vào EC2 rồi connect RDS
docker run -it --rm postgres:17-alpine psql \
  "postgresql://postgres:<MASTER_PASS>@glowmax-db.chi86g00cnay.ap-southeast-1.rds.amazonaws.com:5432/glowmax"

-- Trong psql:
CREATE USER glowmax_app WITH PASSWORD '<new strong password>';
GRANT CONNECT ON DATABASE glowmax TO glowmax_app;
GRANT USAGE ON SCHEMA public TO glowmax_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO glowmax_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO glowmax_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO glowmax_app;
\q

# Update .env.prod: DB_USERNAME=glowmax_app, DB_PASSWORD=<new pass>
# Restart api
docker compose -f docker-compose.prod.yml up -d api
```

**Lưu ý:** Flyway migrations cần DDL → khi run migration mới, tạm switch lại `postgres` user, chạy migration, switch về `glowmax_app`.

### 9.2. Security hardening EC2

```bash
# fail2ban — ban IP brute-force SSH
sudo apt install -y fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd

# Auto security updates (Ubuntu unattended-upgrades)
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 9.3. Monitoring (free)

UptimeRobot:
1. [uptimerobot.com](https://uptimerobot.com) → Add Monitor → HTTP(s)
2. URL: `https://api.glowmax.instory.codes/actuator/health`
3. Interval: 5 min, alert email

### 9.4. Backups

RDS đã có automated backup 7 ngày. Để giữ snapshot lâu hơn:
- RDS → Snapshots → Take snapshot manually trước mỗi release lớn
- Hoặc setup `aws rds create-db-snapshot` qua cron + lifecycle

---

## 10. Ops cheatsheet

### Update app thủ công (không qua CI/CD)

```bash
ssh -i ~/.ssh/glowmax.pem ubuntu@52.76.154.191
/opt/glowmax/deploy.sh
```

### Xem logs

```bash
# Spring Boot
docker logs -f glowmax-api
docker logs glowmax-api --tail 100
docker logs glowmax-api --since 1h

# Caddy (cert + access log)
docker logs -f glowmax-caddy

# Tất cả services
cd /opt/glowmax && docker compose -f docker-compose.prod.yml logs -f
```

### Restart

```bash
# Chỉ api
cd /opt/glowmax && docker compose -f docker-compose.prod.yml restart api

# Tất cả
cd /opt/glowmax && docker compose -f docker-compose.prod.yml restart

# Stop hẳn
docker compose -f docker-compose.prod.yml down
```

### Rollback về image cũ

```bash
# List các tag image trên local
docker images ghcr.io/mindangg/glowmax-api

# Edit compose file, đổi `:latest` → `:<sha-cũ>`
nano /opt/glowmax/docker-compose.prod.yml
docker compose -f docker-compose.prod.yml up -d api
```

### Rotate JWT secret (force logout all users)

```bash
nano /opt/glowmax/.env.prod    # đổi JWT_SECRET
docker compose -f docker-compose.prod.yml up -d api
```

### Disk usage

```bash
df -h /
docker system df
docker system prune -af    # xóa images/containers/networks không dùng
```

### Connect vào RDS từ EC2 (debug)

```bash
docker run -it --rm postgres:17-alpine psql \
  "postgresql://postgres:<PASS>@glowmax-db.chi86g00cnay.ap-southeast-1.rds.amazonaws.com:5432/glowmax"
```

---

## 11. Troubleshooting

### Caddy không issue cert

```bash
docker logs glowmax-caddy | grep -iE "error|acme|obtain"
```
Nguyên nhân thường gặp:
- DNS chưa propagate (`dig api.glowmax.instory.codes` không ra Elastic IP)
- Port 80/443 chưa mở trong Security Group
- Rate limit Let's Encrypt (5 cert/domain/tuần) — chờ hoặc dùng staging

### Spring Boot không connect được RDS

```bash
docker logs glowmax-api | grep -iE "connection|hikari|postgres"
```
- RDS security group chưa allow EC2 security group port 5432
- `.env.prod` sai `DB_URL` / `DB_PASSWORD`
- RDS public access = No → connect từ ngoài VPC không được (normal — phải qua EC2)

### Image pull failed `unauthorized`

```bash
# Re-login ghcr.io với token mới
source /opt/glowmax/.env.prod
echo "$GHCR_TOKEN" | docker login ghcr.io -u mindangg --password-stdin
```
Token có thể đã expire — generate mới trong GitHub settings.

### 502 Bad Gateway

Caddy không connect được api container:
```bash
docker compose -f docker-compose.prod.yml ps
# api phải Up; nếu Exited → docker logs glowmax-api
```

---

## 12. Pending TODO

- [ ] Tạo DB app user `glowmax_app` (section 9.1)
- [ ] Setup Apple Sign-In sau khi có Apple Developer account
- [ ] Rotate OpenAI API key (key cũ đã expose trong chat history)
- [ ] Verify S3 bucket CORS nếu mobile app cần direct upload
- [ ] Setup CloudWatch alarms cho RDS CPU / connection count
- [ ] Tài liệu khôi phục từ RDS snapshot (test thử 1 lần)
