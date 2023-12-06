import React, { useState } from 'react';
import { Alert, View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { auth, db } from '../firebaseConfig';
import firebase from 'firebase/app';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const uid = userCredential.user.uid;
        const currentDate = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD' format
  
        // Prepare the document reference for login logs under the specific date
        const eventLogsRef = db.collection('eventLogs').doc('login').collection('date').doc(currentDate);
  
        // Prepare the data to log
        const eventData = {
          userId: uid,
          userEmail: email, // Be mindful of user privacy
        };
  
        // Log the login event to Firestore under the specific date
        eventLogsRef.set({
          [uid]: eventData // Creating a field with userId as the key and eventData as the value
        }, { merge: true }) // Using merge to ensure that existing data under the same date is not overwritten
          .then(() => {
            console.log('Login event logged to Firestore');
          })
          .catch((error) => {
            console.error('Error logging event to Firestore:', error);
          });
  
        navigation.navigate('TabContainer', { uid: uid });
      })
      .catch((error) => {
        Alert.alert('Login Failed', error.message);
      });
  };
  
  
  
  return (
    <View style={styles.container}>
      <Image source={require('../assets/ccsplashlogin.jpeg')}/>
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
            <Text style={styles.LoginButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.CreateAccountButton} onPress={() => navigation.navigate('AccountCreation')}>
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
        backgroundColor: '#FFFFFF',
        padding: 20,
    },
    LoginButton: {
        width: 300,
        borderWidth: 2,
        borderColor: '#3F6C51',
        backgroundColor: '#3F6C51',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 70, 
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },

    LoginButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },

    CreateAccountButton: {
        width: 300,
        borderWidth: 2,
        backgroundColor: '#D5F8D2',  
        borderColor: '#3F6C51',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 25,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    ButtonText: {
        color: '#3F6C51',  
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
        borderColor: 'white',
        backgroundColor: '#e3e3e3',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
        borderRadius: 25,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 50,
    },
});

export default LoginScreen;
