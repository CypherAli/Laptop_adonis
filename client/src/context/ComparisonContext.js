import React, { createContext, useState, useEffect } from 'react';

const ComparisonContext = createContext();

export const ComparisonProvider = ({ children }) => {
    const [compareList, setCompareList] = useState([]);
    const MAX_COMPARE = 4; // Maximum products to compare

    // Load comparison list from localStorage on mount
    useEffect(() => {
        try {
            const savedList = localStorage.getItem('compareList');
            if (savedList) {
                const parsedList = JSON.parse(savedList);
                if (Array.isArray(parsedList)) {
                    setCompareList(parsedList);
                }
            }
        } catch (error) {
            console.error('Failed to load comparison list:', error);
            localStorage.removeItem('compareList');
        }
    }, []);

    // Save to localStorage whenever compareList changes
    useEffect(() => {
        localStorage.setItem('compareList', JSON.stringify(compareList));
    }, [compareList]);

    // Add product to comparison
    const addToCompare = (product) => {
        setCompareList(prev => {
            // Check if already in list
            if (prev.find(item => item._id === product._id)) {
                return prev;
            }
            
            // Check max limit
            if (prev.length >= MAX_COMPARE) {
                alert(`Bạn chỉ có thể so sánh tối đa ${MAX_COMPARE} sản phẩm!`);
                return prev;
            }

            return [...prev, {
                _id: product._id,
                name: product.name,
                brand: product.brand,
                category: product.category,
                basePrice: product.basePrice,
                images: product.images,
                variants: product.variants,
                features: product.features,
                rating: product.rating,
                addedAt: new Date().toISOString()
            }];
        });
    };

    // Remove product from comparison
    const removeFromCompare = (productId) => {
        setCompareList(prev => prev.filter(item => item._id !== productId));
    };

    // Clear all comparison
    const clearCompare = () => {
        setCompareList([]);
        localStorage.removeItem('compareList');
    };

    // Check if product is in comparison
    const isInCompare = (productId) => {
        return compareList.some(item => item._id === productId);
    };

    // Toggle product in comparison
    const toggleCompare = (product) => {
        if (isInCompare(product._id)) {
            removeFromCompare(product._id);
        } else {
            addToCompare(product);
        }
    };

    return (
        <ComparisonContext.Provider value={{
            compareList,
            addToCompare,
            removeFromCompare,
            clearCompare,
            isInCompare,
            toggleCompare,
            maxCompare: MAX_COMPARE
        }}>
            {children}
        </ComparisonContext.Provider>
    );
};

export default ComparisonContext;
