#!/usr/bin/env node

/**
 * Script tự động lấy IP máy tính hoặc prompt từ terminal
 * Chạy trước khi start app để cấu hình LOCAL_IP
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const CONFIG_FILE = path.join(__dirname, '../src/config/ip-config.json');

// Hàm lấy IP tự động từ network interfaces
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  // Danh sách các virtual adapter cần loại bỏ
  const virtualAdapterKeywords = [
    'vEthernet',
    'VMware',
    'VirtualBox',
    'Hyper-V',
    'Default Switch',
    'WSL',
    'Docker',
    'NAT',
    'Loopback'
  ];

  // Kiểm tra xem adapter có phải virtual không
  const isVirtualAdapter = (name) => {
    const lowerName = name.toLowerCase();
    return virtualAdapterKeywords.some(keyword => 
      lowerName.includes(keyword.toLowerCase())
    );
  };

  // Kiểm tra xem adapter có phải Wi-Fi không
  const isWiFiAdapter = (name) => {
    const lowerName = name.toLowerCase();
    return lowerName.includes('wi-fi') || 
           lowerName.includes('wifi') || 
           lowerName.includes('wireless') ||
           lowerName.includes('wlan');
  };

  // Phân loại IP theo độ ưu tiên
  const wifiIPs = [];
  const ethernetIPs = [];
  const otherIPs = [];

  for (const name of Object.keys(interfaces)) {
    // Bỏ qua virtual adapters
    if (isVirtualAdapter(name)) {
      continue;
    }

    for (const iface of interfaces[name]) {
      // Chỉ lấy IPv4, không phải internal (127.0.0.1)
      if (iface.family === 'IPv4' && !iface.internal) {
        const ipInfo = {
          ip: iface.address,
          name: name
        };

        // Phân loại theo loại adapter
        if (isWiFiAdapter(name)) {
          wifiIPs.push(ipInfo);
        } else if (name.toLowerCase().includes('ethernet') && !isVirtualAdapter(name)) {
          ethernetIPs.push(ipInfo);
        } else {
          otherIPs.push(ipInfo);
        }
      }
    }
  }

  // Hàm tìm IP ưu tiên trong danh sách (192.168.x.x hoặc 10.0.x.x)
  const findPreferredIP = (ipList) => {
    return ipList.find(item => 
      item.ip.startsWith('192.168.') || 
      item.ip.startsWith('10.0.') || 
      item.ip.startsWith('172.16.')
    ) || ipList[0];
  };

  // Ưu tiên: Wi-Fi > Ethernet > Other
  // Trong mỗi loại, ưu tiên IP 192.168.x.x hoặc 10.0.x.x
  let selected = null;

  if (wifiIPs.length > 0) {
    selected = findPreferredIP(wifiIPs);
    console.log(`   📶 Tìm thấy Wi-Fi adapter: ${selected.name} (${selected.ip})`);
  } else if (ethernetIPs.length > 0) {
    selected = findPreferredIP(ethernetIPs);
    console.log(`   🔌 Tìm thấy Ethernet adapter: ${selected.name} (${selected.ip})`);
  } else if (otherIPs.length > 0) {
    selected = findPreferredIP(otherIPs);
    console.log(`   🌐 Tìm thấy adapter khác: ${selected.name} (${selected.ip})`);
  }

  return selected ? selected.ip : null;
}

// Hàm prompt IP từ terminal
function promptIP() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log('\n⚠️  Không thể tự động lấy IP máy tính.');
    console.log('📝 Vui lòng nhập IP máy tính của bạn:');
    console.log('   (Để lấy IP: chạy lệnh "ipconfig" trên Windows hoặc "ifconfig" trên Mac/Linux)');
    console.log('   (Nhấn Enter để sử dụng IP mặc định: 10.0.2.2 cho Android emulator)\n');
    
    rl.question('IP máy tính (hoặc Enter để dùng 10.0.2.2): ', (answer) => {
      rl.close();
      const ip = answer.trim() || '10.0.2.2';
      resolve(ip);
    });
  });
}

// Hàm lưu IP vào file config
function saveIPConfig(ip) {
  const config = {
    localIP: ip,
    lastUpdated: new Date().toISOString()
  };

  const configDir = path.dirname(CONFIG_FILE);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  console.log(`✅ Đã lưu IP: ${ip} vào ${CONFIG_FILE}`);
}

// Main function
async function main() {
  console.log('🔍 Đang tìm IP máy tính...\n');

  // Kiểm tra xem đã có file config chưa
  let existingIP = null;
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      existingIP = config?.localIP;
      if (existingIP) {
        console.log(`📋 Đã tìm thấy IP đã lưu: ${existingIP}`);
      }
    } catch (error) {
      // File bị lỗi, bỏ qua
    }
  }

  // Thử lấy IP tự động
  let ip = getLocalIP();

  if (ip) {
    console.log(`✅ Tự động tìm thấy IP: ${ip}`);
    // Nếu IP tự động khác với IP đã lưu, cập nhật
    if (existingIP && existingIP !== ip) {
      console.log(`   (IP mới khác với IP đã lưu, sẽ cập nhật...)`);
    } else if (!existingIP) {
      console.log('   (Đang lưu IP này vào file config...)');
    } else {
      console.log('   (IP không thay đổi, giữ nguyên)');
      return; // Không cần cập nhật
    }
  } else {
    // Nếu không lấy được IP tự động
    if (existingIP) {
      console.log(`⚠️  Không thể tự động lấy IP, sử dụng IP đã lưu: ${existingIP}`);
      console.log('   (Nếu IP này không đúng, hãy xóa file src/config/ip-config.json và chạy lại)\n');
      return; // Sử dụng IP đã lưu
    } else {
      // Không có IP tự động và không có file config -> prompt
      ip = await promptIP();
    }
  }

  saveIPConfig(ip);
}

// Chạy script
main().catch((error) => {
  console.error('❌ Lỗi khi setup IP:', error);
  process.exit(1);
});

