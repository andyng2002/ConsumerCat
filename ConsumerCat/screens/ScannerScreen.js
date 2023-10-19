import React, { useEffect, useState } from 'react';
import { Alert, View, Text, StyleSheet, Button, TouchableOpacity,TextInput, Image } from 'react-native';
// import { styles } from '../Styles';
import { BarCodeScanner } from 'expo-barcode-scanner'
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';

/*
resources: https://www.youtube.com/watch?v=LtbuOgoQJAg
*/

const ScannerScreen = () => {
    const [hasPermission, setHasPermission] = useState(null);
    const [quantity, setQuantity] = useState(1);

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
    const handleBarCodeScanned = ({type, data}) => {
        setScannedUPC(data);
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
        if (scannedItem) {
            // Here you would write your logic to add the scannedItem to the user's inventory in your database.
            // For instance:
            db.collection('userInventory').add(scannedItem);

            Alert.alert('Success', 'Product added to inventory!');
            setScannedItem(null);
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
                    <Text>{scannedItem.brand} - {scannedItem.productName}</Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                        <TouchableOpacity onPress={decreaseQuantity}>
                            <Text style={{ fontSize: 24, marginRight: 10 }}>-</Text>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 20 }}>{quantity}</Text>
                        <TouchableOpacity onPress={increaseQuantity}>
                            <Text style={{ fontSize: 24, marginLeft: 10 }}>+</Text>
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
        padding: 20
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
    instructionText: {
        marginTop: 20,
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16
    },
    scannerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
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