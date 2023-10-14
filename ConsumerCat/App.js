import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from 'react-native-screens/native-stack';

import AuthNavigator from './navigation/AuthNavigator';

const Stack = createNativeStackNavigator();

export default function App() {
    
  return (
    
    <NavigationContainer>
        <AuthNavigator/>
    </NavigationContainer>
            
  );
};


