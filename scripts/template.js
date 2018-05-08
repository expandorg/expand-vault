const runScript = require('../src/runScript');

runScript(async (vault, ownerAddress, web3) => {
  // Script here
})
  .then(() => console.log('done'))
  .catch(err => console.error(err));
