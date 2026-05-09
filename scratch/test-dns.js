
const dns = require('dns');
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const srvRecord = '_mongodb._tcp.nextstep.irshjam.mongodb.net';

console.log(`Checking SRV record for: ${srvRecord}`);

dns.resolveSrv(srvRecord, (err, addresses) => {
  if (err) {
    console.error('Error resolving SRV record:', err);
    return;
  }
  console.log('SRV Addresses:', addresses);
  
  addresses.forEach(addr => {
    dns.lookup(addr.name, (err, address, family) => {
      if (err) {
        console.error(`Error looking up ${addr.name}:`, err);
      } else {
        console.log(`Resolved ${addr.name} to ${address}`);
      }
    });
  });
});
