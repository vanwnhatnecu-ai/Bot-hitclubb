const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Thay thế bằng token bot của bạn
const TELEGRAM_BOT_TOKEN = '7477068251:AAFG8LjEbubhAMEX9Ueu4piksxc1w_qQkvw';
const API_URL = 'https://hitclub-chat-gpt-binn-new.onrender.com/api/buhudiditmemay';

// Khởi tạo bot
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// Lưu trữ trạng thái bot và dữ liệu
let botStatus = {};
let lastData = null;
let autoUpdateInterval = null;

// Hàm gọi API để lấy dữ liệu
async function fetchData() {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi gọi API:', error.message);
        return null;
    }
}

// Hàm định dạng thời gian
function formatTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// Hàm tạo nội dung tin nhắn
function createMessage(data) {
    return `
♣️ BOT - DỰ ĐOÁN CHÍNH XÁC ♣️ 
🧮 Phiên : ${data.phien || 'N/A'}
🎲 Xúc Xắc : ${data.xuc_xac || 'N/A'}
📚 Tổng : ${data.tong || 'N/A'} | Kết Quả : ${data.ket_qua || 'N/A'}
══════════════════════════
🧩 Phiên Tiếp Theo : ${data.phien_tiep_theo || 'N/A'}
🎯 Dự Đoán : ${data.du_doan || 'N/A'} | 🚦( ${data.do_tin_cay || 'N/A'}%) 
💰 Khuyến Nghị Đặt : ${data.du_doan || 'N/A'}

⏱️ Thời Gian : ${formatTime()}
══════════════════════════
💎 CÔNG NGHỆ AI PHÂN TÍCH TÀI XỈU 2026 💎
    `;
}

// Hàm gửi tin nhắn tự động
async function sendAutoUpdate(chatId) {
    try {
        const data = await fetchData();
        if (data && JSON.stringify(data) !== JSON.stringify(lastData)) {
            lastData = data;
            const message = createMessage(data);
            await bot.sendMessage(chatId, message);
            console.log(`Đã gửi cập nhật tự động cho chat ${chatId}`);
        }
    } catch (error) {
        console.error('Lỗi khi gửi tin nhắn tự động:', error.message);
    }
}

// Xử lý lệnh /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🤖 CHÀO MỪNG ĐẾN VỚI BOT DỰ ĐOÁN TÀI XỈU 🤖

Tôi là bot phân tích và dự đoán kết quả tài xỉu sử dụng công nghệ AI tiên tiến.

📋 CÁC LỆNH CÓ SẴN:
/start - Hiển thị thông tin giới thiệu
/chaybot - Bắt đầu chạy bot dự đoán tự động

🔮 Tính năng:
• Dự đoán chính xác kết quả tài xỉu
• Phân tích AI thông minh
• Cập nhật tự động khi có dữ liệu mới
• Hoạt động 24/7

💎 CÔNG NGHỆ AI PHÂN TÍCH TÀI XỈU 2026 💎
    `;
    
    bot.sendMessage(chatId, welcomeMessage);
});

// Xử lý lệnh /chaybot
bot.onText(/\/chaybot/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
        // Lấy dữ liệu từ API
        const data = await fetchData();
        
        if (!data) {
            await bot.sendMessage(chatId, '❌ Không thể kết nối đến API. Vui lòng thử lại sau.');
            return;
        }
        
        lastData = data;
        
        // Gửi tin nhắn đầu tiên
        const message = createMessage(data);
        await bot.sendMessage(chatId, message);
        
        // Thông báo bot đã bắt đầu
        await bot.sendMessage(chatId, '✅ Bot đã bắt đầu chạy tự động! Sẽ cập nhật khi có dữ liệu mới.');
        
        // Dừng interval cũ nếu có
        if (autoUpdateInterval) {
            clearInterval(autoUpdateInterval);
        }
        
        // Bắt đầu cập nhật tự động mỗi 10 giây
        autoUpdateInterval = setInterval(() => {
            sendAutoUpdate(chatId);
        }, 10000);
        
        // Lưu trạng thái
        botStatus[chatId] = {
            running: true,
            lastUpdate: new Date()
        };
        
    } catch (error) {
        console.error('Lỗi khi chạy bot:', error);
        await bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi khởi động bot. Vui lòng thử lại.');
    }
});

// Xử lý lỗi
bot.on('polling_error', (error) => {
    console.error('Lỗi polling:', error);
});

bot.on('error', (error) => {
    console.error('Lỗi bot:', error);
});

// Xử lý khi bot dừng
process.on('SIGINT', () => {
    console.log('Đang dừng bot...');
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
    }
    bot.stopPolling();
    process.exit();
});

process.on('SIGTERM', () => {
    console.log('Đang dừng bot...');
    if (autoUpdateInterval) {
        clearInterval(autoUpdateInterval);
    }
    bot.stopPolling();
    process.exit();
});

console.log('🤖 Bot Telegram đã khởi động thành công!');
console.log('📡 Đang lắng nghe lệnh...');
