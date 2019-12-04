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
  constructor(provider, from) {
    validateAddress(from, 'from');
    this.provider = provider;
    this.from = from;
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

  async deposit(from, value, options) {
    validateAddress(from, 'from');
    validateValue(value);

    const { tx, receipt } = await this.vault.deposit(from, value, options);
    if (receipt.status === '0x00') {
      throw statusError;
    }
    return {
      tx,
      expected: {
        name: 'Deposited',
        args: {
          from: from.toLowerCase(),
          value,
        },
      },
    };
  }

  async depositXpn(from, value, options) {
    validateAddress(from, 'from');
    validateValue(value);

    const { tx, receipt } = await this.vault.depositXpn(from, value, options);
    if (receipt.status === '0x00') {
      throw statusError;
    }
    return {
      tx,
      expected: {
        name: 'Deposited',
        args: {
          from: from.toLowerCase(),
          value,
        },
      },
    };
  }

  async withdraw(to, value, options) {
    validateAddress(to, 'to');
    validateValue(value);

    const { tx, receipt } = await this.vault.withdraw(to, value, options);
    if (receipt.status === '0x00') {
      throw statusError;
    }
    return {
      tx,
      expected: {
        name: 'Withdrew',
        args: {
          to: to.toLowerCase(),
          value,
        },
      },
    };
  }

  async reclaimToken(address, options) {
    validateAddress(address, 'token');

    const { tx, receipt } = await this.token.reclaimToken(address, options);
    if (receipt.status === '0x00') {
      throw statusError;
    }
    return {
      tx,
      expected: {
        name: 'Transfer',
        args: {
          from: process.env.GEMS_ADDRESS,
          to: process.env.VAULT_OWNER_ADDRESS,
        },
      },
    };
  }

}

module.exports = {
  GemsVault,
  events: vaultArtifacts.abi.filter((abi) => abi.type && abi.type === 'event'),
};
