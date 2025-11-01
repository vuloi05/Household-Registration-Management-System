# AWS Deployment Script for AI Agent Server
# Chạy script này trên EC2 instance

#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting AWS Deployment for AI Agent Server${NC}"

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
echo -e "${YELLOW}🐍 Installing Python 3.11...${NC}"
sudo apt install -y software-properties-common
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip

# Install Docker (optional - for containerized deployment)
echo -e "${YELLOW}🐳 Installing Docker...${NC}"
sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
sudo usermod -aG docker $USER

# Install Docker Compose
echo -e "${YELLOW}🔧 Installing Docker Compose...${NC}"
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx (for reverse proxy)
echo -e "${YELLOW}🌐 Installing Nginx...${NC}"
sudo apt install -y nginx

# Install PM2 for process management
echo -e "${YELLOW}⚡ Installing PM2...${NC}"
sudo npm install -g pm2

# Create application directory
echo -e "${YELLOW}📁 Creating application directory...${NC}"
sudo mkdir -p /opt/ai-agent-server
sudo chown $USER:$USER /opt/ai-agent-server
cd /opt/ai-agent-server

# Copy application files (assuming files are uploaded via SCP or Git)
echo -e "${YELLOW}📋 Setting up application files...${NC}"
# Note: You need to upload your ai-server files here first

# Create virtual environment
echo -e "${YELLOW}🔧 Creating Python virtual environment...${NC}"
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Create systemd service
echo -e "${YELLOW}⚙️ Creating systemd service...${NC}"
sudo tee /etc/systemd/system/ai-agent-server.service > /dev/null <<EOF
[Unit]
Description=AI Agent Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/ai-agent-server
Environment=PATH=/opt/ai-agent-server/venv/bin
ExecStart=/opt/ai-agent-server/venv/bin/python main.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Configure Nginx
echo -e "${YELLOW}🌐 Configuring Nginx...${NC}"
sudo tee /etc/nginx/sites-available/ai-agent-server > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/ai-agent-server /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable ai-agent-server
sudo systemctl start ai-agent-server
sudo systemctl enable nginx
sudo systemctl restart nginx

# Configure firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Check status
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${YELLOW}📊 Service Status:${NC}"
sudo systemctl status ai-agent-server --no-pager
sudo systemctl status nginx --no-pager

echo -e "${GREEN}🌐 AI Agent Server is running at: http://$(curl -s ifconfig.me)${NC}"
echo -e "${YELLOW}📝 To view logs: sudo journalctl -u ai-agent-server -f${NC}"
echo -e "${YELLOW}🔄 To restart: sudo systemctl restart ai-agent-server${NC}"


