# AWS Deployment Guide for AI Agent Server

## Phương pháp 1: EC2 Instance (Recommended)

### Bước 1: Tạo EC2 Instance

1. **Launch EC2 Instance:**
   - AMI: Ubuntu 22.04 LTS
   - Instance Type: t3.micro (free tier) hoặc t3.small
   - Security Group: Mở port 22 (SSH), 80 (HTTP), 443 (HTTPS)
   - Key Pair: Tạo hoặc chọn key pair có sẵn

2. **Connect to EC2:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

### Bước 2: Deploy Application

1. **Upload files to EC2:**
   ```bash
   # Sử dụng SCP để upload
   scp -i your-key.pem -r ai-server/ ubuntu@your-ec2-public-ip:/home/ubuntu/
   
   # Hoặc clone từ Git
   git clone your-repo-url
   cd ai-server
   ```

2. **Run deployment script:**
   ```bash
   chmod +x deploy-aws.sh
   ./deploy-aws.sh
   ```

3. **Verify deployment:**
   ```bash
   # Check service status
   sudo systemctl status ai-agent-server
   
   # Test API
   curl http://localhost:5000/health
   curl http://your-ec2-public-ip/health
   ```

### Bước 3: Configure Domain (Optional)

1. **Point domain to EC2:**
   - A record: `ai.yourdomain.com` → EC2 Public IP

2. **Update Nginx config:**
   ```bash
   sudo nano /etc/nginx/sites-available/ai-agent-server
   # Change server_name to your domain
   ```

---

## Phương pháp 2: Docker trên EC2

### Bước 1: Deploy with Docker

1. **Run Docker Compose:**
   ```bash
   cd ai-server
   docker-compose up -d
   ```

2. **Check containers:**
   ```bash
   docker-compose ps
   docker-compose logs -f ai-agent-server
   ```

---

## Phương pháp 3: AWS ECS (Advanced)

### Bước 1: Push to ECR

1. **Create ECR repository:**
   ```bash
   aws ecr create-repository --repository-name ai-agent-server
   ```

2. **Build and push:**
   ```bash
   # Get login token
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
   
   # Build and tag
   docker build -t ai-agent-server .
   docker tag ai-agent-server:latest your-account.dkr.ecr.us-east-1.amazonaws.com/ai-agent-server:latest
   
   # Push
   docker push your-account.dkr.ecr.us-east-1.amazonaws.com/ai-agent-server:latest
   ```

### Bước 2: Create ECS Service

1. **Create ECS Cluster**
2. **Create Task Definition**
3. **Create Service with Load Balancer**

---

## Cấu hình Frontend

### Cập nhật API URL trong Frontend

1. **Environment Variables:**
   ```bash
   # frontend/.env
   VITE_AI_SERVER_URL=http://your-ec2-public-ip
   # hoặc
   VITE_AI_SERVER_URL=https://ai.yourdomain.com
   ```

2. **Update Chatbot component:**
   ```typescript
   // frontend/src/components/chatbot/Chatbot.tsx
   const apiUrl = import.meta.env.VITE_AI_SERVER_URL || 'http://localhost:5000';
   ```

---

## Monitoring và Maintenance

### Logs
```bash
# View application logs
sudo journalctl -u ai-agent-server -f

# View Docker logs
docker-compose logs -f ai-agent-server
```

### Updates
```bash
# Update application
git pull origin main
sudo systemctl restart ai-agent-server

# Update Docker
docker-compose pull
docker-compose up -d
```

### Backup
```bash
# Backup application files
tar -czf ai-agent-backup-$(date +%Y%m%d).tar.gz /opt/ai-agent-server
```

---

## Security Best Practices

1. **SSL Certificate:**
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get SSL certificate
   sudo certbot --nginx -d ai.yourdomain.com
   ```

2. **Firewall:**
   ```bash
   sudo ufw status
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

3. **Regular Updates:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

---

## Troubleshooting

### Common Issues

1. **Service won't start:**
   ```bash
   sudo journalctl -u ai-agent-server -n 50
   ```

2. **Port already in use:**
   ```bash
   sudo netstat -tlnp | grep :5000
   sudo lsof -i :5000
   ```

3. **Permission denied:**
   ```bash
   sudo chown -R $USER:$USER /opt/ai-agent-server
   ```

4. **Nginx 502 Bad Gateway:**
   ```bash
   sudo systemctl status ai-agent-server
   sudo nginx -t
   ```

### Health Check
```bash
# Test API endpoints
curl http://your-server/health
curl -X POST http://your-server/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```


