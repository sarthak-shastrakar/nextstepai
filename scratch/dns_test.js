const dns = require('dns');

const hostname = 'nextstep.irshjam.mongodb.net';

console.log(`Attempting to resolve SRV record for ${hostname}...`);

dns.resolveSrv(`_mongodb._tcp.${hostname}`, (err, addresses) => {
  if (err) {
    console.error('SRV Resolution failed:', err);
    
    console.log('Attempting standard A record resolution...');
    dns.resolve4(hostname, (err2, addresses2) => {
        if (err2) {
            console.error('A record resolution failed:', err2);
        } else {
            console.log('A records found:', addresses2);
        }
    });
  } else {
    console.log('SRV Records found:', addresses);
  }
});
