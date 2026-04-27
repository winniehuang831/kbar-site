const https = require('https');

exports.handler = async function(event) {
  const { rocYM, symbol } = event.queryStringParameters || {};
  if (!rocYM || !symbol) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing params' }) };
  }

  // 使用舊版備用網址 wwwov.tpex.org.tw（新版改版後舊版 API 移到這裡）
  const url = `https://wwwov.tpex.org.tw/web/stock/aftertrading/daily_trading_info/st43_result.php?l=zh-tw&d=${encodeURIComponent(rocYM)}&stkno=${symbol}&_=1`;

  return new Promise((resolve) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://wwwov.tpex.org.tw/',
        'Accept': 'application/json, text/javascript, */*',
        'X-Requested-With': 'XMLHttpRequest',
      }
    };

    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: data || JSON.stringify({ error: 'empty response' }),
        });
      });
    }).on('error', (e) => {
      resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }) });
    });
  });
};
