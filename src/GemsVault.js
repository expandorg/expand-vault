const contract = require('truffle-contract');
const Big = require('bignumber.js');
const vaultArtifacts = require('../build/contracts/GemsVault.json');

const statusError = new Error('Transaction rejected');
statusError.name = 'StatusError';

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
  constructor(provider, from, watcher) {
    validateAddress(from, 'from');
    this.provider = provider;
    this.from = from;
    this.watcher = watcher;
  }

  init() {
    const vaultContract = contract(vaultArtifacts);
    vaultContract.setProvider(this.provider);
    vaultContract.defaults({
      gas: process.env.GAS_LIMIT,
      from: this.from,
      gasPrice: process.env.GAS_PRICE,
    });

    return new Promise((rslv, rjct) => {
        vaultContract.at(process.env.VAULT_ADDRESS)
          .then((vault) => {
            this.vault = vault;
            rslv();
          })
          .catch((err) => {
            rjct(err);
          });
      });
  }

  async deposit(from, value) {
    validateAddress(from, 'from');
    validateValue(value);

    const { tx, receipt } = await this.vault.deposit(from, value);
    if (receipt.status === '0x00') {
      throw statusError;
    }

    const log = await this.watcher.scry(tx, 'Deposited');
    if (log.args.from.toLowerCase() !== from.toLowerCase()) {
      throw new Error(`Unexpected 'from' address: ${log.args.from}`);
    }
    if (!new Big(log.args.value).eq(value)) {
      throw new Error(`Unexpected value: ${log.args.value}`);
    }

    return [log];
  }

  async withdraw(to, value) {
    validateAddress(to, 'to');
    validateValue(value);

    const { tx, receipt } = await this.vault.withdraw(to, value);
    if (receipt.status === '0x00') {
      throw statusError;
    }

    const log = await this.watcher.scry(tx, 'Withdrew');
    if (log.args.to.toLowerCase() !== to.toLowerCase()) {
      throw new Error(`Unexpected 'to' address: ${log.args.to}`);
    }
    if (!new Big(log.args.value).eq(value)) {
      throw new Error(`Unexpected value: ${log.args.value}`);
    }

    return [log];
  }
}

module.exports = {
  GemsVault,
  events: vaultArtifacts.abi.filter((abi) => abi.type && abi.type === 'event'),
};
