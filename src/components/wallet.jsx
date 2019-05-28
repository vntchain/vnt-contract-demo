
import React from 'react';
import { connect } from 'dva';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import DoneIcon from '@material-ui/icons/Done';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';

const styles = theme => ({
  textField: {

  },
  chip: {
    margin: theme.spacing.unit,
  },
  divider: {
    width: 1,
    height: 10,
  },
  margin: {
    margin: theme.spacing.unit * 2,
  },
});

class Wallet extends React.Component {
  state = {
    showPassword: false,
    password: "",
    keystore: "",
    nickname: "",
    depositamount: 0,
    claimamount: 0,
  };
  componentDidMount = () => {
    if (typeof window.vnt !== 'undefined'){
      this.unlockAccount();
    }
    this.refreshGlobal();
  };
  handleChange = prop => event => {
    // this.setState({ [prop]: event.target.value });
    this.props.dispatch({
      type: 'accountmodel/saveAccount',
      [prop]: event.target.value,
    });
  };
  handleState = prop => event => {
    this.setState({ [prop]: event.target.value });
  };
  unlockAccount = () => {
    var BetService = window.BetService;
    var account={
      address:"",
      privateKey:"",
    }
    if (typeof window.vnt === 'undefined'){
      account = BetService.unlockAccount(this.props.accountmodel.keystore, this.props.accountmodel.password);
    }else{
      account.address = window.vnt.core.coinbase;
    }

    if (account.address !== '') {
      this.props.dispatch({
        type: 'accountmodel/saveAccount',
        address: account.address.substring(2, 42),
        account: account,
      });
      var _this = this;
      this.refresh(account);
      BetService.watchEvent(account.address, function (err, result) {
        _this.refresh(account);
      });
      BetService.watchAllEvent(account.address, function (err, result) {
        _this.refreshGlobal();
        if (!err){
          _this.refreshHistory(result);
        }
      });
    }
  };
  refreshHistory = (res) => {
    var history = this.props.historymodel.history;
    if (history.length === 50){
      history.pop();
    }
    history.unshift(res);
    this.props.dispatch({
      type: 'historymodel/save',
      history: history,
    });
  };
  getFreeClips = () => {
    var BetService = window.BetService;
    var account = this.props.accountmodel.account;
    var _this = this;
    BetService.GetFreeChips(account.address, account.privateKey, function (err, amount) {
      _this.refresh(account);
    });
  };
  setNickName = () => {
    var BetService = window.BetService;
    var account = this.props.accountmodel.account;
    var _this = this;
    BetService.SetNickName(this.state.nickname, account.address, account.privateKey, function (err, amount) {
      _this.refresh(account);
    });
  };
  refresh = (account) => {
    var BetService = window.BetService;
    var _this = this;
    BetService.requestBalance(account.address, function (err, balance) {
      if (!err) {
        _this.props.dispatch({
          type: 'accountmodel/saveAccount',
          balance: balance.toString(),
        });
      }
    });
    BetService.requestAmount(account.address, account.privateKey, function (err, amount) {
      if (!err) {
        _this.props.dispatch({
          type: 'accountmodel/saveAccount',
          amount: amount.toString(),
        });
      }
    });
    BetService.requestNickName(account.address, account.privateKey, function (err, nickname) {
      if (!err) {
        _this.props.dispatch({
          type: 'accountmodel/saveAccount',
          nickname: nickname,
        });
      }
    });
    BetService.getWinAndLose(account.address, account.privateKey, function (err, winlose) {
      if (!err) {
        _this.props.dispatch({
          type: 'accountmodel/saveAccount',
          winAndLose: winlose,
        });
      }
    });
    this.refreshGlobal();
  };
  refreshGlobal = () => {
    var BetService = window.BetService;
    var _this = this;
    BetService.getPool( function (err, pool) {
      if (!err) {
        _this.props.dispatch({
          type: 'betmodel/save',
          pool: pool,
        });
      }
    });
    BetService.getTotalGameCount( function (err, totalCount) {
      if (!err) {
        _this.props.dispatch({
          type: 'betmodel/save',
          totalCount: totalCount,
        });
      }
    });
  };
  deposit = () => {
    var BetService = window.BetService;
    var amount = this.state.depositamount;
    var account = this.props.accountmodel.account;
    var _this = this;
    BetService.Deposit(amount, account.address, account.privateKey, function (err, amount) {
      _this.refresh(account);
    });
  };
  claim = () => {
    var BetService = window.BetService;
    var amount = this.state.claimamount;
    var account = this.props.accountmodel.account;
    var _this = this;
    BetService.Claim(amount, account.address, account.privateKey, function (err, amount) {
      _this.refresh(account);
    });
  };
  claimAll = () => {
    var BetService = window.BetService;
    var account = this.props.accountmodel.account;
    var _this = this;
    BetService.ClaimAll(account.address, account.privateKey, function (err, amount) {
      _this.refresh(account);
    });
  };
  handleClickShowPassword = () => {
    this.setState(state => ({ showPassword: !state.showPassword }));
  };
  render() {
    const { classes, accountmodel } = this.props;
    return (
      <div>
        {
          typeof window.vnt === 'undefined'?
          <TextField
            id="tf-keystore"
            label="Keystore"
            multiline
            rows="4"
            value={accountmodel.keystore}
            className={classes.textField}
            margin="normal"
            variant="outlined"
            onChange={this.handleChange('keystore')}
            fullWidth
          />:""
          
        }
        {
           typeof window.vnt === 'undefined'?
           <Grid container alignItems="center" spacing={24}>
            <Grid item xs={8}>
              <TextField
                id="tf-password"
                label="Password"
                className={classes.textField}
                margin="normal"
                variant="outlined"
                fullWidth
                value={accountmodel.password}
                type={this.state.showPassword ? 'text' : 'password'}
                onChange={this.handleChange('password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Toggle password visibility"
                        onClick={this.handleClickShowPassword}
                      >
                        {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={4}>
              <Button variant="outlined" size="large" color="primary"
                onClick={this.unlockAccount}
              >
                解锁
            </Button>
            </Grid>
          </Grid>:""
        }
        <Chip
          avatar={<Avatar>0x</Avatar>}
          label={accountmodel.address}
          clickable
          className={classes.chip}
          deleteIcon={<DoneIcon />}
          variant="outlined"
          onClick={() => this.refresh(accountmodel.account)}
        />
        <Chip
          avatar={<Avatar>昵称</Avatar>}
          label={accountmodel.nickname}
          clickable
          className={classes.chip}
          deleteIcon={<DoneIcon />}
          variant="outlined"
          onClick={() => this.refresh(accountmodel.account)}
        />
        <Chip
          avatar={<Avatar>VNT</Avatar>}
          label={accountmodel.balance}
          clickable
          className={classes.chip}
          color="primary"
          deleteIcon={<DoneIcon />}
          variant="outlined"
          onClick={() => this.refresh(accountmodel.account)}
        />
        <Chip
          avatar={<Avatar>筹码</Avatar>}
          label={accountmodel.amount}
          clickable
          className={classes.chip}
          color="secondary"
          deleteIcon={<DoneIcon />}
          variant="outlined"
          onClick={() => this.refresh(accountmodel.account)}
        />
        <Chip
          avatar={<Avatar>胜负</Avatar>}
          label={accountmodel.winAndLose}
          clickable
          className={classes.chip}
          color="primary"
          deleteIcon={<DoneIcon />}
          variant="outlined"
          onClick={() => this.refresh(accountmodel.account)}
        />
        <Grid container alignItems="center" spacing={24}>
          <Grid item xs={8} sm={4}>
            <TextField
              id="tf-claim-amount"
              label="设置昵称"
              className={classes.textField}
              variant="outlined"
              onChange={this.handleState('nickname')}
              value={this.state.nickname}
            />
          </Grid>
          <Grid item xs={8} sm={4}>
            <Button variant="outlined" size="large" color="primary"
              onClick={this.setNickName}
            >
              设置昵称
           </Button>
          </Grid>
        </Grid>
        <Grid container alignItems="center" spacing={24}>
          <Grid item xs={8} sm={4}>
            <TextField
              id="tf-claim-amount"
              label="筹码充值数量"
              className={classes.textField}
              variant="outlined"
              type="number"
              value={this.state.depositamount}
              onChange={this.handleState("depositamount")}
            />
          </Grid>
          <Grid item xs={8} sm={4}>
            <Button variant="outlined" size="large" color="primary"
              onClick={this.deposit}
            >
              筹码充值
           </Button>
          </Grid>
        </Grid>
        <Grid container alignItems="center" spacing={24}>
          <Grid item xs={8} sm={4}>
            <TextField
              id="tf-claim-amount"
              label="提取筹码数量"
              className={classes.textField}
              variant="outlined"
              type="number"
              value={this.state.claimamount}
              onChange={this.handleState("claimamount")}
            />
          </Grid>
          <Grid item xs={8} sm={4}>
            <Button variant="outlined" size="large" color="primary"
              onClick={this.claim}
            >
              提取筹码
           </Button>
          </Grid>
          <Grid item xs={8} sm={4}>
            <Button variant="outlined" size="large" color="primary"
              onClick={this.claimAll}
            >
              提取全部
            </Button>
          </Grid>
        </Grid>
        <Button variant="outlined" size="large" color="primary" className={classes.margin}
          onClick={this.getFreeClips}
        >
          获取100VNT,每个账号只有一次机会
        </Button>
      </div>)
  }
}
Wallet.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default connect(({ accountmodel, betmodel, historymodel }) => ({
  accountmodel, betmodel, historymodel
}))(withStyles(styles)(Wallet));