import React from 'react';
import { render } from 'react-dom';

const init = () => {
  render(<div>Hello, World.</div>, document.getElementById('app'));
};

init();
