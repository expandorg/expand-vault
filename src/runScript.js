const Web3 = require('web3');
const Watcher = require('@xlnt/scry-one').default;
const tokenEvents = require('expand-token').events;
const provider = require('../src/provider');
const { ExpandVault, events } = require('../src/ExpandVault');

const web3 = new Web3(provider);
const ownerAddress = process.env.VAULT_OWNER_ADDRESS;
const watcher = new Watcher(
  process.env.WEB3_PROVIDER,
  events.concat(tokenEvents),
  1,
  500,
);

async function runScript(script) {
  const vault = new ExpandVault(web3.currentProvider, ownerAddress);
  await vault.init();
  await script(vault, ownerAddress, web3, watcher);
  watcher.stop();
}

module.exports = runScript;
