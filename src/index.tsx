import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import StaticHandlerProvider from './useStaticHandler';
import { hoge } from './handlers';

const elem = document.getElementById('app');
const render = () => {
  ReactDOM.render(
    <StaticHandlerProvider enable={false} entries={[hoge]}>
      <App />
    </StaticHandlerProvider>,
    elem,
  );
};

const hydrate = () => {
  ReactDOM.hydrate(
    <StaticHandlerProvider enable={true} entries={[hoge]}>
      <div dangerouslySetInnerHTML={{ __html: '' }} suppressHydrationWarning />
    </StaticHandlerProvider>,
    elem,
  );
};

const main = () => {
  if (elem?.childNodes.length) {
    hydrate();
  } else {
    render();
  }
};

main();
