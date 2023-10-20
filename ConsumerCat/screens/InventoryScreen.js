import React, { useEffect, useState, useContext } from 'react';
import { Alert, View, Text, StyleSheet, Keyboard, TouchableOpacity, TextInput, TouchableWithoutFeedback, Pressable, Modal } from 'react-native';
import { styles } from '../Styles';
import Item from '../components/Item';
import { ItemContext } from '../hooks/ItemContext';
import { auth, db } from '../firebaseConfig';

const InventoryScreen = () => {
    const { setItem, itemList, setItemList, handleAddItem } = useContext(ItemContext);
    const [ itemName, setItemName ] = useState('');
    const [ itemQty, setItemQty ] = useState('');
    const [manualAddModalVisible, setManualAddModalVisible] = useState(false);

    const handleManualAddButton = () => {
        setManualAddModalVisible(false);
        setItemName('');
        setItemQty('');
    }
    
    const ManualAddModal = () => {
        return(
                <Modal
                    animationType="slide"
                    visible={manualAddModalVisible}
                    transparent={true}
                    onRequestClose={() => {
                        setManualAddModalVisible(!manualAddModalVisible);
                    }}>
                    <View style={{backgroundColor: '#0000000aa', flex: 1, justifyContent: 'center'}}>
                        <View style={{backgroundColor: '#fff', margin: 100, padding: 20, flex: 0.25, borderRadius: 10, alignSelf: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#000'}}>
                            <Text style={{fontSize: 20, fontWeight: 'bold', marginHorizontal: 30}}>Add Item(s)</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center',}}>
                                <Text>Name: </Text>
                                <TextInput 
                                    style={[{width: 120, height: 30}, styles.input]} 
                                    onChangeText={ name => setItemName(name)}/>
                            </View>
                            <View style={{flexDirection: 'row', alignItems: 'center',}}>
                                <Text style={{justifyContent: 'center', verticalAlign: 'middle'}}>Quantity: </Text>
                                <TextInput
                                    style={[{width: 30, height: 30}, styles.input]}
                                    onChangeText={ qty => setItemQty(qty)}
                                    keyboardType='numeric'/>
                            </View>
                            <View style={[styles.hz_align_items]}>
                                <View style={{flex: 1, alignItems: 'center'}}> 
                                    <Pressable
                                        onPress={() => setManualAddModalVisible(false)}>
                                        <Text>Cancel</Text>
                                    </Pressable>
                                </View>
                                <View style={{flex: 1, alignItems: 'center'}}>
                                    <Pressable
                                        onPress={() => {
                                            setItem({
                                                itemName: itemName, 
                                                quantity: itemQty,
                                                daysSincePurchase: 4,
                                                daysLeft: 5,
                                            });
                                            handleAddItem();
                                            handleManualAddButton();

                                        }}>
                                        <Text>Add</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </View>
                </Modal>
        )
    }

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
            <View style={styles.hz_align_items}>
                <Text style={[{flex: 1}, styles.header]}>Your Inventory</Text>
                <Pressable 
                    style={inv_styles.manual_btn_background}
                    onPress={() => setManualAddModalVisible(true)}>
                    <Text style={inv_styles.manual_btn_text}>+</Text>
                </Pressable>
            </View>
            <View style={styles.horizontal_line} />
            {
                itemList.map((item, index) => {
                    return (
                        <Item itemName={item.itemName} quantity={item.quantity} daysLeft={item.daysLeft} key={index}/>
                    )
                })
            }
            {/* <TextInput
              placeholder='Food'
              value={item}
              onChangeText={ item => setItem({
                itemName: item, 
                quantity: 2,
                daysSincePurchase: 4,
                daysLeft: 5,
              })}
            /> */}
            {/* <TouchableOpacity onPress={() => handleAddItem()}>
              <Text>Add Item</Text>
            </TouchableOpacity> */}
            {ManualAddModal()}
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
    },

    display_name: {
        fontSize: 14,
        marginBottom: 30,
    },

    manual_btn_background: {
        marginBottom: 5,
        borderRadius: 10,
        backgroundColor: '#3F6C51',
    },

    manual_btn_text: {
        fontSize: 36,
        fontWeight: '300',
        color: 'white',
        paddingBottom: 2, 
        paddingHorizontal: 10,
    }
});

export default InventoryScreen;