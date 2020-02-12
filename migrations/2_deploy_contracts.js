const loadEnv = require('../src/loadEnv');
const ExpandVault = artifacts.require('./ExpandVault');

loadEnv();

module.exports = (deployer, network, accounts) => {
  deployer.deploy(ExpandVault, process.env.EXPAND_ADDRESS, process.env.XPN_ADDRESS, { from: process.env.VAULT_OWNER_ADDRESS });
};
