import React, { useEffect, useState } from 'react';
import { View, Text} from 'react-native';
import { db } from '../firebaseConfig';

const ItemDetailScreen = ({ route }) => {
    const { upc } = route.params;
    const [productDetails, setProductDetails] = useState(null);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const productRef = db.collection('productDatabase').doc(upc);
                const doc = await productRef.get();
                if (doc.exists) {
                    setProductDetails(doc.data());
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.log("Error fetching product details:", error);
            }
        };

        fetchProductDetails();
    }, [upc]);

    return (
        <View>
            {productDetails ? (
                <Text>{`Product Name: ${productDetails.ProductName}, Brand: ${productDetails.Brand}, Item Size: ${productDetails.ItemSize}`}</Text>
            ) : (
                <Text>Loading...</Text>
            )}
        </View>
    );
};

export default ItemDetailScreen;