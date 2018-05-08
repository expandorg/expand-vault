const contract = require('truffle-contract');
const vaultArtifacts = require('../build/contracts/GemsVault.json');

function validateAddress(address, name) {
  if (address.length !== 42 || address.slice(0, 2) !== '0x') {
    throw new Error(`Invalid '${name}' address`);
  }
}

function validateValue(value) {
  if (value <= 0) {
    throw new Error('Value <= 0');
  }
}

class GemsVault {
  constructor(provider, from) {
    validateAddress(from, 'from');
    this.provider = provider;
    this.from = from;
  }

  async init() {
    const vaultContract = contract(vaultArtifacts);
    vaultContract.setProvider(this.provider);
    vaultContract.defaults({
      gas: process.env.GAS_LIMIT,
      from: this.from,
      gasPrice: process.env.GAS_PRICE,
    });
    this.vault = await vaultContract.at(process.env.VAULT_ADDRESS);
  }

  async deposit(from, value) {
    validateAddress(from, 'from');
    validateValue(value);

    const { logs } = await this.vault.deposit(from, value);

    if (logs.length !== 1) {
      throw new Error(`Unexpected event logs: ${logs.toString()}`);
    }
    const log = logs[0];
    if (log.event !== 'Deposited') {
      throw new Error(`Unexpected event log: ${log.toString()}`);
    }
    if (log.args.from !== from) {
      throw new Error(`Unexpected 'from' address: ${log.args.from}`);
    }
    if (!log.args.value.equals(value)) {
      throw new Error(`Unexpected value: ${log.args.value}`);
    }

    return logs;
  }

  async withdraw(to, value) {
    validateAddress(to, 'to');
    validateValue(value);

    const { logs } = await this.vault.withdraw(to, value);

    if (logs.length !== 1) {
      throw new Error(`Unexpected event logs: ${logs.toString()}`);
    }
    const log = logs[0];
    if (log.event !== 'Withdrew') {
      throw new Error(`Unexpected event log: ${log.toString()}`);
    }
    if (log.args.to !== to) {
      throw new Error(`Unexpected 'to' address: ${log.args.to}`);
    }
    if (!log.args.value.equals(value)) {
      throw new Error(`Unexpected value: ${log.args.value}`);
    }

    return logs;
  }
}

module.exports = GemsVault;
