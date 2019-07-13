var fs = require('fs'); 
var Vnt = require('vnt');
var vntkit = require('vnt-kit');
var TX = require('ethereumjs-tx');
var vnt = new Vnt();


var privider = 'http://47.102.157.204:8880';
// var privider = 'http://127.0.0.1:8880';
var chainid = 2;

vnt.setProvider(new vnt.providers.HttpProvider(privider));


var from1 = '0x122369f04f32269598789998de33e3d56e2c507a';
var from1Keystore = 'replace';
var pass1 = '';
var from2 = '0x3dcf0b3787c31b2bdf62d5bc9128a79c2bb18829';
var pass2 = '';
var toAddr = '0x3ea7a559e44e8cabc362ca28b6211611467c76f3';

// vnt.personal.unlockAccount(from1, pass1);
// vnt.personal.unlockAccount(from2, pass2);



var codeFile =
    '../output/$Dice.compress';
var abiFile =
    '../output/$Dice.abi';
var wasmabi = fs.readFileSync(abiFile);
var abi = JSON.parse(wasmabi.toString('utf-8'));

function deployWasmContractWithPrivateKey() {
  var contract = vnt.core.contract(abi).codeFile(codeFile);
  var deployContract = contract.packContructorData();

  var account = vntkit.account.decrypt(from1Keystore, pass1, false);
  var nonce = vnt.core.getTransactionCount(account.address);
  var options = {
    nonce: nonce,
    gasPrice: vnt.toHex(vnt.toWei(18, 'Gwei')),
    gasLimit: vnt.toHex(4000000),
    data: deployContract,
    value: vnt.toHex(vnt.toWei(100, 'vnt')),
    chainId: chainid
  };
  var tx = new TX(options);
  tx.sign(new Buffer(
    account.privateKey.substring(
          2,
          ),
      'hex'));
  var serializedTx = tx.serialize();
  vnt.core.sendRawTransaction(
    '0x' + serializedTx.toString('hex'), function(err, txHash) {
      if (err) {
        console.log('err happened: ', err)
        console.log('transaction hash: ', txHash);
      } else {
        console.log('transaction hash: ', txHash);
      }
    });
}

function getTransactionReceipt(tx, cb) {
  var receipt = vnt.core.getTransactionReceipt(tx);
  if (!receipt) {
    setTimeout(function() {
      getTransactionReceipt(tx, cb)
    }, 1000);
  } else {
    cb(receipt)
  }
}

function GetPool() {
  var contract = vnt.core.contract(abi).at(contractAddress);
  r = contract.GetPool.call();
  console.log('result', r.toString());
}

function Deposit() {
  var contract = vnt.core.contract(abi).at(contractAddress);
  var amount = contract.GetAmount.call({from: from2})
  console.log('amount', amount.toString());
}


function Bet() {
  var contract = vnt.core.contract(abi).at(contractAddress);
  var r = contract.Bet.sendTransaction(vnt.toWei(10, 'vnt'), 1, {
    from: from2,
    gas: 4000000,
  });
  console.log('bet', r);
}

function TestRandom() {
  var contract = vnt.core.contract(abi).at(contractAddress);
  var r = contract.testRandom.call({from: from1});
  console.log('random', r.toString());
}


deployWasmContractWithPrivateKey();

// var contractAddress = '0x5c876269742f06ccb998d39c4c3b6546d35b5dfb';
// GetPool();
// Deposit();
// Bet();
// TestRandom();
