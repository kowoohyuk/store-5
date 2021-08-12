import React from 'react';
import GlobalStyles from './GlobalStyles';
import { ThemeProvider } from 'styled-components';
import { Routes, Route } from './lib/CustomRouter';
import Cart from './pages/Cart/CartPage';
import Main from './pages/Main/Main';
import Header from '@src/components/Header/Header';
import theme from './theme/theme';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      {/* TODO: Change Header Component */}
      <div>Header</div>
      <div>
        <Routes>
          <Route path='/cart'>
            <Cart />
          </Route>
          <Route path='/'>
            <Main />
          </Route>
        </Routes>
      </div>
      <GlobalStyles />
    </ThemeProvider>
  );
}
