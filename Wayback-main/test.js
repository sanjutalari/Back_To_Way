const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5001,
  path: '/api/items/my-items',
  method: 'GET',
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('RESPONSE:', res.statusCode, data));
});
req.on('error', e => console.error(e));
req.end();
