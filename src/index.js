import './index.css';
import BetService from './services/bet.js'

import dva from 'dva';




var startDapp = function(){
    // 1. Initialize
    const app = dva();
    window.BetService = new BetService();
    // 2. Plugins
    // app.use({});

    // 3. Model
    app.model(require('./models/accountModel').default);
    app.model(require('./models/betModel').default);
    app.model(require('./models/historyModel').default);

    // 4. Router
    app.router(require('./router').default);

    // 5. Start
    app.start('#root');
}


if (window.setupWalletBridge) {  //mobile wallet
    console.log("mobile wallet")
    window.initWalletBridge = function (vnt) {
        //请求钱包授权
        window.vnt.requesetAuthorization(function(err,authorized){
            if (authorized===true){
                startDapp();
            }
        });
    }
} else if (typeof window.vnt !== 'undefined') { //browser wallet
    //todo 如果是在桌面浏览器中打开dapp页面，需要获得用户授权并解锁账号
    startDapp();
} else {
    //未检测到钱包插件，使用vnt-kit进行解锁
    startDapp();
}
