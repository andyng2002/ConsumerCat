import React, { useEffect, useState, useContext } from 'react';
import { Alert, View, ScrollView, Text, StyleSheet, Keyboard, TouchableOpacity, TextInput, TouchableWithoutFeedback, Pressable, Modal } from 'react-native';
import { styles } from '../Styles';
import Item from '../components/Item';
import { ItemContext } from '../hooks/ItemContext';
import { auth, db } from '../firebaseConfig';
import { FlatList } from 'react-native';

const InventoryScreen = ({ route }) => {
    const { setItem, itemList, setItemList, handleAddItem } = useContext(ItemContext);
    const [ itemName, setItemName ] = useState('');
    const [ itemQty, setItemQty ] = useState('');
    const { uid } = route.params;
    const [manualAddModalVisible, setManualAddModalVisible] = useState(false);
    const [suggestions, setSuggestions] = useState([]);

    // const handleManualAddButton = () => {
    //     setManualAddModalVisible(false);
    //     setItemName('');
    //     setItemQty('');
    // }
    
    const addToInventory = () => {
        if (itemName && itemQty) {
            const itemRef = db.collection('users').doc(uid).collection('items').doc(itemName);
    
            itemRef.get().then((doc) => {
                if (doc.exists) {
                    console.log("here")
                    // If item already exists, update the quantity
                    const currentQuantity = doc.data().quantity || 0;  // Use 0 as a fallback
                    return itemRef.update({
                        quantity: currentQuantity + quantity  // Adding to existing quantity
                    });
                } else {
                    // If item doesn't exist, create a new entry
                    return itemRef.set({
                        itemName: itemName,
                        quantity: itemQty,
                        // daysSincePurchase: item.daysSincePurchase,
                        // daysLeft: item.daysLeft,
                        daysSincePurchase: 5,
                        daysLeft: 12,
                    });
                }
            })
            .then(() => {
                Alert.alert('Success', 'Product added to inventory!');
            })
            .catch((error) => {
                console.error("Error adding or updating document: ", error);
            });
    
            setItemName(null);
            setItemQty(null);  // Resetting the qtyr
        } else {
            Alert.alert('Error', 'Could not add product to inventory.');
        }
    };

    const handleSearch = async (text) => {
        setItemName(text);
    
        try {
            // Search by Product Name
            const productNameQuerySnapshot = await db.collection('productDatabase')
                .where('Product Name', '>=', text)
                .where('Product Name', '<=', text + '\uf8ff')
                .get();
    
            // Search by Brand
            const brandQuerySnapshot = await db.collection('productDatabase')
                .where('Brand', '>=', text)
                .where('Brand', '<=', text + '\uf8ff')
                .get();
    
            const productNameResults = productNameQuerySnapshot.docs.map(doc => {
                const data = doc.data();
                return `${data.Brand} ${data['Product Name']}`;
            });
    
            const brandResults = brandQuerySnapshot.docs.map(doc => {
                const data = doc.data();
                return `${data.Brand} ${data['Product Name']}`;
            });
    
            // Combine results and remove duplicates
            const combinedResults = Array.from(new Set([...productNameResults, ...brandResults]));
    
            setSuggestions(combinedResults);
        } catch (error) {
            console.error('Error performing search:', error);
        }
    };
    

    const ManualAddModal = () => {
        return(
                <Modal
                    animationType="slide"
                    visible={manualAddModalVisible}
                    transparent={true}
                    onRequestClose={() => {
                        setManualAddModalVisible(!manualAddModalVisible);
                    }}>
                    <View style={{ backgroundColor: '#0000000aa', flex: 1, justifyContent: 'center' }}>
                        <View style={{ 
                            backgroundColor: '#fff', 
                            width: 300, // fixed width
                            height: 500, // fixed height
                            margin: 50,
                            padding: 20, 
                            borderRadius: 10, 
                            alignSelf: 'center', 
                            justifyContent: 'space-between', 
                            borderWidth: 1, 
                            borderColor: '#000'
                        }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginHorizontal: 30 }}>Add Item(s)</Text>                     
                            {/* New Auto-complete Search Bar */}
                            <TextInput
                                placeholder='Search'
                                placeholderTextColor='black'
                                value={itemName}
                                onChangeText={handleSearch}
                                style={{ marginBottom: 10, width: 120, height: 30, color: 'Black'}, styles.input }
                            />

                            <FlatList
                                data={suggestions}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => {
                                        const name = item
                                        setItemName(name);
                                        console.log(itemName);
                                    }}>
                                        <Text>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />


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
                                    <Pressable onPress={addToInventory}>
                                        
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
                
                <ScrollView style={{ flex: 1 }}>
                    {
                        itemList.map((item, index) => {
                            return (
                                <Item itemName={item.itemName} quantity={item.quantity} daysLeft={item.daysLeft} key={index}/>
                            )
                        })
                    }
                </ScrollView>

    
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