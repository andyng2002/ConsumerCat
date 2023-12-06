import React, { useEffect, useState, useContext } from 'react';
import { Alert, FlatList, View, ScrollView, Text, StyleSheet, Keyboard, TouchableOpacity, TextInput, TouchableWithoutFeedback, Pressable, Modal, Image} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { format, addDays, differenceInCalendarDays} from 'date-fns';
import RadioForm from 'react-native-simple-radio-button';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
     const { uid } = route.params;
    const [manualAddModalVisible, setManualAddModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [sortModalVisible, setSortModalVisible] = useState(false);
    const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [sortBy, setSortBy] = useState('asc-daysLeft-0');
    const [points, setPoints] = useState(0);
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
                let action;
                if (doc.exists) {
                    // If item already exists, update the quantity
                    const currentQuantity = doc.data().quantity || 0;
                    action = itemRef.update({
                        quantity: currentQuantity + parseInt(itemQty)  // Adding to existing quantity
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
                            itemExpiration = parseInt(data.expiresInDays);
                         }
                    });
    
                    const expirationDate = addDays(new Date(), itemExpiration);
                    const expirationDateFormatted = format(expirationDate, 'MM/dd/yyyy');
                    const boughtDateFormatted = format(new Date(), 'MM/dd/yyyy');
    
                    action = itemRef.set({
                        itemName: itemName,
                        quantity: parseInt(itemQty),
                        imageURL: productDictionary[itemName].image,
                        bought: boughtDateFormatted,
                        expirationDate: expirationDateFormatted,
                        daysLeft: 12,
                    });
                }
                return action;
            })
            .then(() => {
                // Prepare the document reference for the inventory add logs
                const currentDate = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD' format
                const inventoryAddLogRef = db.collection('eventLogs').doc('itemAdd').collection('date').doc(currentDate);
    
                // Log the inventory add event to Firestore
                inventoryAddLogRef.set({
                    [`${new Date().getTime()}`]: { // Unique identifier for each log entry
                        itemName: itemName,
                        quantityAdded: parseInt(itemQty),
                        userId: uid
                    }
                }, { merge: true })
                .then(() => {
                    console.log('Inventory add event logged to Firestore');
                })
                .catch((error) => {
                    console.error('Error logging inventory add event to Firestore:', error);
                });
    
                Alert.alert('Success', 'Product added to inventory!');
                setItemName('');
                setItemQty('');  // Resetting the qty
            })
            .catch((error) => {
                console.error("Error adding or updating document: ", error);
            });
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

    const PurchaseModal = () => {
        return (
            <Modal
                animationType="slide"
                visible={purchaseModalVisible}
                transparent={true}
                onRequestClose={() => {
                setPurchaseModalVisible(!purchaseModalVisible);
            }}>
                <View style={{ backgroundColor: '#0000000aa', flex: 1, justifyContent: 'center' }}>
                    <View style={inv_styles.manual_screen}>
                        <View style={inv_styles.manual_header_container}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold'}}>Enter Card Information</Text>                  
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center',}}>
                            <Text style={{justifyContent: 'center', verticalAlign: 'middle'}}>Card Number: </Text>
                            <TextInput
                                style={[{width: 150, height: 30}, styles.input]}
                                keyboardType='numeric'
                            />
                        </View>
                        <View style={{flexDirection: 'row', alignItems: 'center',}}>
                            <Text style={{justifyContent: 'center', verticalAlign: 'middle'}}>Exp Date: </Text>
                            <TextInput
                                style={[{width: 50, height: 30}, styles.input]}
                                keyboardType='numeric'
                            />
                            <Text style={{justifyContent: 'center', verticalAlign: 'middle', marginLeft: 20}}>CVV: </Text>
                            <TextInput
                                style={[{width: 50, height: 30}, styles.input]}
                                keyboardType='numeric'
                            />
                        </View>
                        <View style={inv_styles.manual_button}>
                            <Pressable>
                                <Text style={[inv_styles.manual_btn_text, {fontSize: 18, fontWeight: '500'}]}>Purchase</Text>
                            </Pressable>
                        </View>
    
                        <View style={inv_styles.manual_buttons_container}>
                            <View style={inv_styles.manual_buttons}> 
                                <Pressable
                                    onPress={() => {
                                        setPurchaseModalVisible(false)
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

    const options = [
        { label: 'Earliest Expiration', value: 'asc-daysLeft-0'},
        { label: 'Furthest Expiration', value: 'desc-daysLeft-1'},
        { label: 'Name (A-Z)', value: 'asc-itemName-2'},
        { label: 'Name (Z-A)', value: 'desc-itemName-3'}
    ]

    const SortByModal = () => {
        return (
            <Modal
                animationType="slide"
                visible={sortModalVisible}
                transparent={true}
                onRequestClose={() => {
                    setSortModalVisible(!sortModalVisible);
                }}>
                <View style={{ backgroundColor: '#0000000aa', flex: 1, justifyContent: 'center' }}>
                    <View style={inv_styles.manual_screen}>
                        <View style={inv_styles.manual_header_container}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold'}}>Sort By: {options[parseInt(sortBy.split('-')[2])].label}</Text>
                        </View>
                        <RadioForm
                            radio_props={options}
                            initial={-1} //initial value of this group
                            onPress={async (value) => {
                                setSortBy(value);
                                try {
                                    await AsyncStorage.setItem('sortBy', value);
                                  } catch (error) {
                                    console.error('Error saving sortBy value to AsyncStorage:', error);
                                  }
                            }} //if the user changes options, set the new value
                        />
                        <View style={{alignItems: 'center', justifyContent: 'center', backgroundColor: '#3F6C51', paddingVertical: 8, borderRadius: 15}}>
                            <Pressable
                                onPress={() => setSortModalVisible(false)}>
                                <Text style={{fontSize: 18, fontWeight: '500', color: 'white',}}>Close</Text>
                            </Pressable>
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
            var queryField = sortBy.split('-')[1]
            var queryOrder = sortBy.split('-')[0]
            const query = userDoc.orderBy(queryField, queryOrder)

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
                 })
                // populate inventory list
                setItemList(inventoryData);
            })
          }
      } catch (error) {
          console.error('Error fetching inventory items:', error);
      }
    };

    const deleteItem = (itemName) => {
        const itemUPC = productDictionary[itemName].UPC;
    
        db.collection('users')
        .doc(uid)
        .collection('items')
        .doc(itemUPC)
        .delete()
        .then(() => {
            const updatedItemList = itemList.filter((item) => item.itemName !== itemName);
            setItemList(updatedItemList);
    
            // Prepare the document reference for the item delete logs
            const currentDate = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD' format
            const itemDeleteLogRef = db.collection('eventLogs').doc('itemDelete').collection('date').doc(currentDate);
    
            // Log the item delete event to Firestore
            itemDeleteLogRef.set({
                [`${new Date().getTime()}`]: { // Unique identifier for each log entry
                    itemName: itemName,
                    itemUPC: itemUPC,
                    userId: uid
                }
            }, { merge: true })
            .then(() => {
                console.log('Item delete event logged to Firestore');
            })
            .catch((error) => {
                console.error('Error logging item delete event to Firestore:', error);
            });
        })
        .catch((error) => {
            console.error('Error deleting item from Firebase:', error);
        });
    };
    

    useEffect(() => {
        const loadSelectedValue = async () => {
            try {
              const value = await AsyncStorage.getItem('sortBy');
              if (value !== null) {
                setSortBy(value);
              }
            } catch (error) {
              console.error('Error loading sortBy value from AsyncStorage:', error);
            }
        }
        loadSelectedValue();
        fetchInventoryItems();
        const fetchUserData = async () => {
            if (auth.currentUser) {
              const userDocRef = db.collection('users').doc(uid);
              userDocRef.get().then(async (doc) => {
                if (doc.exists) {
                    setUserName(doc.data().firstName + ' ' + doc.data().lastName);
                    const userPoints = doc.data().points || 0;
                    setPoints(userPoints);
                } else {
                    console.log('No such document!');
                  }
            })
            }
          };
      
        fetchUserData();
    }, [isFocused, sortBy, manualAddModalVisible, editModalVisible, sortModalVisible]);
  

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={inv_styles.container}>
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly'}}>
                    <Image source={require(`../assets/HAPPY_CAT.png`)} style={inv_styles.cat_icon}/>
                    <View>
                        <Text style={inv_styles.hello_text}>Hello!</Text>
                        <Text style={inv_styles.display_name}>{userName}</Text>
                    </View>
                    <View>
                        <Text style={inv_styles.points}>Coins: {points}</Text>
                        <Pressable style={{borderRadius: 10, marginLeft: 110, height: 20}}
                            onPress={() => {setPurchaseModalVisible(true)}}
                        >
                            <Text style={{fontSize: 8, fontWeight: 'bold', textAlign: 'center'}}>Click To Purchase Coins</Text>
                        </Pressable>
                    </View>
                </View>
                <View style={styles.hz_align_items}>
                    <Text style={[{flex: 1}, styles.header]}>Your Inventory</Text>
                    <Pressable 
                        style={[{marginRight: 10, backgroundColor: '#D9D9D9'}, inv_styles.manual_btn_background]}
                        onPress={() => {
                            setSortModalVisible(true);
                            }}>
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
                {SortByModal()}
                {PurchaseModal()}
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

    manual_button: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3F6C51',
        maxHeight: 40,
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
    },

    points: {
        paddingLeft: 120,
        fontSize: 22,
        fontWeight: "bold",
    }
});

export default InventoryScreen;