//This file has the navigation to all the initial login/create account screens

import {React} from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { createStackNavigator } from '@react-navigation/stack';


//screens
import LoginScreen from '../screens/LoginScreen';
import AccountCreationScreen from '../screens/AccountCreationScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createStackNavigator(); //object that includes the Navigator, Screen, and Group

function AuthNavigator() {
  return (
    <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1}}
        >
            <Stack.Navigator
                screenOptions={{}}>
          
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{title: "Login",
                    headerShown: false, gestureEnabled: false}}
                />
        
                <Stack.Screen
                    name="AccountCreation"
                    component={AccountCreationScreen}
                    options={{title: "Account Creation",
                    headerShown: false, gestureEnabled: false}}
                />

                <Stack.Screen
                    name="Chat"
                    component={ChatScreen}
                    options={{title: "Chat",
                    headerShown: false, gestureEnabled: false}}
                />
                
            </Stack.Navigator>
        </KeyboardAvoidingView>
  );
}

export default AuthNavigator;