import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TextInput, Button, TouchableOpacity } from 'react-native';
import { auth } from '../firebaseConfig';
import { useIsFocused } from '@react-navigation/native';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        navigation.navigate('Chat');
      })
      .catch((error) => {
        Alert.alert('Login Failed', error.message);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat Room Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
        <TouchableOpacity style={styles.LoginButton} onPress={handleLogin}>
            <Text style={styles.LoginButtonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AccountCreation')}>
            <Text style={styles.ButtonText}>Create Account</Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f4f4',
        padding: 20,
    },
    LoginButton: {
        width: 300,
        borderWidth: 2,
        borderColor: '#a741fa',
        backgroundColor: '#a741fa',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    LoginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    button: {
        backgroundColor: '#f4f4f4',  
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    ButtonText: {
        color: '#a741fa',  
        fontSize: 16,
        fontWeight: 'bold',
    },  

    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: 300,
        height: 40,
        borderColor: 'gray',
        backgroundColor: '#e3e3e3',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingLeft: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 50,
    },
});

export default LoginScreen;
