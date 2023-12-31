import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { auth, db } from '../firebaseConfig';
// import * as firebase from "firebase/compat";
import { Keyboard } from 'react-native';

const AccountCreationScreen = ({ navigation }) => {
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [points, setPoints] = useState(0);

  const inputStyle = {
    width: 300,
    height: 40,
    borderColor: '#e3e3e3',
    backgroundColor: '#e3e3e3',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 25,
  };

  const handleCreateAccount = async () => {
      auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const userType = "user";

        // Add a new document in Firestore
        db.collection('users').doc(user.uid).set({
          firstName,
          lastName,
          email,
          points,
          userType,
        })
        navigation.navigate('Login')
    })
    .catch(error => console.error(error.message))
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={styles.title}>Create Your Account</Text>
        <TextInput
        style={inputStyle}
        placeholder="First Name"
        value={firstName}
        onChangeText={(text) => setFirstName(text)}
        />
        <TextInput
        style={inputStyle}
        placeholder="Last Name"
        value={lastName}
        onChangeText={(text) => setLastName(text)}
        />
        <TextInput
        style={inputStyle}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
        autoCapitalize="none"
        />
        <TextInput
        style={inputStyle}
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
        />
        <TouchableOpacity
        style={styles.createAccountButton}
        onPress={() => {handleCreateAccount(); Keyboard.dismiss()}}
        >
        <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
            <Text style={styles.goBackButtonText}>Go back</Text>
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

    goBackButton: {
        backgroundColor: '#f4f4f4',  
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },

    goBackButtonText: {
        color: '#3F6C51',  
        fontSize: 16,
        fontWeight: 'bold',
    },  

    createAccountButton: {
        width: 300,
        borderWidth: 2,
        borderColor: '#3F6C51',
        backgroundColor: '#3F6C51',
        borderRadius: 5,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 25,
    },

    buttonText: {
        color: 'white',
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
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
        paddingLeft: 10,
        backgroundColor: '#fff',
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 50,
    },
});

export default AccountCreationScreen;
