import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './navigation/AppNavigator';

const App = () => {
  return (
    <>
      <StatusBar style="light" backgroundColor="#1E88E5" />
      <AppNavigator />
    </>
  );
};

export default App;