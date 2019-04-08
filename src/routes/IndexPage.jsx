import {connect} from 'dva';
import React from 'react';

import styles from './IndexPage.css';
import FullWidthGrid from './layout';

function IndexPage() {
  return (
    <div className={styles.normal}>
      <h1 className={styles.title}>TRY YOUR LUCK</h1>
      <FullWidthGrid/>
    </div>
  );
}

IndexPage.propTypes = {};

export default connect()(IndexPage);
