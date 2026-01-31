// Cloudflare Worker для отправки уведомлений в Telegram
// Инструкция по установке в README-telegram.md

const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; // Замени на токен от @BotFather
const TELEGRAM_CHAT_ID = 'YOUR_CHAT_ID_HERE';     // Замени на свой Chat ID

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Разрешаем CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Обработка preflight запроса
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    });
  }

  try {
    const data = await request.json();
    
    // Получаем информацию о посетителе
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ip = request.headers.get('cf-connecting-ip') || 'Unknown';
    const country = request.headers.get('cf-ipcountry') || 'Unknown';
    const timestamp = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });
    
    // Определяем устройство
    let device = '💻 Desktop';
    if (/mobile/i.test(userAgent)) device = '📱 Mobile';
    if (/tablet/i.test(userAgent)) device = '📱 Tablet';
    
    // Формируем сообщение
    const message = `
🔔 <b>Новый посетитель на сайте!</b>

⏰ Время: ${timestamp}
🌍 Страна: ${country}
${device}
🌐 IP: ${ip}
📊 User Agent: ${userAgent.substring(0, 100)}...
    `.trim();

    // Отправляем в Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const telegramResponse = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!telegramResponse.ok) {
      throw new Error('Telegram API error');
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
