import React, { useEffect, useState, useContext } from 'react';
import { Alert, FlatList, View, ScrollView, Text, StyleSheet, Keyboard, TouchableOpacity, TextInput, TouchableWithoutFeedback, Pressable, Modal, Image} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { format, addDays, differenceInCalendarDays} from 'date-fns';

import { styles } from '../Styles';
import Item from '../components/Item';
import { ItemContext } from '../hooks/ItemContext';
import { auth, db } from '../firebaseConfig';

import { productDictionary } from '../ProductInfo/productDictionary.js';
 

const InventoryScreen = ({ route }) => {
    const [ userName, setUserName ] = useState('');
    const { setItem, itemList, setItemList, handleAddItem } = useContext(ItemContext);
    const [ itemName, setItemName ] = useState('');
    const [ itemQty, setItemQty ] = useState('');
    const [ itemDaysLeft, setItemDaysLeft ] = useState('');
    const { uid } = route.params;
    const [manualAddModalVisible, setManualAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [sortBy, setSortBy] = useState('asc');
    const isFocused = useIsFocused();

    const changeQuantity = () => {
        if (itemName && itemQty) {
            const itemRef = db.collection('users').doc(uid).collection('items').doc(productDictionary[itemName].UPC);
    
            itemRef.get().then(async (doc) => {
                if (doc.exists) {
                    return itemRef.update({
                        quantity: parseInt(itemQty)
                    });
                } else {
                    console.log("not here")
                }
            })
            .then(() => {
                Alert.alert('Success', 'Quantity updated');
            })
            .catch((error) => {
                console.error("Error adding or updating document: ", error);
            });
    
            setItemName(null);
            setItemQty(null);
        } else {
            Alert.alert('Error', 'Could not edit');
        }
    }

    const addToInventory = () => {
        if (itemName && itemQty) {
            const itemRef = db.collection('users').doc(uid).collection('items').doc(productDictionary[itemName].UPC);
    
            itemRef.get().then(async (doc) => {
                if (doc.exists) {
                    console.log("here")
                    // If item already exists, update the quantity
                    const currentQuantity = doc.data().quantity || 0;
                    return itemRef.update({
                        quantity: currentQuantity + quantity  // Adding to existing quantity
                    });
                } else {
                    // If item doesn't exist, create a new entry
                    var itemExpiration = 7;

                    const itemQuerySnapshot = await db.collection('productDatabase')
                        .where('fullName', '>=', itemName)
                        .where('fullName', '<=', itemName + '\uf8ff')
                        .get();
            
                    itemQuerySnapshot.docs.map(doc => {
                        const data = doc.data();
                        if (data) {
                            // if item is in productDatabase, get its expiresInDays
                            // console.log(parseInt(data.expiresInDays));
                            itemExpiration = parseInt(data.expiresInDays);
                         }
                    });

                    console.log(`daysToExpiration: ${itemExpiration}`);
                    const expirationDate = addDays(new Date(), itemExpiration);
                    const expirationDateFormatted = format(expirationDate, 'MM/dd/yyyy');
                    console.log(`expirationDate: ${expirationDateFormatted}`);
                    const boughtDateFormatted = format(new Date(), 'MM/dd/yyyy');

                    return itemRef.set({
                        itemName: itemName,
                        quantity: itemQty,
                        imageURL: productDictionary[itemName].image,
                        bought: boughtDateFormatted,
                        expirationDate: expirationDateFormatted,
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
            setItemQty(null);  // Resetting the qty
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
                    <View style={inv_styles.manual_screen}>
                        <View style={inv_styles.manual_header_container}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold'}}>Add Item(s)</Text>                  
                            <View style={{flexDirection: 'row', alignItems: 'center',}}>
                                <Text style={{justifyContent: 'center', verticalAlign: 'middle'}}>Quantity: </Text>
                                <TextInput
                                    style={[{width: 30, height: 30}, styles.input]}
                                    onChangeText={ qty => setItemQty(qty)}
                                    keyboardType='numeric'/>
                            </View>
                        </View>
                    
                        {/* New Auto-complete Search Bar */}
                        <TextInput
                            placeholder='Search'
                            placeholderTextColor='black'
                            value={itemName}
                            onChangeText={handleSearch}
                            style={[styles.input, {marginBottom: 10, width: '100%', height: 30, color: 'black'}]}
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
    
                        <View style={inv_styles.manual_buttons_container}>
                            <View style={inv_styles.manual_buttons}> 
                                <Pressable
                                    onPress={() => setManualAddModalVisible(false)}>
                                    <Text style={[inv_styles.manual_btn_text, {fontSize: 18, fontWeight: '500'}]}>Cancel</Text>
                                </Pressable>
                            </View>
                            <View style={inv_styles.manual_buttons}>
                                <Pressable onPress={addToInventory}>
                                    <Text style={[inv_styles.manual_btn_text, {fontSize: 18, fontWeight: '500'}]}>Add</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )
    }

    const EditModal = () => {
        return (
            <Modal
            animationType="slide"
            visible={editModalVisible}
            transparent={true}
            onRequestClose={() => {
                setEditModalVisible(!editModalVisible);
            }}>
                <View style={{ backgroundColor: '#0000000aa', flex: 1, justifyContent: 'center' }}>
                    <View style={inv_styles.manual_screen}>
                        <View style={inv_styles.manual_header_container}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold'}}>Edit Item</Text>                  
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center',}}>
                            <Text style={{justifyContent: 'center', verticalAlign: 'middle'}}>Quantity: </Text>
                            <TextInput
                                style={[{width: 30, height: 30}, styles.input]}
                                onChangeText={ qty => setItemQty(qty)}
                                keyboardType='numeric'
                            />
                            <View style={inv_styles.manual_buttons}>
                                <Pressable onPress={()=>{changeQuantity()}}>
                                    <Text style={[inv_styles.manual_btn_text, {fontSize: 18, fontWeight: '500'}]}>Set</Text>
                                </Pressable>
                            </View>
                        </View>
                                        
                        {/* <View style={{flexDirection: 'row', alignItems: 'center',}}>
                            <Text style={{justifyContent: 'center', verticalAlign: 'middle'}}>Days Left: </Text>
                            <TextInput
                                style={[{width: 30, height: 30}, styles.input]}
                                onChangeText={ qty => setItemDaysLeft(qty)}
                                keyboardType='numeric'
                            />
                            <View style={inv_styles.manual_buttons}>
                                <Pressable onPress={()=>{changeDaysLeft()}}>
                                    <Text style={[inv_styles, {fontSize: 18, fontWeight: '500', color: 'white'}]}>Add</Text>
                                </Pressable>
                            </View>
                        </View> */}
    
                        <View style={inv_styles.manual_buttons_container}>
                            <View style={inv_styles.manual_buttons}> 
                                <Pressable
                                    onPress={() => {
                                        setEditModalVisible(false)
                                        setItemName(null)
                                        setItemQty(null)
                                    }}>
                                    <Text style={[inv_styles.manual_btn_text, {fontSize: 18, fontWeight: '500'}]}>Cancel</Text>
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
            const userDoc = await db.collection('users').doc(user.uid).collection('items')
            const query = userDoc.orderBy('daysLeft', sortBy)

            query.get().then((snapshot) => {
                const inventoryData = snapshot.docs.map((doc) => doc.data());

                // update daysLeft fields of all the items in inventory
                inventoryData.forEach((item) => {    
                    const itemRef = db.collection('users').doc(uid).collection('items').doc(productDictionary[item.itemName].UPC);
    
                    itemRef.get().then(async (doc) => {
                        if (doc.exists) {
                            const expDateRaw = item.expirationDate.split('/');
                            const expDateFormatted = new Date(parseInt(expDateRaw[2], 10), parseInt(expDateRaw[0], 10) - 1, parseInt(expDateRaw[1], 10));
            
                            const daysLeft = parseInt(differenceInCalendarDays(expDateFormatted, new Date()));
                            const daysLeftFormatted = daysLeft <= 0 ? 0 : daysLeft;
                            itemRef.update({
                                daysLeft: daysLeftFormatted
                            });
                        } else {
                            console.log("not here")
                        }
                    })
                    console.log(item);
                })
                // populate inventory list
                setItemList(inventoryData);
                console.log(inventoryData);

            })
          }
      } catch (error) {
          console.error('Error fetching inventory items:', error);
      }
    };

    const deleteItem = (itemName) => {
        db.collection('users')
        .doc(uid)
        .collection('items')
        .doc(productDictionary[itemName].UPC)
        .delete()
        .then(() => {
          const updatedItemList = itemList.filter((item) => item.itemName !== itemName);
          setItemList(updatedItemList);
         })
        .catch((error) => {
          console.error('Error deleting item from Firebase:', error);
        });
    }

    useEffect(() => {
        if (isFocused) {
            fetchInventoryItems();
        }   
        const fetchUserData = async () => {
            if (auth.currentUser) {
              const userDocRef = db.collection('users').doc(uid);
              userDocRef.get().then(async (doc) => {
                if (doc.exists) {
                    setUserName(doc.data().firstName + ' ' + doc.data().lastName);
                } else {
                    console.log('No such document!');
                  }
            })
            }
          };
      
        fetchUserData();
    }, [isFocused]);
  

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={inv_styles.container}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly'}}>
                    <Image source={require(`../assets/HAPPY_CAT.png`)} style={inv_styles.cat_icon}/>
                    <View>
                        <Text style={inv_styles.hello_text}>Hello!</Text>
                        <Text style={inv_styles.display_name}>{userName}</Text>
                    </View>
                </View>
                <View style={styles.hz_align_items}>
                    <Text style={[{flex: 1}, styles.header]}>Your Inventory</Text>
                    <Pressable 
                        style={[{marginRight: 10, backgroundColor: '#D9D9D9'}, inv_styles.manual_btn_background]}
                        onPress={() => {setSortBy((sortBy === 'asc') ? 'desc' : 'asc'); fetchInventoryItems();}}>
                        <Text style={inv_styles.sort_by_btn}>Sort By</Text>
                    </Pressable>
                    <Pressable 
                        style={[{backgroundColor: '#3F6C51'}, inv_styles.manual_btn_background]}
                        onPress={() => setManualAddModalVisible(true)}>
                        <Text style={inv_styles.manual_btn_text}>+</Text>
                    </Pressable>
                </View>
                <View style={styles.horizontal_line} />
                
                <ScrollView style={inv_styles.inventory}>
                    <SwipeListView
                        data={itemList}
                        renderItem={({ item }) => (
                            <Item itemName={item.itemName} quantity={item.quantity} daysLeft={item.daysLeft} expirationDate={item.expirationDate} bought={item.bought} imageUrl={item.imageURL} /> 
                        )}
                        renderHiddenItem={(data) => (
                            <View style={styles.hiddenContainer}> 
                                <TouchableOpacity 
                                    style={[styles.hiddenButton, styles.editButton]} 
                                    onPress={() => {
                                        setEditModalVisible(true);
                                        setItemName(data.item.itemName)
                                    }} 
                                > 
                                    <Text style={styles.buttonText}>Edit</Text> 
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.hiddenButton, styles.deleteButton]} 
                                    onPress={() => deleteItem(data.item.itemName)} 
                                > 
                                    <Text style={styles.buttonText}>Delete</Text> 
                                </TouchableOpacity>
                            </View>
                        )}
                        leftOpenValue={0}
                        rightOpenValue={-165}
                    />
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
                {EditModal()}
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
        paddingTop: 60,
        padding: 20,
    },

    inventory: {
        flex: 1,
        width: '100%',
    },

    cat_icon: {
        width: 45,
        height: 45,
        marginRight: 10
    },

    hello_text: {
        fontSize: 22,
        fontWeight: "bold",
    },

    display_name: {
        fontSize: 14,
    },

    manual_btn_background: {
        marginBottom: 5,
        borderRadius: 10,
    },

    manual_screen : {
        backgroundColor: '#fff', 
        width: '75%', // fixed width
        height: '30%', // fixed height
        margin: 50,
        padding: 20, 
        borderRadius: 10, 
        alignSelf: 'center', 
        justifyContent: 'space-between', 
        borderWidth: 1, 
        borderColor: '#000',
    },

    manual_buttons_container: {
        flexDirection: 'row',
        alignItems: 'space-between',
        justifyContent: 'center',
    },
    manual_header_container: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 15,
    },
    manual_buttons: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3F6C51',
        paddingTop: 10,
        paddingBottom: 10,
        marginLeft: 15,
        marginRight: 15,
        borderRadius: 10,
    },

    manual_btn_text: {
        fontSize: 36,
        fontWeight: '300',
        color: 'white',
        paddingBottom: 2, 
        paddingHorizontal: 10,
    },

    sort_by_btn: {
        fontSize: 16,
        color: 'black',
        margin: 11,
        paddingBottom: 2, 
        paddingHorizontal: 5,
    }
});

export default InventoryScreen;


const changeDaysLeft = () => {
    if (itemName && itemDaysLeft) {
        const itemRef = db.collection('users').doc(uid).collection('items').doc(productDictionary[itemName].UPC);

        itemRef.get().then(async (doc) => {
            if (doc.exists) {
                return itemRef.update({
                    daysLeft: parseInt(itemDaysLeft)
                });
            } else {
                console.log("not here")
            }
        })
        .then(() => {
            Alert.alert('Success', 'Quantity updated');
        })
        .catch((error) => {
            console.error("Error adding or updating document: ", error);
        });

        setItemName(null);
        setItemQty(null);
    } else {
        Alert.alert('Error', 'Could not edit');
    }
}