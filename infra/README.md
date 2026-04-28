# Glowmax — Infra Setup Guide

Hướng dẫn deploy toàn bộ backend lên AWS từ đầu, làm qua **AWS Console** (click UI — không cần CDK/Terraform).

## Architecture (Phase A — 0 → 1k user)

```
Mobile App (RN)
      │  HTTPS
      ▼
┌─────────────────────────────────┐
│  Cloudflare (free)              │  DNS + CDN + DDoS + Bot protection
│  api.glowmax.codes → Elastic IP │
└──────────────┬──────────────────┘
               │  HTTPS
               ▼
┌──────────────────────────────────────────┐
│  EC2 t4g.small (ARM, ~$12/tháng)        │
│  ┌────────────────────────────────────┐  │
│  │  Caddy (port 80/443)              │  │  Auto HTTPS (Let's Encrypt free)
│  │  reverse_proxy → api:8080         │  │
│  └──────────────┬─────────────────── ┘  │
│                 │  Docker network        │
│  ┌──────────────▼─────────────────────┐ │
│  │  Spring Boot (port 8080)           │ │
│  └──────────────┬─────────────────────┘ │
│                 │  Docker network        │
│  ┌──────────────▼─────────────────────┐ │
│  │  Postgres 16 (127.0.0.1:5432)     │ │  Không expose ra internet
│  └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
               │
               ▼
         S3 Bucket               ~$0.5/tháng
    (glowmax-leaderboard-avatars)
```

**Chi phí Phase A:** ~$15-18/tháng (EC2 + EBS + S3). Với $200 AWS credits → gần như miễn phí năm đầu.

---

## Bước 1 — AWS Account + MFA (30 phút)

1. Tạo AWS account tại [aws.amazon.com](https://aws.amazon.com)
2. **Bật MFA cho root account ngay** (Console → IAM → Security credentials → MFA)
   - Dùng Authenticator app (Google Authenticator / Authy)
   - Root account bị hack = mất toàn bộ infra
3. Tạo IAM user cho daily use (không dùng root để làm việc thường ngày):
   - Console → IAM → Users → Add user
   - Username: `mindang` (tên bạn)
   - Permissions: Attach policy `AdministratorAccess` (solo dev, đơn giản hóa)
   - Enable Console access, bật MFA
4. Setup billing alarm:
   - Console → Billing → Budgets → Create budget
   - Type: Cost budget, Amount: $30/tháng
   - Alert khi actual > 80% → gửi email cảnh báo

---

## Bước 2 — Domain + Cloudflare (30 phút)

1. Claim domain `glowmax.codes` qua **GitHub Student Developer Pack** → Name.com (miễn phí)
   - URL: [education.github.com/pack](https://education.github.com/pack)
2. Tạo **Cloudflare account** → [cloudflare.com](https://cloudflare.com) → Add site `glowmax.codes`
3. Đổi nameservers tại Name.com → Cloudflare nameservers (Cloudflare hiện trong dashboard)
   - Propagate DNS: 5-30 phút
4. Trong Cloudflare → Security → Bots → **Bật Bot Fight Mode** (free, chặn scraper/bot)
5. DNS records (thêm sau khi có EC2 Elastic IP ở Bước 4):
   ```
   Type  Name   Value           Proxy
   A     api    <Elastic IP>    ON (orange cloud) ← proxied qua Cloudflare
   ```

---

## Bước 3 — Tạo S3 Bucket (15 phút)

### Avatar bucket

1. Console → S3 → **Create bucket**
   - Name: `glowmax-leaderboard-avatars`
   - Region: `ap-southeast-1` (Singapore)
   - **Block Public Access**: Tắt "Block all public access" (avatar cần public read)
   - Versioning: Bật
2. Bucket policy (public read cho object, không cho list):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Principal": "*",
       "Action": "s3:GetObject",
       "Resource": "arn:aws:s3:::glowmax-leaderboard-avatars/*"
     }]
   }
   ```
3. Thêm vào Cloudflare DNS nếu muốn dùng CDN cho avatar:
   ```
   CNAME  avatars  glowmax-leaderboard-avatars.s3.ap-southeast-1.amazonaws.com
   ```

### Backup bucket

1. Tạo bucket riêng: `glowmax-backups`
   - Block ALL public access: BẬT (backup không cần public)
   - Versioning: Bật
2. Lifecycle rule (tự xóa backup cũ):
   - Management → Lifecycle rules → Create rule
   - Prefix: `postgres/`
   - Expiration: Current versions expire after **30 days**

### IAM user cho S3 upload (từ app)

1. Console → IAM → Users → **Create user**: `glowmax-app`
2. Attach inline policy (least privilege):
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [{
       "Effect": "Allow",
       "Action": ["s3:PutObject", "s3:DeleteObject", "s3:GetObject"],
       "Resource": "arn:aws:s3:::glowmax-leaderboard-avatars/*"
     }]
   }
   ```
3. Security credentials → Create access key → Application running outside AWS
4. Lưu Access Key ID + Secret Access Key → điền vào `.env.prod`

---

## Bước 4 — Launch EC2 Instance (45 phút)

1. Console → EC2 → **Launch instance**
   - **Name**: `glowmax-api`
   - **AMI**: Amazon Linux 2023 (ARM64) — free tier eligible, bảo mật updates tốt
   - **Instance type**: `t4g.small` (2 vCPU ARM, 2GB RAM, ~$12/tháng)
     - Nếu muốn free tier: `t4g.micro` (512MB RAM) — Spring Boot có thể chật
   - **Key pair**: Tạo mới → `glowmax-key` → Download `.pem` → **lưu cẩn thận, mất là mất access**
   - **Network**: Default VPC, public subnet, Auto-assign public IP: Enable
   - **Security group**: Tạo mới `glowmax-sg`:
     - Inbound: SSH port 22 từ **My IP** only (không mở cho 0.0.0.0/0)
     - Inbound: HTTP port 80 từ 0.0.0.0/0 (Caddy xử lý redirect → HTTPS)
     - Inbound: HTTPS port 443 từ 0.0.0.0/0
     - Outbound: All traffic (cần để gọi OpenAI, Google, Let's Encrypt)
   - **Storage**: 30GB gp3 (rẻ hơn gp2, performance tốt hơn)

2. **Allocate Elastic IP** (IP tĩnh, không đổi khi restart EC2):
   - EC2 → Elastic IPs → Allocate Elastic IP address → Allocate
   - Actions → Associate Elastic IP → chọn instance `glowmax-api`
   - Elastic IP miễn phí khi đang được associate vào running instance

3. **Update Cloudflare DNS** (Bước 2 đã setup):
   - DNS A record `api` → giá trị Elastic IP vừa có

---

## Bước 5 — EC2 Bootstrap (1 giờ)

SSH vào instance lần đầu:
```bash
chmod 400 ~/Downloads/glowmax-key.pem
ssh -i ~/Downloads/glowmax-key.pem ec2-user@<ELASTIC_IP>
```

Chạy các lệnh sau (copy-paste từng block):

```bash
# 1. Update OS + cài Docker
sudo dnf update -y
sudo dnf install -y docker git

# 2. Start Docker daemon + enable auto-start
sudo systemctl enable --now docker

# 3. Add ec2-user vào group docker (không cần sudo khi chạy docker)
sudo usermod -aG docker ec2-user
# → Log out rồi SSH lại để group change có hiệu lực: exit → ssh lại

# 4. Cài Docker Compose v2
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-aarch64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
docker compose version   # verify: Docker Compose version v2.x.x

# 5. Cài AWS CLI (để backup-db.sh upload S3)
sudo dnf install -y awscli
aws --version            # verify

# 6. Clone repo
sudo mkdir -p /opt/glowmax
sudo chown ec2-user:ec2-user /opt/glowmax
cd /opt/glowmax
git clone https://github.com/<YOUR_GITHUB_USERNAME>/glowmax.git .

# 7. Setup env vars
cd /opt/glowmax/infra
cp .env.prod.example .env.prod
chmod 600 .env.prod
nano .env.prod           # điền tất cả secrets thật
```

---

## Bước 6 — Database Hardening

Sau khi Postgres container start lần đầu, tạo app user least-privilege (Spring Boot KHÔNG dùng superuser `postgres`):

```bash
# Connect vào Postgres container
docker exec -it glowmax-postgres psql -U postgres

-- Trong psql:
-- 1. Tạo app user (không có DDL permission)
CREATE USER glowmax_app WITH PASSWORD '<DB_APP_PASSWORD từ .env.prod>';

-- 2. Grant chỉ DML (SELECT/INSERT/UPDATE/DELETE)
GRANT CONNECT ON DATABASE glowmax TO glowmax_app;
\c glowmax
GRANT USAGE ON SCHEMA public TO glowmax_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO glowmax_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO glowmax_app;

-- 3. Default privileges cho tables tạo sau (Flyway migrations)
ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO glowmax_app;

-- 4. Verify
\du   -- xem danh sách users và permissions

-- 5. Thoát
\q
```

Sau đó update `.env.prod`: đảm bảo Spring Boot dùng `glowmax_app`, không phải `postgres`.

---

## Bước 7 — First Deploy

```bash
cd /opt/glowmax/infra

# Pull image từ GitHub Container Registry
docker compose -f docker-compose.prod.yml pull

# Start all services (background)
docker compose -f docker-compose.prod.yml up -d

# Theo dõi logs (Ctrl+C để dừng theo dõi, container vẫn chạy)
docker compose -f docker-compose.prod.yml logs -f

# Verify health
curl https://api.glowmax.codes/actuator/health
# → {"status":"UP"}
```

Kiểm tra từng service:
```bash
docker compose -f docker-compose.prod.yml ps      # tất cả status "Up"
docker logs glowmax-caddy                         # Caddy logs + cert issue
docker logs glowmax-api                           # Spring Boot startup logs
docker logs glowmax-postgres                      # Postgres ready logs
```

---

## Bước 8 — Security Hardening (30 phút, 1 lần)

```bash
# fail2ban — ban IP brute-force SSH (mặc định: 5 lần fail trong 10 phút → ban 10 phút)
sudo dnf install -y fail2ban
sudo systemctl enable --now fail2ban
sudo fail2ban-client status sshd   # verify

# Auto security updates (chạy hàng ngày, chỉ security patches)
sudo dnf install -y dnf-automatic
# Edit config: chỉ download + install security updates tự động
sudo sed -i 's/apply_updates = no/apply_updates = yes/' /etc/dnf/automatic.conf
sudo sed -i 's/upgrade_type = default/upgrade_type = security/' /etc/dnf/automatic.conf
sudo systemctl enable --now dnf-automatic.timer

# Verify: xem timer chạy
systemctl list-timers dnf-*
```

---

## Bước 9 — Backup Setup

```bash
# Cài permissions cho script
chmod +x /opt/glowmax/infra/scripts/backup-db.sh

# Test chạy 1 lần (phải thấy "Done." không có error)
/opt/glowmax/infra/scripts/backup-db.sh

# Verify file đã lên S3
aws s3 ls s3://glowmax-backups/postgres/

# Setup cron (chạy mỗi ngày 3 giờ sáng)
crontab -e
# Thêm dòng sau:
# 0 3 * * * /opt/glowmax/infra/scripts/backup-db.sh >> /var/log/glowmax-backup.log 2>&1

# BẮT BUỘC: Test restore ít nhất 1 lần (backup tốt = backup đã test restore thành công)
# --- Test restore vào DB tạm ---
# LATEST=$(aws s3 ls s3://glowmax-backups/postgres/ | sort | tail -1 | awk '{print $4}')
# aws s3 cp "s3://glowmax-backups/postgres/${LATEST}" - | gunzip | docker exec -i glowmax-postgres psql -U postgres glowmax_restore_test
```

---

## Bước 10 — Monitoring (5 phút, free)

**UptimeRobot** (free tier, monitor mỗi 5 phút, alert email/Discord khi down):

1. Tạo account tại [uptimerobot.com](https://uptimerobot.com)
2. Add Monitor → HTTP(s)
   - URL: `https://api.glowmax.codes/actuator/health`
   - Check interval: 5 minutes
   - Alert contacts: email của bạn
3. Tạo thêm Status Page (public link để check uptime history)

---

## Update app (khi có code mới)

GitHub Actions (Bước 3 CI/CD) sẽ tự động. Nếu cần deploy thủ công:

```bash
cd /opt/glowmax/infra

# Pull image mới nhất từ ghcr.io
docker compose -f docker-compose.prod.yml pull api

# Restart chỉ api container (postgres + caddy không cần restart)
docker compose -f docker-compose.prod.yml up -d api

# Flyway migration chạy tự động khi Spring Boot start
# Theo dõi:
docker logs -f glowmax-api
```

---

## Troubleshooting

### Caddy không issue được cert

```bash
docker logs glowmax-caddy | grep -i "error\|cert\|acme"
```
Nguyên nhân thường gặp:
- DNS chưa propagate (Cloudflare A record chưa trỏ đúng Elastic IP)
- Port 80/443 chưa mở trong Security Group
- Domain chưa trỏ về đúng IP → `dig api.glowmax.codes` để check

### Spring Boot không connect được Postgres

```bash
docker logs glowmax-api | grep -i "connection\|hikari\|postgres"
```
- Kiểm tra `.env.prod`: DB_SUPERUSER_PASSWORD đúng chưa
- `docker exec glowmax-postgres pg_isready` → should print "accepting connections"

### App crash / 500 errors

```bash
docker logs glowmax-api --tail 100   # xem 100 dòng cuối
docker logs glowmax-api --since 1h   # logs 1 giờ gần nhất
```

### Hết disk space

```bash
df -h /                              # check disk usage
docker system prune -f               # xóa images/containers cũ
docker system df                     # xem Docker dùng bao nhiêu disk
```

### Rotate JWT Secret (force logout tất cả users)

```bash
nano /opt/glowmax/infra/.env.prod
# Đổi APP_JWT_SECRET thành giá trị mới

docker compose -f docker-compose.prod.yml up -d api
# Tất cả access token cũ invalid ngay. Users phải login lại.
# (OK vì token TTL 15 phút — impact nhỏ)
```
