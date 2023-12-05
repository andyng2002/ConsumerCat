import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, Button, TouchableOpacity,TextInput, Image } from 'react-native';
// import { styles } from '../Styles';
import { BarCodeScanner } from 'expo-barcode-scanner'
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';
import { format, addDays } from 'date-fns';

/*
resources: https://www.youtube.com/watch?v=LtbuOgoQJAg
*/

const ScannerScreen = ({ route }) => {
    const [hasPermission, setHasPermission] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { uid } = route.params;
    const [scanning, setScanning] = useState(true);
    const [scannedItem, setScannedItem] = useState(null); // To hold the scanned product details
    const [scannedUPC, setScannedUPC] = useState(null);



    useEffect(() => {
        const getBarCodeScannerPermissions = async () => {
          const { status } = await BarCodeScanner.requestPermissionsAsync();
          setHasPermission(status === 'granted');
        };

        getBarCodeScannerPermissions();
    }, []);

    const increaseQuantity = () => {
        setQuantity(prevQty => prevQty + 1);
    }
    
    const decreaseQuantity = () => {
        if(quantity > 1) {
            setQuantity(prevQty => prevQty - 1);
        }
    }
    
    
    const checkForInventoryDuplicate = (scannedUPC) => {
        // TO-DO: change collection we are cross checking with to the user's inventory db
        const productsRef = db.collection('productDatabase');
        productsRef.where('UPC', '==', scannedUPC).get()
            .then((result) => {
                if(!result.empty) {
                    Alert.alert('Duplicate Item', 'Already have this item in your inventory!', [{text: 'Add anyway'}, {text: `Don't add`}])
                }
            })
            .catch((error) => {
                console.error('Error querying Firestore:', error);
            });
    }

    // change code to this to be able to add scanned items to inventory
    // data var has upc num 
    const handleBarCodeScanned = async ({ type, data }) => {
        if (scanning) {
            setScanning(false);  // Stop further scans until this one is processed
    
            // Existing code to set scanned UPC
            setScannedUPC(data);
            console.log(data);
    
            // Fetch the product name here
            const productRef = db.collection('productDatabase').doc(data);
            const doc = await productRef.get();
            if (doc.exists) {
                const productName = doc.data()['Product Name'];
                Alert.alert(
                    'Product Scanned',
                    `Successfully scanned ${productName}!`,
                    [
                        {
                            text: 'OK',
                            onPress: () => setScanning(true),  // Re-enable scanning
                        },
                    ]
                );
            } else {
                Alert.alert(
                    'Product Scanned',
                    'Product not found in database.',
                    [
                        {
                            text: 'OK',
                            onPress: () => setScanning(true),  // Re-enable scanning
                        },
                    ]
                );
            }
        }
    };

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const productRef = db.collection('productDatabase').doc(scannedUPC);
                const doc = await productRef.get();
                
                if (doc.exists) {
                    const data = doc.data();
                    const productDetails = {
                        brand: data.Brand,
                        productName: data['Product Name']
                    };
                    setScannedItem(productDetails);
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.log("Error fetching product details:", error);
            }
        };
    
        if (scannedUPC) {
            fetchProductDetails();
        }
    }, [scannedUPC]);
    
    

    const addToInventory = () => {
        var itemExpiration = 7;
        const expirationDate = addDays(new Date(), itemExpiration);
        const expirationDateFormatted = format(expirationDate, 'MM/dd/yyyy');
        const boughtDateFormatted = format(new Date(), 'MM/dd/yyyy');

        if (scannedItem && uid && scannedUPC) {  // Make sure all the required data is available
            // Use UPC as the document ID
            const itemRef = db.collection('users').doc(uid).collection('items').doc(scannedUPC);
    
            itemRef.get().then((doc) => {
                if (doc.exists) {
                    // If item already exists, update the quantity
                    const currentQuantity = doc.data().quantity || 0;  // Use 0 as a fallback
                    return itemRef.update({
                        quantity: currentQuantity + quantity  // Adding to existing quantity
                    });
                } else {
                    // If item doesn't exist, create a new entry
                    return itemRef.set({
                        ...scannedItem,
                        itemName: scannedItem.brand + " " + scannedItem.productName,  // Adding itemName field
                        quantity: quantity,  // Also adding quantity
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
    
            setScannedItem(null);
            setScannedUPC(null);  // Resetting the UPC
        } else {
            Alert.alert('Error', 'Could not add product to inventory.');
        }
    };
    
    

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text>Requesting for camera permisson</Text>
            </View>
        )
    }
    
    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text>No access to camera</Text> 
                <Button title={'Allow Camera'} onPress={() => getBarCodeScannerPermissions()}/>
            </View>
        )
    }
    return (
        <View style={styles.container}>
            {/* Instruction Text */}
            <Text style={styles.instructionText}>
                Scan products you want to buy or have bought to add them to your inventory! 
            </Text>
            <Text style={styles.instructionNote}>
                Note: The scanner currently only supports Publix products.
            </Text>

            {/* Barcode Scanner */}
            <View style={styles.scannerContainer}>
                <BarCodeScanner
                    onBarCodeScanned={handleBarCodeScanned}
                    style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.overlay}>
                    <View>
                        <Ionicons name='ios-scan-outline' size={200} color='white' />
                    </View>
                </View>
                {/* {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />} */}
            </View>

            {/* Inventory Display */}
            <View style={styles.inventoryContainer}>
                {/* Here you can add the display logic for the scanned product */}
                {/* <Text>Lettuce</Text>
                <View style={styles.quantityContainer}>
                    <Text>1</Text>
                    <TouchableOpacity style={styles.plusButton}>
                        <Text>+</Text>
                    </TouchableOpacity>
                </View> */}
            </View>

            {scannedItem && (
                <View style={brcd_styles.scannedItemContainer}>
                    <Text style={{ textAlign: 'center' }}>{scannedItem.brand}{'\n'}{scannedItem.productName}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                        <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
                            <Ionicons name='remove' size={22} color='grey' />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 20 }}>{quantity}</Text>
                        <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
                            <Ionicons name='add' size={22} color='grey' />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.addProductButton} onPress={addToInventory}>
                        <Ionicons name='checkmark' size={32} color='white' />
                    </TouchableOpacity>
                </View>
            )}
            {/* Your tab bar remains as it is */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E3FDE0',
        padding: 20,
        justifyContent: 'center',
    },
    addProductButton: {
        backgroundColor: 'green',
        borderRadius: 30,
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    quantityButton: {
        padding: 10,
        backgroundColor: '#f5f5f5',
        borderRadius: 5
    },
    instructionText: {
        marginTop: 25,
        textAlign: 'center',
        fontSize: 16
    },
    instructionNote: {
        marginTop: 20,
        textAlign: 'center',
        marginBottom: 5,
        fontSize: 12
    },
    scannerContainer: {
        flex: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        height: 250,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanSquare: {
        width: 250, 
        height: 250, 
        borderColor: 'lime', 
        borderWidth: 4, 
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    inventoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    plusButton: {
        marginLeft: 10,
        padding: 10,
        backgroundColor: '#3F6C51',
        borderRadius: 5
    }
});

// styles specific to Barcode Scanner Screen
const brcd_styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E3FDE0',
        padding: 20,
    },

    barcodebox: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },

    scanBox: {
        position: 'relative',
        zIndex: 1,
    },
    scannedItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 20,
        width: '100%',
    },
});

export default ScannerScreen;