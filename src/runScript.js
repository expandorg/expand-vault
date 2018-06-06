const Web3 = require('web3');
const provider = require('../src/provider');
const GemsVault = require('../src/GemsVault');

const web3 = new Web3(provider);
const ownerAddress = process.env.VAULT_OWNER_ADDRESS;

async function runScript(script) {
  const vault = new GemsVault(web3.currentProvider, ownerAddress);
  await vault.init();
  await script(vault, ownerAddress, web3);
  vault.close();
}

module.exports = runScript;
