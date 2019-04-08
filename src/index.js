import './index.css';
import './services/bet.js'

import dva from 'dva';

// 1. Initialize
const app = dva();

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
