const loadEnv = require('../src/loadEnv');
const GemsVault = artifacts.require('./GemsVault');

loadEnv();

module.exports = (deployer, network, accounts) => {
  deployer.deploy(GemsVault, process.env.GEMS_ADDRESS, { from: process.env.VAULT_OWNER_ADDRESS });
};
