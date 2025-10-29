# AWS Deployment Instructions

## 🚀 Quick Start - Deploy AI Server to AWS EC2

### Bước 1: Tạo EC2 Instance

1. **Launch EC2 Instance trên AWS Console:**
   - AMI: **Ubuntu 22.04 LTS**
   - Instance Type: **t3.micro** (free tier) hoặc **t3.small**
   - Security Group: Mở các port:
     - **22** (SSH)
     - **80** (HTTP) 
     - **443** (HTTPS)
   - Key Pair: Tạo hoặc chọn key pair có sẵn

2. **Connect to EC2:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   ```

### Bước 2: Upload và Deploy

1. **Upload files lên EC2:**
   ```bash
   # Sử dụng SCP để upload thư mục ai-server
   scp -i your-key.pem -r ai-server/ ubuntu@your-ec2-public-ip:/home/ubuntu/
   
   # Hoặc clone từ Git repository
   git clone https://github.com/your-username/your-repo.git
   cd your-repo/ai-server
   ```

2. **Chạy script deploy tự động:**
   ```bash
   # SSH vào EC2
   ssh -i your-key.pem ubuntu@your-ec2-public-ip
   
   # Di chuyển vào thư mục ai-server
   cd ai-server
   
   # Chạy script deploy
   chmod +x quick-deploy-aws.sh
   ./quick-deploy-aws.sh
   ```

3. **Kiểm tra deployment:**
   ```bash
   # Test API
   curl http://localhost:5000/health
   curl http://your-ec2-public-ip/health
   ```

### Bước 3: Cấu hình Frontend

1. **Tạo file .env trong frontend:**
   ```bash
   # frontend/.env
   VITE_AI_SERVER_URL=http://your-ec2-public-ip
   ```

2. **Rebuild frontend:**
   ```bash
   cd frontend
   npm run build
   npm run dev
   ```

### Bước 4: Test Chatbot

1. Truy cập ứng dụng tại `http://localhost:5173`
2. Click vào icon chatbot ở góc dưới bên phải
3. Test với các câu hỏi:
   - "xin chào"
   - "giúp"
   - "hộ khẩu"
   - "nhân khẩu"

---

## 🔧 Alternative: Docker Deployment

Nếu muốn sử dụng Docker:

```bash
# Trên EC2
cd ai-server
docker-compose up -d

# Kiểm tra
docker-compose ps
docker-compose logs -f ai-agent-server
```

---

## 📊 Monitoring

### Xem logs:
```bash
# Application logs
sudo journalctl -u ai-agent-server -f

# Docker logs
docker-compose logs -f ai-agent-server

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Restart services:
```bash
# Restart AI server
sudo systemctl restart ai-agent-server

# Restart Docker
docker-compose restart

# Restart Nginx
sudo systemctl restart nginx
```

---

## 🔒 Security & SSL (Optional)

### Cài đặt SSL Certificate:

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Get SSL certificate:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Auto-renewal:**
   ```bash
   sudo crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

---

## 🚨 Troubleshooting

### Common Issues:

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

4. **CORS errors:**
   - Kiểm tra Nginx config có CORS headers
   - Đảm bảo frontend URL đúng

### Health Check:
```bash
# Test endpoints
curl http://your-server/health
curl -X POST http://your-server/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "hello"}'
```

---

## 📝 Environment Variables

### AI Server (.env):
```bash
PORT=5000
DEBUG=False
# OPENAI_API_KEY=your_key_here  # Optional
```

### Frontend (.env):
```bash
VITE_AI_SERVER_URL=http://your-ec2-public-ip
VITE_API_URL=http://localhost:8080
```

---

## 💰 Cost Optimization

- **t3.micro**: Free tier eligible
- **t3.small**: ~$15/month
- **Data transfer**: Minimal cost
- **Storage**: EBS gp3 ~$8/month for 20GB

---

## 🔄 Updates

### Update application:
```bash
# Pull latest changes
git pull origin main

# Restart service
sudo systemctl restart ai-agent-server

# Or with Docker
docker-compose pull
docker-compose up -d
```

### Backup:
```bash
# Backup application
tar -czf ai-agent-backup-$(date +%Y%m%d).tar.gz /opt/ai-agent-server
```


