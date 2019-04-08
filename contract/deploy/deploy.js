var fs = require('fs'); 
var Vnt = require('vnt');
var vnt = new Vnt();
vnt.setProvider(new vnt.providers.HttpProvider('http://localhost:8880'));

var from1 = '0x122369f04f32269598789998de33e3d56e2c507a';
var pass1 = '';
var from2 = '0x3dcf0b3787c31b2bdf62d5bc9128a79c2bb18829';
var pass2 = '';
var toAddr = '0x3ea7a559e44e8cabc362ca28b6211611467c76f3';

vnt.personal.unlockAccount(from1, pass1);
// vnt.personal.unlockAccount(from2, pass2);



var codeFile =
    '../output/$Dice.compress';
var abiFile =
    '../contract/output/abi.json';
var wasmabi = fs.readFileSync(abiFile);
var abi = JSON.parse(wasmabi.toString('utf-8'));


function deployWasmContract() {
  var contract = vnt.core.contract(abi).codeFile(codeFile);
  var contractReturned = contract.new(
      {
        from: from1,  
        data: contract.code,  
        gas: 4000000,
        value: vnt.toWei(100000000, 'vnt'),
      },
      function(err, myContract) {
        console.log(err, myContract);
        if (!err) {
          if (!myContract.address) {
            console.log('transactionHash: ', myContract.transactionHash)
            getTransactionReceipt(
                myContract.transactionHash, function(receipt) {
                  console.log('receipt: ', receipt)
                })
          } else {
            console.log('contract address: ', myContract.address)
          }
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
  var r = contract.Bet.sendTransaction(vnt.toWei(10, 'vnt'), true, {
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


deployWasmContract();

var contractAddress = '0x5c876269742f06ccb998d39c4c3b6546d35b5dfb';
// GetPool();
// Deposit();
// Bet();
// TestRandom();