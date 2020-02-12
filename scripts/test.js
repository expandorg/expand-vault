const assert = require('assert');
const Big = require('bignumber.js');
const { ExpandToken } = require('expand-token');
const runScript = require('../src/runScript');

async function assertRevert(fn) {
  let err;
  try {
    await fn();
  } catch (e) {
    err = e;
  }
  assert(err.name === 'StatusError');
}

async function assertNoError(fn) {
  let err;
  try {
    await fn();
  } catch (e) {
    err = e;
  }
  assert(err === undefined);
}

runScript(async (vault, ownerAddress, web3, watcher) => {
  function forwardDay() {
    return new Promise((resolve, reject) => web3.currentProvider.sendAsync({
      jsonrpc: '2.0',
      method: 'evm_increaseTime',
      params: [86400],
      id: Date.now(),
    }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        web3.currentProvider.send({
          jsonrpc: '2.0',
          method: 'evm_mine',
          params: [],
          id: Date.now(),
        });
        resolve(result);
      }
    }));
  }

  const userAddress = web3.eth.accounts[2];
  const maxWithdrawal = 10000e+18;
  const depositValue = maxWithdrawal * 2;

  const expandOwnerToken = new ExpandToken(web3.currentProvider, process.env.EXPAND_OWNER_ADDRESS, watcher);
  await expandOwnerToken.init();

  const userToken = new ExpandToken(web3.currentProvider, userAddress, watcher);
  await userToken.init();

  await expandOwnerToken.transfer(userAddress, depositValue);

  // deposit should work
  await userToken.approve(process.env.VAULT_ADDRESS, depositValue);
  await assertNoError(() => vault.deposit(userAddress, depositValue));
  const depositBalance = await expandOwnerToken.balanceOf(userAddress);
  assert(depositBalance.eq(0));

  // first withdraw should work
  await assertNoError(() => vault.withdraw(userAddress, maxWithdrawal));
  const firstWithdrawBalance = await expandOwnerToken.balanceOf(userAddress);
  assert(firstWithdrawBalance.eq(maxWithdrawal));

  // second withdraw is over rate limit and should fail
  await assertRevert(() => vault.withdraw(userAddress, maxWithdrawal));

  // second withdraw should work after 24 hours
  await forwardDay();
  await assertNoError(() => vault.withdraw(userAddress, maxWithdrawal));
  const secondWithdrawBalance = await expandOwnerToken.balanceOf(userAddress);
  assert(secondWithdrawBalance.eq(depositValue));
})
  .then(() => console.log('done'))
  .catch(err => console.error(err));
