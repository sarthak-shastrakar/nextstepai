
const dns = require('dns');
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const host = 'nextstep.irshjam.mongodb.net';

console.log(`Checking TXT record for: ${host}`);

dns.resolveTxt(host, (err, records) => {
  if (err) {
    console.error('Error resolving TXT record:', err);
    return;
  }
  console.log('TXT Records:', records);
});
