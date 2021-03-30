import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { App } from './app';
import { ErrorWrapper } from './error';
import { Toaster } from 'react-hot-toast';

ReactDOM.render(
    <ErrorWrapper>
        <Toaster />
        <App />
    </ErrorWrapper>, document.getElementById('react-root')
);
