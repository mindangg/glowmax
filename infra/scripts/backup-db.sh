#!/usr/bin/env bash
# =============================================================================
# backup-db.sh — Backup Postgres → gzip → S3
# =============================================================================
# Chạy tự động qua cron mỗi đêm 3 giờ sáng:
#   crontab -e
#   0 3 * * * /opt/glowmax/infra/scripts/backup-db.sh >> /var/log/glowmax-backup.log 2>&1
#
# Chạy thủ công để test:
#   chmod +x /opt/glowmax/infra/scripts/backup-db.sh
#   /opt/glowmax/infra/scripts/backup-db.sh
#
# TODO trước khi dùng:
#   1. Đổi S3_BUCKET bên dưới thành bucket name thật
#   2. Đảm bảo AWS CLI được cài: aws --version
#   3. EC2 instance phải có IAM role cho phép s3:PutObject vào bucket
#      (hoặc set AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY trong environment)
#   4. Tạo bucket S3 riêng cho backup: glowmax-backups (khác bucket avatar)
#      Bật versioning + lifecycle: xóa object sau 30 ngày
# =============================================================================

set -euo pipefail   # Dừng ngay nếu lệnh nào fail (-e), unbound var (-u), pipe fail (-o pipefail)

# --- Config ---
# TODO: đổi thành bucket name thật
S3_BUCKET="glowmax-backups"
S3_PREFIX="postgres"

DB_CONTAINER="glowmax-postgres"
DB_USER="postgres"
DB_NAME="glowmax"

TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILENAME="${DB_NAME}_${TIMESTAMP}.sql.gz"
S3_KEY="${S3_PREFIX}/${BACKUP_FILENAME}"

# --- TODO: uncomment region nếu cần override ---
# AWS_DEFAULT_REGION="ap-southeast-1"
# export AWS_DEFAULT_REGION

echo "[$(date)] Starting backup: ${BACKUP_FILENAME}"

# --- Backup flow ---
# pg_dump → gzip → stream thẳng lên S3 (không lưu file trung gian trên disk)
# `--no-password` vì kết nối qua Docker socket (trust auth trong container)
docker exec "${DB_CONTAINER}" \
    pg_dump -U "${DB_USER}" -Fp --no-password "${DB_NAME}" \
    | gzip \
    | aws s3 cp - "s3://${S3_BUCKET}/${S3_KEY}" \
        --storage-class STANDARD_IA  # Infrequent Access: rẻ hơn 40% cho backup ít đọc

echo "[$(date)] Backup uploaded: s3://${S3_BUCKET}/${S3_KEY}"

# --- TODO: xóa backup cũ hơn N ngày (optional — S3 Lifecycle rule làm việc này tốt hơn) ---
# Cách 1 (AWS Console): S3 → bucket → Management → Lifecycle rules → Expiration 30 days
# Cách 2 (script, không khuyến khích vì scan tốn tiền list requests):
# aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" \
#     | awk '{print $4}' \
#     | while read key; do
#         # parse date từ filename, xóa nếu > 30 ngày
#         echo "TODO: delete old backup logic"
#     done

echo "[$(date)] Done."
