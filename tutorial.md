# VNT Dapp开发流程

## 开发工具

* [``Bottle``](https://github.com/vntchain/bottle)，vnt合约工具，用于合约编写的代码提示，代码编译，abi生成，压缩和解压。
* [``VNT Contract for vscode``](https://github.com/vntchain/vnt-contract-vscode)，合约代码提示的vscode插件。
* [``vnt.js``](https://github.com/vntchain/vnt.js)，JavaScript接口，用于提供常用的账户查询，转账，合约等相关操作。
* [``vnt-kit.js``](https://github.com/vntchain/vnt-kit.js)，JavaScript接口，用于提供钱包相关的基本操作。


## 合约编写

VNT合约使用c语言进行编写，同时吸纳了以太坊合约语言solidity的一些语法，使得拥有c语言基础和solidity基础的开发者能够很容易的开发出一个智能合约

```c
#include "vntlib.h"

typedef struct
{
  uint256 balance;     //存款
  string nickName;     //昵称
  bool freeAddress;    //是否已经领取过赠送的筹码
  uint64 winCount;     //赢的局数
  uint64 loseCount;    //输的局数
  uint64 chickenCount; //猜中50的局数
  uint256 winReward;   //赢的收益
  uint256 loseAmount;  //输的总额
} Account;
//账号余额
KEY mapping(address, Account) accounts;

//总局数
KEY uint64 totalGameCount;

//存款总额
KEY uint256 deposit;

// 10%
KEY uint256 fee = U256(10);

KEY address owner;

KEY uint256 freeAmount = U256(100000000000000000000); // 100*10**18;

EVENT EVENT_BET(indexed address from, string nickname, uint256 amount,
                int32 bigger, uint64 lottery, uint256 reward);
EVENT EVENT_WITHDRAW(indexed address from, string nickname, uint256 amount);
EVENT EVENT_DEPOSIT(indexed address from, string nickname, uint256 amount);
EVENT EVENT_NICKNAME(indexed address from, string nickName);
EVENT EVENT_GETFREEVNT(indexed address from, bool got);

constructor $Dice()
{
  owner = GetSender();
  totalGameCount = 0;
}

// getFee
uint256 getReward(uint256 amount)
{
  PrintUint256T("get amount in getreward:", amount);
  PrintUint256T("get fee1:", fee);
  uint256 res = U256SafeDiv(amount, fee);
  PrintUint256T("get fee2:", res);
  uint256 reward = U256SafeSub(amount, res);
  PrintUint256T("get reward:", reward);
  return reward;
}

//是否有足够的赌注
void checkAmount(uint256 amount)
{
  Require(U256_Cmp(amount, U256(0) == 1), "amount must > 0");
  address from = GetSender();
  accounts.key = from;
  uint256 balance = accounts.value.balance;
  PrintAddress("get sender:", from);
  PrintUint256T("get balance:", balance);
  Require(U256_Cmp(U256SafeSub(balance, amount), 0) != -1,
          "No enough money to bet");
}

//奖池是否足够
void checkPool(uint256 amount)
{
  uint256 contractBalance = GetBalanceFromAddress(GetContractAddress());
  PrintAddress("get contract address:", GetContractAddress());
  PrintUint256T("get contract balance:", contractBalance);
  PrintUint256T("get deposit balance:", deposit);
  uint256 reward = getReward(amount);
  Require(
      U256_Cmp(U256SafeSub(contractBalance,
                           U256SafeAdd(deposit, U256SafeMul(reward, U256(10)))),
               0) != -1,
      "No enough money in prize pool");
}

void checkOwner()
{
  address sender = GetSender();
  Require(Equal(sender, owner) == true, "Only the owner can operate");
}

uint64 random()
{
  uint64 time = GetTimestamp();
  PrintUint64T("get time", time);
  string time_sha3 = SHA3(SHA3(SHA3(FromU64(time))));
  PrintStr("get time sha3", time_sha3);
  uint64 index = time % 63 + 2;
  PrintStr("get index", index);
  uint64 gas = GetGas() % 64 + 2;
  PrintStr("get gas", gas);
  uint64 random_a = (uint64)time_sha3[index];
  PrintUint64T("get random_a", random_a);
  uint64 random_b = (uint64)time_sha3[index + 1];
  PrintUint64T("get random_b", random_b);
  uint64 random_c = random_a * random_b * gas % 101;
  PrintUint64T("get result", random_c);
  return random_c;
}

UNMUTABLE
uint64 testRandom() { return random(); }

//-1:<50,0:=50,1:>50
MUTABLE
void Bet(uint256 amount, int32 bigger)
{
  PrintUint256T("get amount:", amount);
  checkAmount(amount);
  checkPool(amount);
  address sender = GetSender();
  uint64 res = random();
  totalGameCount += 1;
  if (res > 50 && bigger == 1)
  {
    // you win
    accounts.key = sender;
    uint256 reward = getReward(amount);
    accounts.value.balance = U256SafeAdd(accounts.value.balance, reward);
    accounts.value.winReward = U256SafeAdd(accounts.value.winReward, reward);
    deposit = U256SafeAdd(deposit, reward);
    accounts.value.winCount += 1;
    EVENT_BET(sender, accounts.value.nickName, amount, bigger, res, reward);
  }
  else if (res < 50 && bigger == -1)
  {
    // you win
    accounts.key = sender;
    uint256 reward = getReward(amount);
    accounts.value.balance = U256SafeAdd(accounts.value.balance, reward);
    accounts.value.winReward = U256SafeAdd(accounts.value.winReward, reward);
    deposit = U256SafeAdd(deposit, reward);
    accounts.value.winCount += 1;
    EVENT_BET(sender, accounts.value.nickName, amount, bigger, res, reward);
  }
  else if (res == 50 && bigger == 0)
  {
    // you are the luckist man
    accounts.key = sender;
    uint256 reward = getReward(amount);
    reward = U256SafeMul(reward, U256(100));
    accounts.value.balance = U256SafeAdd(accounts.value.balance, reward);
    accounts.value.winReward = U256SafeAdd(accounts.value.winReward, reward);
    deposit = U256SafeAdd(deposit, reward);
    accounts.value.chickenCount += 1;
    EVENT_BET(sender, accounts.value.nickName, amount, bigger, res, reward);
  }
  else
  {
    // you lose
    accounts.key = sender;
    accounts.value.balance = U256SafeSub(accounts.value.balance, amount);
    accounts.value.loseAmount = U256SafeAdd(accounts.value.loseAmount, amount);
    deposit = U256SafeSub(deposit, amount);
    accounts.value.loseCount += 1;
    EVENT_BET(sender, accounts.value.nickName, amount, bigger, res, U256(0));
  }
}

//提款
MUTABLE
void Withdraw(uint256 amount)
{
  checkAmount(amount);
  address from = GetSender();
  if (TransferFromContract(from, amount) == true)
  {

    accounts.key = from;
    accounts.value.balance = U256SafeSub(accounts.value.balance, amount);
    deposit = U256SafeSub(deposit, amount);
    EVENT_WITHDRAW(from, accounts.value.nickName, amount);
  }
}

//提取全部
MUTABLE
void WithdrawAll()
{
  accounts.key = GetSender();
  uint256 amount = accounts.value.balance;
  Withdraw(amount);
}

//提取奖池，only owner
MUTABLE
void WithdrawPool(uint256 amount)
{
  checkOwner();
  checkPool(amount);
  TransferFromContract(GetSender(), amount);
}

//提取奖池
MUTABLE
void WithdrawPoolAll()
{
  uint256 amount = GetBalanceFromAddress(GetContractAddress());
  WithdrawPool(amount);
}

//扩充奖池
MUTABLE
void $DepositPool() {}

//存款
MUTABLE
void $Deposit()
{
  uint256 amount = GetValue();
  address from = GetSender();
  accounts.key = from;
  accounts.value.balance = U256SafeAdd(accounts.value.balance, amount);
  deposit = U256SafeAdd(deposit, amount);
  EVENT_DEPOSIT(from, accounts.value.balance, amount);
}

//免费筹获取100VNT的筹码,每个账号可以获取一次
MUTABLE
void GetFreeChips()
{
  address from = GetSender();
  accounts.key = from;
  bool flag = accounts.value.freeAddress;
  Require(flag == false, "you have got before");
  accounts.value.balance = U256SafeAdd(accounts.value.balance, freeAmount);
  deposit = U256SafeAdd(deposit, freeAmount);
  accounts.value.freeAddress = true;
  EVENT_GETFREEVNT(from, true);
}

MUTABLE
void SetNickName(string name)
{
  address from = GetSender();
  accounts.key = from;
  accounts.value.nickName = name;
  EVENT_NICKNAME(from, name);
}

UNMUTABLE
string GetNickNameFromAddress(address addr)
{
  accounts.key = addr;
  return accounts.value.nickName;
}

UNMUTABLE
string GetNickName() { return GetNickNameFromAddress(GetSender()); }

UNMUTABLE
address GetOwner() { return owner; }

UNMUTABLE
uint256 GetAmountFromAddress(address addr)
{
  accounts.key = addr;
  return accounts.value.balance;
}

UNMUTABLE
uint256 GetAmount() { return GetAmountFromAddress(GetSender()); }

UNMUTABLE
string GetWinAndLose()
{
  accounts.key = GetSender();
  uint64 win = accounts.value.winCount;
  uint64 lose = accounts.value.loseCount;
  uint64 chicken = accounts.value.chickenCount;
  return Concat(
      Concat(Concat(Concat(FromU64(win), "-"), FromU64(chicken)), "-"),
      FromU64(lose));
}

UNMUTABLE
uint256 GetPool()
{
  uint256 amount = GetBalanceFromAddress(GetContractAddress());
  return U256SafeSub(amount, deposit);
}

UNMUTABLE
uint64 GetTotalGameCount() { return totalGameCount; }

$_() { $Deposit(); }

```

上面的代码是一个猜数字的智能合约例子，里面包含了随机数的生成，链上数据的存储和读取，event事件，合约转账等关键操作，更详细的语法参考[文档](https://github.com/vntchain/vnt-documentation/blob/master/smart-contract/write-contract.md)

## 合约编译

合约编译需要使用``bottle``,编译完后会生成abi文件和xxx.compress文件，abi文件用于和合约的交互，compress文件是压缩后的合约字节码，用于合约的部署

## 合约部署

合约部署之前需要先对账号进行解锁，解锁需要使用keystore文件和解锁密码，解锁后得到账号的私钥，通过私钥可以对交易进行签名，签名后的交易才能够发送到链上


```js
import vntkit from 'vnt-kit';
var unlockAccount = (keystore, passwd) => {
    return vntkit.account.decrypt(keystore, passwd, false)
};
```

部署合约需要用到compress文件和abi文件

```js
import Account from 'ethereumjs-account';
import TX from 'ethereumjs-tx';
import Vnt from 'vnt';
import vntkit from 'vnt-kit';

var vnt = new Vnt();
vnt.setProvider(new vnt.providers.HttpProvider(Config.providerUrl));

var codeFile =
    '../output/$Dice.compress';
var abiFile =
    '../output/abi.json';
var wasmabi = fs.readFileSync(abiFile);
var abi = JSON.parse(wasmabi.toString('utf-8'));


function deployWasmContract() {
  var contract = vnt.core.contract(abi).codeFile(codeFile);
  var deployContract = contract.packContructorData(
      {
        data: contract.code,  
        gas: 4000000,
        value: vnt.toWei(100000000, 'vnt'),
      });
  var nonce = vnt.core.getTransactionCount(from);
  var options = {
    nonce: nonce,
    to: vnt.toHex(""),
    gasPrice: vnt.toHex(30000000000000),
    gasLimit: vnt.toHex(4000000),
    data: deployContract,
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
          if (err) {
            console.log('err happened: ', err)
            console.log('transaction hash: ', txHash);
          } else {
            console.log('transaction hash: ', txHash);
            var receipt = vnt.core.getTransactionReceipt("txHash")
            var contractAddress = receipt.contractAddress
          }
  });
}
```

合约部署成功后会获得合约的``address``，address代表合约的唯一入口，记下这个address，之后所有和合约相关的操作都会用到它

## 执行合约

执行合约需要使用abi文件和合约的address,以上面例子中调用bet方法和GetNickName为例
执行合约之前需要先对账号进行解锁，解锁参考部署合约里的代码

Bet
```js
var requestBet = (amount, bigger, from, prikey, cb) => {
    var funcName = 'Bet';
    var data = contract.packFunctionData(funcName, [vnt.toWei(amount), bigger]);
    sendTransaction(data, 0, from, prikey, cb);
  };
var sendTransaction = (data, value, from, prikey, cb) => {
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
```

GetNickName
```js
var requestNickName = (from, prikey, cb) => {
    var funcName = 'GetNickName';
    var data = contract.packFunctionData(funcName);
    var options =
        {from: from, to: contractAddress, data: data, chainId: CHAINID};
    vnt.core.call(options, function(err, res) {
      cb(err, contract.unPackOutput(funcName, res));
    });
  };
```
## 最后

以上这些，是完成一个vnt智能合约必要的步骤，对于Dapp开发，除了写出一个有创意，实用，有趣的智能合约外，还会涉及到dapp前端的展示，数据的交互，对于一些更复杂的Dapp，还需要在服务器端记录一些有用的信息。