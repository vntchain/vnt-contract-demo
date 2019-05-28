
import TX from 'ethereumjs-tx';
import Vnt from 'vnt';
import vntkit from 'vnt-kit';
import Config from './config';

var CHAINID = Config.chainId;
var contractAddress = Config.contractAddress;


class BetService {
  constructor(){
    console.log("constructor");
    if (typeof window.vnt !== 'undefined'){
      console.log("检测到钱包")
      this.vnt = window.vnt;
    }else{
      console.log("未检测到钱包")
      this.vnt = new Vnt();
      this.vnt.setProvider(new this.vnt.providers.HttpProvider(Config.providerUrl));
    }

    const abi = Config.abi;
    this.contract = this.vnt.core.contract(JSON.parse(abi));
    this.contractIns = this.contract.at(contractAddress);
  };
  isconnected = () => {
    return this.vnt.isConnected()
  };
  unlockAccount = (keystore, passwd) => {
    return vntkit.account.decrypt(keystore, passwd, false)
  };
  requestBalance = (address, cb) => {
    var vnt = this.vnt;
    vnt.core.getBalance(address,function(err, balance) {
      console.log("getBalance err",err);
      console.log("getBalance address",address,"balance",balance.toString());
      cb(err, vnt.fromWei(balance));
    })
  };
  requestAmount = (from, prikey, cb) => {
    var vnt = this.vnt;
    var contract = this.contract;
    var funcName = 'GetAmount';
    var data = contract.packFunctionData(funcName);
    
    var options =
        {from: from, to: contractAddress, data: data, chainId: CHAINID};
    vnt.core.call(options, function(err, res) {
      cb(err, vnt.fromWei(contract.unPackOutput(funcName, res)));
    });
  };
  requestNickName = (from, prikey, cb) => {
    var vnt = this.vnt;
    var contract = this.contract;
    var funcName = 'GetNickName';
    var data = contract.packFunctionData(funcName);
    var options =
        {from: from, to: contractAddress, data: data, chainId: CHAINID};
    vnt.core.call(options, function(err, res) {
      console.log("requestNickName",contract.unPackOutput(funcName, res));
      cb(err, contract.unPackOutput(funcName, res));
    });
  };
  getWinAndLose = (from, prikey, cb) => {
    var vnt = this.vnt;
    var contract = this.contract;
    var funcName = 'GetWinAndLose';
    var data = contract.packFunctionData(funcName);
    var options =
        {from: from, to: contractAddress, data: data, chainId: CHAINID};
    vnt.core.call(options, function(err, res) {
    cb(err, contract.unPackOutput(funcName, res));
    });
  };
  getPool = (cb) => {
    console.log("getPool")
    var vnt = this.vnt;
    var contract = this.contract;
    var funcName = 'GetPool';
    var data = contract.packFunctionData(funcName);
    var options = {to: contractAddress, data: data, chainId: CHAINID};
    vnt.core.call(options, function(err, res) {
      console.log("getPool res",res);
      cb(err, vnt.fromWei(contract.unPackOutput(funcName, res)));
    });
  };
  getTotalGameCount = (cb) => {
    console.log("getTotalGameCount")
    var vnt = this.vnt;
    var contract = this.contract;
    var funcName = 'GetTotalGameCount';
    var data = contract.packFunctionData(funcName);
    var options = {to: contractAddress, data: data, chainId: CHAINID};
    vnt.core.call(options, function(err, res) {
      console.log("getTotalGameCount res",res)
      cb(err, contract.unPackOutput(funcName, res));
    });
  };
  GetFreeChips = (from, prikey, cb) => {
    var vnt = this.vnt;
    var contract = this.contract;
    var funcName = 'GetFreeChips';
    var data = contract.packFunctionData(funcName);
    this.sendTransaction(data, 0, from, prikey, cb);
  };
  SetNickName = (name, from, prikey, cb) => {
    var vnt = this.vnt;
    var contract = this.contract;
    var funcName = 'SetNickName';
    var data = contract.packFunctionData(funcName, [name]);
    this.sendTransaction(data, 0, from, prikey, cb);
  };
  Deposit = (amount, from, prikey, cb) => {
    var vnt = this.vnt;
    var contract = this.contract;
    var funcName = '$Deposit';
    var data = contract.packFunctionData(funcName);
    this.sendTransaction(data, amount, from, prikey, cb);
  };
  Claim = (amount, from, prikey, cb) => {
    var vnt = this.vnt;
    var contract = this.contract;
    var funcName = 'Withdraw';
    var data = contract.packFunctionData(funcName, [vnt.toWei(amount)]);
    this.sendTransaction(data, 0, from, prikey, cb);
  };
  ClaimAll = (from, prikey, cb) => {
    var vnt = this.vnt;
    var contract = this.contract;
    var funcName = 'WithdrawAll';
    var data = contract.packFunctionData(funcName);
    this.sendTransaction(data, 0, from, prikey, cb);
  };
  requestBet = (amount, bigger, from, prikey, cb) => {
    var vnt = this.vnt;
    var contract = this.contract;
    var funcName = 'Bet';
    var data = contract.packFunctionData(funcName, [vnt.toWei(amount), bigger]);
    this.sendTransaction(data, 0, from, prikey, cb);
  };
  sendTransaction = (data, value, from, prikey, cb) => {
    var vnt = this.vnt;
    if (typeof window.vnt !== 'undefined'){
      this.vnt.core.sendTransaction(
        {
          from:from,
          to:contractAddress,
          gasPrice: 30000000000000,
          gasLimit: 4000000,
          data: data,
          value: vnt.toWei(value)
        },function(err,response){
          cb(err, response);
          if (err) {
            console.log('err happened: ', err)
            console.log('transaction hash: ', response);
          } else {
            console.log('transaction hash: ', response);
          }
        })
    }else{
      var contract = this.contract;
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
      }
  };
  watchEvent = (from, cb) => {
    // watch for an event with {some: 'args'}
    if (this.events) {
      this.events.stopWatching();
    }
    var contractIns = this.contractIns;
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
    var contractIns = this.contractIns;
    this.allevents =
        contractIns.allEvents({from: from}, {fromBlock: 0, toBlock: 'latest'});
    this.allevents.watch(function(error, result) {
      cb(error, result);
    });
  }
}



export default BetService;
