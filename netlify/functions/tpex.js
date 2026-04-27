const https = require('https');
const http = require('http');

function fetchUrl(url, options, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 5) return reject(new Error('Too many redirects'));
    const lib = url.startsWith('https') ? https : http;
    lib.get(url, options, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location, options, redirectCount + 1)
          .then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

exports.handler = async function(event) {
  const { rocYM, symbol } = event.queryStringParameters || {};
  if (!rocYM || !symbol) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing params' }) };
  }

  const url = `https://www.tpex.org.tw/web/stock/aftertrading/daily_trading_info/st43_result.php?l=zh-tw&d=${encodeURIComponent(rocYM)}&stkno=${symbol}&_=${Date.now()}`;

  try {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.tpex.org.tw/web/stock/aftertrading/daily_trading_info/st43.php?l=zh-tw',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'zh-TW,zh;q=0.9',
        'X-Requested-With': 'XMLHttpRequest',
      }
    };

    const result = await fetchUrl(url, options);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: result.body || JSON.stringify({ error: 'empty', httpStatus: result.status }),
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message, url }) };
  }
};
