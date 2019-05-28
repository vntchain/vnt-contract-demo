import React from 'react';
import {connect} from 'dva';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  textField: {},
  group: {
    textAlign: "center"
  },
  span: {
    // textShadow:"0 0 5px #2b002b, 0 0 20px #c0c, 0 0 10px #f0f",
    color: "#3f51b5",
    fontSize: 36
  },
  card: {
    minWidth: 275,
    marginTop: 20,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

class Bet extends React.Component {
  state = {
    value: 0,
    open: false
  };
  handleChange = prop => event => {
    this
      .props
      .dispatch({type: 'betmodel/save', [prop]: event.target.value});
  };
  send = () => {
    var BetService = window.BetService;
    var amount = this.props.betmodel.betamount;
    var bigger = this.props.betmodel.bigger;
    var account = this.props.accountmodel.account;
    BetService.requestBet(amount, bigger, account.address, account.privateKey, function (err, amount) {
      // _this.refresh(account);
    });
  };
  sendBet = () => {
    var amount = this.props.betmodel.betamount;
    if (amount >= 100000) {
      this.openDialog();
    } else {
      this.send();
    }

  };
  openDialog = () => {
    this.setState({open: true});
  };
  closeDialog = () => {
    this.setState({open: false});
  };
  render() {
    const {classes, betmodel} = this.props;
    return (
      <div>
        <span className={classes.span}>当前奖池：{betmodel.pool + ""}VNT</span>
        <br/>
        <span className={classes.span}>总局数：{betmodel.totalCount + ""}</span>
        <TextField
          id="tf-bet-amount"
          label="押注数量"
          value={betmodel.betamount}
          className={classes.textField}
          margin="normal"
          variant="outlined"
          type="number"
          fullWidth
          onChange={this.handleChange("betamount")}/>
        <RadioGroup
          row
          aria-label="押大小"
          name="gender1"
          className={classes.group}
          value={betmodel.bigger}
          onChange={this.handleChange("bigger")}>
            <FormControlLabel value={"1"} control={< Radio color = "primary" />} label=">50" />
            <FormControlLabel
              value={"0"}
              control={< Radio color = "primary" />}
              label="=50"/>
            <FormControlLabel
              value={"-1"}
              control={< Radio color = "primary" />}
              label="<50"/>
        </RadioGroup>
        <Button variant="outlined" size="large" color="primary" onClick={this.sendBet}>
          发送交易
        </Button>
        <Card className={classes.card}>
          <CardContent>
            <Typography className={classes.title} color="textSecondary" gutterBottom>
              游戏规则
            </Typography>
            <Typography component="p">
             游戏通过智能合约生成一个1到99的随机数 <br/>
             使用VNT进行押注，猜中随机数的大小将获得押注奖励<br/>
             猜对大于50或小于50将获得押注金额*90%的奖励<br/>
             猜中等于50将获得押注金额*90%*100的奖励<br/> 
             猜错将扣除押注的筹码<br/> 
             参与游戏前需要使用筹码充值按钮使用vnt充值筹码，每局游戏都需要押注筹码，筹码不足将不能进行游戏<br/>
             提取筹码按钮可以将筹码转化成vnt并提取到您的账号
            </Typography>
          </CardContent>
        </Card>
        <Dialog
          fullScreen={false}
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby="responsive-dialog-title">
            <DialogTitle id="responsive-dialog-title">{"WARNING"}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                小赌怡情大赌伤身，是否确定要押注{betmodel.betamount + ""}VNT
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.closeDialog} color="primary">
                取消
              </Button>
              <Button
                onClick={() => {
                this.send();
                this.closeDialog()
              }}
                color="primary"
                autoFocus>
                确定
              </Button>
            </DialogActions>
        </Dialog>
      </div>
    ) 
  }; 
} 
Bet.propTypes = {
  classes : PropTypes.object.isRequired,
}; 
export default connect(({betmodel,
        accountmodel}) => ({betmodel,
        accountmodel
}))(withStyles(styles)(Bet));