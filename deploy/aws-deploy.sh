#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# Snip URL Shortener — AWS EC2 Deployment Script
# Usage: ./deploy/aws-deploy.sh
# Prerequisites: AWS CLI configured, key pair available
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ── Configuration ─────────────────────────────────────────────────────────────
AWS_REGION="${AWS_REGION:-us-east-1}"
INSTANCE_TYPE="${INSTANCE_TYPE:-t3.small}"
AMI_ID="${AMI_ID:-}"          # leave empty to auto-resolve Amazon Linux 2023
KEY_NAME="${KEY_NAME:?KEY_NAME env var is required}"
APP_DIR="/home/ec2-user/snip"
SG_NAME="snip-sg"

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  Snip — AWS EC2 Deployment"
echo "  Region:  $AWS_REGION"
echo "  Type:    $INSTANCE_TYPE"
echo "  Key:     $KEY_NAME"
echo "═══════════════════════════════════════════════════════"
echo ""

# ── Step 1: Resolve latest Amazon Linux 2023 AMI ──────────────────────────────
if [[ -z "$AMI_ID" ]]; then
  echo "[1/7] Resolving latest Amazon Linux 2023 AMI…"
  AMI_ID=$(aws ec2 describe-images \
    --region "$AWS_REGION" \
    --owners amazon \
    --filters \
      "Name=name,Values=al2023-ami-*-x86_64" \
      "Name=state,Values=available" \
    --query "sort_by(Images, &CreationDate)[-1].ImageId" \
    --output text)
  echo "      AMI: $AMI_ID"
fi

# ── Step 2: Create Security Group ─────────────────────────────────────────────
echo "[2/7] Creating security group '$SG_NAME'…"
SG_ID=$(aws ec2 create-security-group \
  --region "$AWS_REGION" \
  --group-name "$SG_NAME" \
  --description "Snip URL Shortener security group" \
  --query 'GroupId' --output text 2>/dev/null || \
  aws ec2 describe-security-groups \
    --region "$AWS_REGION" \
    --filters "Name=group-name,Values=$SG_NAME" \
    --query 'SecurityGroups[0].GroupId' --output text)

# Allow SSH, HTTP, HTTPS
for PORT in 22 80 443; do
  aws ec2 authorize-security-group-ingress \
    --region "$AWS_REGION" \
    --group-id "$SG_ID" \
    --protocol tcp --port "$PORT" --cidr 0.0.0.0/0 2>/dev/null || true
done
echo "      Security group: $SG_ID"

# ── Step 3: Write user-data bootstrap script ──────────────────────────────────
echo "[3/7] Preparing user-data bootstrap…"
USER_DATA=$(cat <<'USERDATA'
#!/bin/bash
set -e

# Update system
dnf update -y

# Install Docker and rsync
dnf install -y docker git rsync
systemctl enable --now docker
usermod -aG docker ec2-user

# Install Docker Compose plugin
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

echo "Bootstrap complete."
USERDATA
)

# ── Step 4: Launch EC2 instance ───────────────────────────────────────────────
echo "[4/7] Launching EC2 instance…"
INSTANCE_ID=$(aws ec2 run-instances \
  --region "$AWS_REGION" \
  --image-id "$AMI_ID" \
  --instance-type "$INSTANCE_TYPE" \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SG_ID" \
  --user-data "$USER_DATA" \
  --block-device-mappings '[{"DeviceName":"/dev/xvda","Ebs":{"VolumeSize":20,"VolumeType":"gp3"}}]' \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=snip-server}]' \
  --query 'Instances[0].InstanceId' \
  --output text)
echo "      Instance ID: $INSTANCE_ID"

# ── Step 5: Wait for public IP ────────────────────────────────────────────────
echo "[5/7] Waiting for instance to be running…"
aws ec2 wait instance-running --region "$AWS_REGION" --instance-ids "$INSTANCE_ID"
PUBLIC_IP=$(aws ec2 describe-instances \
  --region "$AWS_REGION" \
  --instance-ids "$INSTANCE_ID" \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text)
echo "      Public IP: $PUBLIC_IP"
echo ""

# ── Step 6: Wait for SSH availability ────────────────────────────────────────
echo "[6/7] Waiting for SSH (up to 3 min)…"
for i in $(seq 1 36); do
  if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 -i "${KEY_NAME}.pem" \
      "ec2-user@$PUBLIC_IP" echo "SSH OK" 2>/dev/null; then
    break
  fi
  echo "      Attempt $i/36 — retrying in 5s…"
  sleep 5
done

# ── Step 7: Deploy application ───────────────────────────────────────────────
echo "[7/7] Uploading local codebase using rsync…"
ssh -o StrictHostKeyChecking=no -i "${KEY_NAME}.pem" "ec2-user@$PUBLIC_IP" "mkdir -p $APP_DIR"
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude 'dist' -e "ssh -o StrictHostKeyChecking=no -i ${KEY_NAME}.pem" ./ ec2-user@$PUBLIC_IP:$APP_DIR/

echo "Starting application on EC2…"
ssh -o StrictHostKeyChecking=no -i "${KEY_NAME}.pem" "ec2-user@$PUBLIC_IP" bash <<DEPLOY
set -e
cd "$APP_DIR"

# Copy env files if they don't exist
[ ! -f backend/.env ] && cp backend/.env.example backend/.env
echo "⚠  Edit $APP_DIR/backend/.env with your secrets before starting!"

# Pull images and start
docker compose -f docker-compose.prod.yml pull 2>/dev/null || true
docker compose -f docker-compose.prod.yml up --build -d
docker compose -f docker-compose.prod.yml ps
DEPLOY

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  ✅  Deployment complete!"
echo ""
echo "  App URL:    http://$PUBLIC_IP"
echo "  SSH:        ssh -i ${KEY_NAME}.pem ec2-user@$PUBLIC_IP"
echo ""
echo "  IMPORTANT: Edit /home/ec2-user/snip/backend/.env"
echo "  with your real secrets, then restart:"
echo "    docker compose -f docker-compose.prod.yml restart"
echo "═══════════════════════════════════════════════════════"
