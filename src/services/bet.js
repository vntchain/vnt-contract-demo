import Account from 'ethereumjs-account';
import TX from 'ethereumjs-tx';
import Vnt from 'vnt';
import vntkit from 'vnt-kit';
import Config from './config';


var CHAINID = Config.chainId;
var contractAddress = Config.contractAddress;
var vnt = new Vnt();
vnt.setProvider(new vnt.providers.HttpProvider(Config.providerUrl));
const abi = Config.abi;
var contract = vnt.core.contract(JSON.parse(abi));
var contractIns = contract.at(contractAddress);

class BetService {
  isconnected = () => {
    return vnt.isConnected()
  };
  unlockAccount = (keystore, passwd) => {
    return vntkit.account.decrypt(keystore, passwd, false)
  };
  requestBalance = (address, cb) => {
    vnt.core.getBalance(address, function(err, balance) {
      cb(err, vnt.fromWei(balance));
    })
  };
  requestAmount = (from, prikey, cb) => {
    var funcName = 'GetAmount';
    var data = contract.packFunctionData(funcName);
    var options =
        {from: from, to: contractAddress, data: data, chainId: CHAINID};
    vnt.core.call(options, function(err, res) {
      cb(err, vnt.fromWei(contract.unPackOutput(funcName, res)));
    });
  };
  requestNickName = (from, prikey, cb) => {
    var funcName = 'GetNickName';
    var data = contract.packFunctionData(funcName);
    var options =
        {from: from, to: contractAddress, data: data, chainId: CHAINID};
    vnt.core.call(options, function(err, res) {
      cb(err, contract.unPackOutput(funcName, res));
    });
  };
  getWinAndLose = (from, prikey, cb) => {
    var funcName = 'GetWinAndLose';
    var data = contract.packFunctionData(funcName);
    var options =
        {from: from, to: contractAddress, data: data, chainId: CHAINID};
    vnt.core.call(options, function(err, res) {
      cb(err, contract.unPackOutput(funcName, res));
    });
  };
  getPool = (cb) => {
    var funcName = 'GetPool';
    var data = contract.packFunctionData(funcName);
    var options = {to: contractAddress, data: data, chainId: CHAINID};
    vnt.core.call(options, function(err, res) {
      cb(err, vnt.fromWei(contract.unPackOutput(funcName, res)));
    });
  };
  getTotalGameCount = (cb) => {
    var funcName = 'GetTotalGameCount';
    var data = contract.packFunctionData(funcName);
    var options = {to: contractAddress, data: data, chainId: CHAINID};
    vnt.core.call(options, function(err, res) {
      cb(err, contract.unPackOutput(funcName, res));
    });
  };
  GetFreeChips = (from, prikey, cb) => {
    var funcName = 'GetFreeChips';
    var data = contract.packFunctionData(funcName);
    this.sendTransaction(data, 0, from, prikey, cb);
  };
  SetNickName = (name, from, prikey, cb) => {
    var funcName = 'SetNickName';
    var data = contract.packFunctionData(funcName, [name]);
    this.sendTransaction(data, 0, from, prikey, cb);
  };
  Deposit = (amount, from, prikey, cb) => {
    var funcName = '$Deposit';
    var data = contract.packFunctionData(funcName);
    this.sendTransaction(data, amount, from, prikey, cb);
  };
  Claim = (amount, from, prikey, cb) => {
    var funcName = 'Withdraw';
    var data = contract.packFunctionData(funcName, [vnt.toWei(amount)]);
    this.sendTransaction(data, 0, from, prikey, cb);
  };
  ClaimAll = (from, prikey, cb) => {
    var funcName = 'WithdrawAll';
    var data = contract.packFunctionData(funcName);
    this.sendTransaction(data, 0, from, prikey, cb);
  };
  requestBet = (amount, bigger, from, prikey, cb) => {
    var funcName = 'Bet';
    var data = contract.packFunctionData(funcName, [vnt.toWei(amount), bigger]);
    this.sendTransaction(data, 0, from, prikey, cb);
  };
  sendTransaction = (data, value, from, prikey, cb) => {
    var nonce = vnt.core.getTransactionCount(from);
    var options = {
      nonce: nonce,
      to: contractAddress,
      gasPrice: vnt.toHex(30000000000000),
      gasLimit: vnt.toHex(4000000),
      data: data,
      value: vnt.toHex(vnt.toWei(value)),
      chainId: CHAINID
    };
    var tx = new TX(options);
    tx.sign(new Buffer(
        prikey.substring(
            2,
            ),
        'hex'));
    var serializedTx = tx.serialize();
    vnt.core.sendRawTransaction(
        '0x' + serializedTx.toString('hex'), function(err, txHash) {
          cb(err, txHash);
          if (err) {
            console.log('err happened: ', err)
            console.log('transaction hash: ', txHash);
          } else {
            console.log('transaction hash: ', txHash);
          }
        });
  };
  watchEvent = (from, cb) => {
    // watch for an event with {some: 'args'}
    if (this.events) {
      this.events.stopWatching();
    }
    this.events =
        contractIns.allEvents({from: from}, {fromBlock: 0, toBlock: 'latest'});
    this.events.watch(function(error, result) {
      if (!error) {
        if (result.args.from.toUpperCase() === from.toUpperCase()) {
          cb(error, result);
          console.log(error, result);
        }
      }
    });
  };
  watchAllEvent = (from, cb) => {
    // watch for an event with {some: 'args'}
    if (this.allevents) {
      this.allevents.stopWatching()
    }
    this.allevents =
        contractIns.allEvents({from: from}, {fromBlock: 0, toBlock: 'latest'});
    this.allevents.watch(function(error, result) {
      cb(error, result);
    });
  }
}



export default new BetService();
