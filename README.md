# Expand Vault

Contains the ExpandVault contract and convenience wrappers for executing views and transactions.

## Environments

There are three possible environments, each with their own `.env` file and set using `NODE_ENV`. For example:

```
NODE_ENV=ropsten npm run migrate --network ropsten
```

```
NODE_ENV=ropsten node scripts/foobar.js
```

```
NODE_ENV=production npm run migrate --network live
```

```
NODE_ENV=production node scripts/foobar.js
```

## Running Scripts

Add scripts to the `scripts/` directory, using `scripts/template.js` as a guide:

```javascript
const runScript = require('../src/runScript');

runScript(async (vault, ownerAddress, web3) => {
  // Script here
})
  .then(() => console.log('done'))
  .catch(err => console.error(err));
```

The `vault` instance that's passed to your script has the following `async` methods derived from the contract:

### Views

View methods return the relevant values.

```
addressOfUser(userId)
addressOfJob(jobId)

balanceOfUser(userId)
balanceOfJob(jobId)
```

### Transactions

Transactions return logged events on success, and throw errors on failure.

```
setUserAddress(userId, address)
setJobAddress(userId, address)

depositToUser(userId, value)
depositToJob(jobId, value)

withdrawUserDeposit(userId, value)
withdrawJobDeposit(jobId, value)

payoutFromJob(jobId, userId, value)

reclaimFromUser(userId, value)
reclaimFromJob(jobId, value)
```
