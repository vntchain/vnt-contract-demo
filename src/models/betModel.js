

export default {

  namespace: 'betmodel',

  state: {
    betamount: 0,
    bigger: '1',
    pool: 0,
    totalCount: 0,
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
    save(state, action) {
      return {...state, ...action};
    },
  },

};
