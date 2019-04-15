import React from 'react';
import {connect} from 'dva';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Vnt from 'vnt';
var vnt = new Vnt();

const styles = theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
    height: '100%',
    overflow: 'auto',
  },
});

class History extends React.Component {
  render=()=>{
  const { classes,historymodel } = this.props;
  var history = historymodel.history;
  return (
    <List className={classes.root}>{
        history.map((v,i) => {  
            if( v.event === "EVENT_BET"){
                var from = v.args.from; 
                var nickname = v.args.nickname;
                var amount = v.args.amount;
                var bigger = v.args.bigger; 
                var lottery = v.args.lottery;
                var reward = v.args.reward;

                var color;
                var winorlose;
                var winorlosestr;
                if ((bigger.cmp(0) === 1 && lottery.cmp(50) === 1)||(bigger.cmp(0) === -1 && lottery.cmp(50) === -1) || (bigger.cmp(0) === 0 && lottery.cmp(50) === 0)){
                    color = "green"; 
                    winorlose = "W";
                    winorlosestr ="赢得"; 
                    amount = reward;
                }else{
                    color = "red";
                    winorlose = "L";
                    winorlosestr ="输了"; 

                }
                if (nickname.length>4){
                    nickname = nickname.substring(0,2)+"**"+nickname.substring(nickname.length-2,nickname.length);
                }
                from=from.substring(0,5)+"***"+from.substring(from.length-2,from.length);
                var text1="用户"+nickname+"("+from+")"+winorlosestr+vnt.fromWei(amount)+"VNT";
                return (
                    <ListItem style={{color:color}} key={i}>
                        <Avatar style={{backgroundColor:color}}>
                          {winorlose}
                        </Avatar>
                        <ListItemText primary={text1} secondary="" />
                    </ListItem>)
            }
        })
    }
    </List>
  );}
}

History.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default connect(({historymodel}) => ({historymodel
}))(withStyles(styles)(History));