import React, { useEffect, useState, useContext } from 'react';
import { Alert, View, Text, StyleSheet, Button, Keyboard, TouchableOpacity, TextInput, TouchableWithoutFeedback } from 'react-native';
import { styles } from '../Styles';
import Item from '../components/Item';
import { ItemContext } from '../hooks/ItemContext';
import { auth, db } from '../firebaseConfig';

const InventoryScreen = () => {
    const { item, setItem, itemList, setItemList, handleAddItem } = useContext(ItemContext)

    const fetchInventoryItems = async () => {
      try {
          const user = auth.currentUser;
          if (user) {
              // const userDoc = await db.collection('users').doc(user.uid).get();
              // const userData = userDoc.data();

              // if (userData && userData.items) {
              //     setItemList(userData.items);
              // }
              const userDoc = await db.collection('users').doc(user.uid)
              .collection('items')
              .onSnapshot((snapshot) => {
                const inventoryData = snapshot.docs.map((doc) => doc.data());
                setItemList(inventoryData);
              });
          }
      } catch (error) {
          console.error('Error fetching inventory items:', error);
      }
    };

    useEffect(() => {
      fetchInventoryItems();
    }, []);
  

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={inv_styles.container}>
            <Text style={inv_styles.hello_text}>Hello!</Text>
            <Text style={inv_styles.display_name}>{auth.currentUser.email}</Text>
            <Text style={styles.header}>Your Inventory</Text>
            <View style={styles.horizontal_line} />
            {
                itemList.map((item, index) => {
                    return (
                        <Item itemName={item.itemName} quantity={item.quantity} daysLeft={item.daysLeft} key={index}/>
                    )
                })
            }
            <TextInput
              placeholder='Food'
              value={item}
              onChangeText={ item => setItem({
                itemName: item, 
                quantity: 2,
                daysSincePurchase: 4,
                daysLeft: 5,
              })}
            />
            <TouchableOpacity onPress={() => handleAddItem()}>
              <Text>Add Item</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      );
    };

 
// styles specific to Inventory Screen
const inv_styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'left',
        justifyContent: 'top',
        backgroundColor: '#E3FDE0',
        paddingTop: 80,
        padding: 20,
    },

    hello_text: {
        fontSize: 22,
        fontWeight: "bold",
        marginHorizontal: 5
    },

    display_name: {
        fontSize: 14,
        marginHorizontal: 5,
        marginBottom: 30,
    }
});

export default InventoryScreen;