const testKeystore =
    `{"address":"122369f04f32269598789998de33e3d56e2c507a","crypto":{"cipher":"aes-128-ctr","ciphertext":"323e3949406f96f05c20603ed1ba2bef0b2bbc33841bc5bf8277a9501f48fe7e","cipherparams":{"iv":"91df29183f9804ab83c0ebd56a99028a"},"kdf":"scrypt","kdfparams":{"dklen":32,"n":262144,"p":1,"r":8,"salt":"94e5d7f35fe1a017cf42f61cd25831ea451ad305a88a995622e0cad0af5bce86"},"mac":"08e268f1bc79f428821c76fbf2886dea008f26f0159f350f53659d07a59ae671"},"id":"110d9f51-20c6-488b-aa74-398200c6417b","version":3}`;
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
