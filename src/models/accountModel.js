const testKeystore =
    `{"address":"0daa6c3979aa1c2f0886d95df473879732196a29","crypto":{"cipher":"aes-128-ctr","ciphertext":"b72a89f4da0a8c4e7a9d140dc8f9bac34e678c20be2d77ed9b736e8d62507dae","cipherparams":{"iv":"9d89bfe03999ffa69c147a2faea311d7"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"1ebc2e5284791889ebc36d3774be696e20c35ddc548591cbcc7764ceb6161e66"},"mac":"9f2c8b62ea2ab4d74f4cdcdb8a11be56b730dbc9c6258ef3c133409ad9d2dc99"},"id":"975fa804-bb42-4dd6-a85e-359ee7621820","version":3}`;
const testPassword = ``;

export default {

  namespace: 'accountmodel',

  state: {
    keystore: testKeystore,
    password: testPassword,
    address: '0000000000000000000000000000000000000000',
    balance: '0',
    amount: '0',
    nickname: '',
    winAndLose: '0-0',
    account: {},
  },

  subscriptions: {
    setup({dispatch, history}) {  // eslint-disable-line
    },
  },

  effects: {
    *
        fetch({payload}, {call, put}) {  // eslint-disable-line
          yield put({type: 'save'});
        },
  },

  reducers: {
    saveAccount(state, action) {
      return {...state, ...action};
    },
  },

};
