import React, {useState, useRef, useMemo, useEffect} from 'react';
import { View, Text, TouchableOpacity, Keyboard, StyleSheet, TextInput, Button, Image, ScrollView } from 'react-native';
import { auth, db } from '../firebaseConfig';
import firebase from "firebase/app";
import "firebase/firestore";
import 'firebase/auth';

const ChatScreen = ({navigation, route}) => {

    const messagesRef = db.collection('messages');
    const [formValue, setFormValue] = useState('');
    const dummy = useRef();
    const [messages, setMessages] = useState([]);

    useEffect(() => {
      const unsubscribe = messagesRef
        .orderBy('createdAt')
        .onSnapshot((snapshot) => {
          const newMessages = [];
          snapshot.forEach((doc) => {
            const messageData = doc.data();
            // Fetch the corresponding user's document based on the 'uid'
            db.collection('users')
              .doc(messageData.uid)
              .get()
              .then((userDoc) => {
                if (userDoc.exists) {
                  const userData = userDoc.data();
                  // Add the user's name to the message data
                  messageData.firstName = userData.firstName;
                  messageData.lastName = userData.lastName;
                  newMessages.push(messageData);
                  setMessages([...newMessages]);
                }
              })
              .catch((error) => {
                console.error('Error getting user document:', error);
              });
          });
        });
  
      return () => unsubscribe();
    }, []);
    
    const sendMessage = async () => {

      const { uid, photoURL } = auth.currentUser;
  
      await messagesRef.add({
        text: formValue,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid,
        photoURL,
      });
  
      setFormValue('');
      dummy.current.scrollToEnd({ animated: true });
    };

    
    return (
      <View style={styles.chatContainer}>
        <ScrollView
          style={styles.messageContainer}
          ref={dummy}
          onContentSizeChange={() => dummy.current.scrollToEnd({ animated: true })}
        >
          {messages.map((msg, index) => (
            <ChatMessage key={index} message={msg} />
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={formValue}
            onChangeText={(text) => setFormValue(text)}
            placeholder="Say something nice"
          />
          <Button title="Send" onPress={sendMessage} disabled={!formValue} />
        </View>
      </View>
    );
};

function ChatMessage(props) {
  const { text, firstName, lastName } = props.message;
  const messageClass = props.message.uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <View style={styles.message}>
      <View style={messageClass === 'sent' ? styles.sentMessage : styles.receivedMessage}>
        <Text>{firstName} {lastName}: {text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
  },
  chatContainer: {
    flex: 1,
  },
  messageContainer: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginRight: 10,
    padding: 8,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  sentMessage: {
    backgroundColor: '#DCF8C6',
    padding: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#F0F0F0',
    padding: 10,
    borderRadius: 8,
  },
});


export default ChatScreen
