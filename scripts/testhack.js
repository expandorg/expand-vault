const runScript = require('../src/runScript');
const BigNumber = require('bignumber.js');

runScript(async (vault, ownerAddress, web3) => {
  // Script here

  const requester = '0x08947BF8995c9E286E5Fbbb01ccf5D298fDcdA60';
  BigNumber.config({DECIMAL_PLACES: 18});
  const amt = new BigNumber(1000000);
	console.log(amt.toFixed(18));
  const log = await vault.depositXpn(ownerAddress, amt.multipliedBy(1e18).toFixed(18));
  console.log(log);
})
  .then(() => console.log('done'))
  .catch(err => console.error(err));
