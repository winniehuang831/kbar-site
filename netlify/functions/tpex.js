const https = require('https');

exports.handler = async function(event) {
  const { symbol, startDate, endDate } = event.queryStringParameters || {};
  if (!symbol || !startDate) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing params' }) };
  }

  const url = `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=${symbol}&start_date=${startDate}&end_date=${endDate || startDate}`;

  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: data,
        });
      });
    }).on('error', (e) => {
      resolve({ statusCode: 500, body: JSON.stringify({ error: e.message }) });
    });
  });
};
