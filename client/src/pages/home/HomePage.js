import React, { useState, useContext, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import CartContext from '../../context/CartContext';
import WishlistContext from '../../context/WishlistContext';
import { useToast } from '../../components/common/Toast';
import Loading from '../../components/loading/Loading';
import HeroBanner from '../../components/common/HeroBanner';
import BestSellers from '../../components/product/BestSellers';
import Testimonials from '../../components/common/Testimonials';
import CompareBar from '../../components/comparison/CompareBar';
import FilterSidebar from '../../components/sidebar/FilterSidebar';
import AnimatedProductCard from '../../components/product/AnimatedProductCard';
import QuickViewModal from '../../components/modal/QuickViewModal';
import { BRANDS, SIZE_OPTIONS, COLOR_OPTIONS, MATERIAL_OPTIONS } from '../../utils/constants';
import { scrollToElement } from '../../utils/helpers';
import useProducts from '../../hooks/useProducts';
import './HomePage.professional.css';

const HomePage = () => {
    const location = useLocation();
    const [selectedProduct, setSelectedProduct] = useState(null); // For Quick View modal
    
    // Temporary filters - chỉ lưu trong UI, chưa apply
    const [tempFilters, setTempFilters] = useState({
        search: '',
        brands: [], // Array để chọn nhiều brands
        sizes: [], // Array để chọn nhiều sizes
        colors: [], // Array để chọn nhiều colors
        materials: [], // Array để chọn nhiều materials
        minPrice: '',
        maxPrice: '',
        inStock: false,
        sortBy: ''
    });

    const { addToCart } = useContext(CartContext);
    const { toggleWishlist, isInWishlist } = useContext(WishlistContext);
    const toast = useToast();

    // Use custom hook for product fetching and filtering
    const {
        products,
        loading,
        error,
        currentPage,
        setCurrentPage,
        totalPages,
        totalProducts,
        updateFilter,
        resetFilters
    } = useProducts({ 
        search: '',
        size: '',
        color: '',
        material: '',
        minPrice: '',
        maxPrice: '',
        inStock: false,
        sortBy: ''
    });

    // Available filter options (bỏ 'All', chỉ lấy các option thực)
    const brands = BRANDS.filter(b => b !== 'All');
    const sizeOptions = SIZE_OPTIONS.filter(s => s !== 'All');
    const colorOptions = COLOR_OPTIONS.filter(c => c !== 'All');
    const materialOptions = MATERIAL_OPTIONS.filter(m => m !== 'All');

    // Handle URL search query parameter - only set temp filter, don't apply yet
    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const searchQuery = searchParams.get('search');
        
        if (searchQuery) {
            setTempFilters(prev => ({ ...prev, search: searchQuery }));
            
            // Auto-apply search when coming from header
            updateFilter('search', searchQuery);
            
            // Scroll to products
            setTimeout(() => {
                const productsSection = document.getElementById('products-section');
                if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 500);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.search]);

    // Calculate active filters count
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (tempFilters.searchQuery) count++;
        count += tempFilters.brands.length;
        count += tempFilters.sizes.length;
        count += tempFilters.colors.length;
        count += tempFilters.materials.length;
        if (tempFilters.minPrice || tempFilters.maxPrice) count++;
        if (tempFilters.inStock) count++;
        if (tempFilters.sortBy) count++;
        return count;
    }, [tempFilters]);

    // Handle temporary filter changes (chưa apply)
    const handleTempFilterChange = (filterName, value) => {
        setTempFilters(prev => ({ ...prev, [filterName]: value }));
    };

    // Toggle multiple selection (brands, sizes, colors, materials)
    const toggleArrayFilter = (filterName, value) => {
        setTempFilters(prev => {
            const currentArray = prev[filterName];
            const newArray = currentArray.includes(value)
                ? currentArray.filter(item => item !== value)
                : [...currentArray, value];
            return { ...prev, [filterName]: newArray };
        });
    };

    // Apply all filters when clicking "Tìm kiếm"
    const handleApplyFilters = () => {
        // Convert arrays to comma-separated strings for API
        const brandString = tempFilters.brands.join(',');
        const sizeString = tempFilters.sizes.join(',');
        const colorString = tempFilters.colors.join(',');
        const materialString = tempFilters.materials.join(',');

        // Apply all filters at once
        updateFilter('search', tempFilters.search);
        updateFilter('brand', brandString);
        updateFilter('size', sizeString);
        updateFilter('color', colorString);
        updateFilter('material', materialString);
        updateFilter('minPrice', tempFilters.minPrice);
        updateFilter('maxPrice', tempFilters.maxPrice);
        updateFilter('inStock', tempFilters.inStock);
        updateFilter('sortBy', tempFilters.sortBy);

        // Show notification
        const filterCount = [
            tempFilters.brands.length,
            tempFilters.sizes.length,
            tempFilters.colors.length,
            tempFilters.materials.length,
            tempFilters.search ? 1 : 0,
            tempFilters.minPrice ? 1 : 0,
            tempFilters.maxPrice ? 1 : 0
        ].reduce((a, b) => a + b, 0);

        if (filterCount > 0) {
            toast.success(`Applied ${filterCount} filters`);
        }

        // Scroll to products
        setTimeout(() => {
            const productsGrid = document.querySelector('.product-grid');
            if (productsGrid) {
                productsGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 300);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleApplyFilters();
        }
    };

    const handleClearFilters = () => {
        // Clear temporary filters
        setTempFilters({
            searchQuery: '',
            brands: [],
            sizes: [],
            colors: [],
            materials: [],
            minPrice: '',
            maxPrice: '',
            inStock: false,
            sortBy: ''
        });
        
        // Clear applied filters
        resetFilters();
        toast.info('Cleared all filters');
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Scroll lên đầu section products, không về top của page
        const productsSection = document.querySelector('.homepage-container');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (loading) return <Loading message="Loading products..." size="large" />;
    
    if (error) return (
        <div className="error-container">
            <h1>❌ Lỗi</h1>
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-btn">
                🔄 Thử lại
            </button>
        </div>
    );

    return (
        <>
            <HeroBanner 
                onBrandClick={(brand) => {
                    // Add brand to temporary filters
                    toggleArrayFilter('brands', brand);
                    toast.info(`Selected brand: ${brand}. Click "Search" to apply."`);
                    // Scroll to products section
                    setTimeout(() => {
                        scrollToElement('.homepage-container');
                    }, 100);
                }}
            />
            
            {/* Best Sellers Section */}
            <BestSellers />
            
            <div id="products-section" className="homepage-container">
                {/* Sidebar Filters - New Component */}
                <FilterSidebar
                    tempFilters={tempFilters}
                    handleTempFilterChange={handleTempFilterChange}
                    toggleArrayFilter={toggleArrayFilter}
                    handleApplyFilters={handleApplyFilters}
                    handleClearFilters={handleClearFilters}
                    handleKeyPress={handleKeyPress}
                    brands={brands}
                    sizeOptions={sizeOptions}
                    colorOptions={colorOptions}
                    materialOptions={materialOptions}
                    activeFiltersCount={activeFiltersCount}
                />

            {/* Main Content */}
            <main className="main-content">
                <motion.div 
                    className="page-header"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.h1
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                    >
                        Shoes
                    </motion.h1>
                    <motion.p 
                        className="product-count"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                    >
                        {totalProducts} products
                    </motion.p>
                </motion.div>

                {/* Display Selected Filters with Animation */}
                {(tempFilters.brands.length > 0 || tempFilters.sizes.length > 0 || tempFilters.colors.length > 0 || tempFilters.materials.length > 0 || tempFilters.search) && (
                    <motion.div 
                        className="selected-filters"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <strong>Đã chọn:</strong>
                        {tempFilters.search && (
                            <motion.span 
                                className="filter-tag"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                            >
                                {tempFilters.search}
                            </motion.span>
                        )}
                        {tempFilters.brands.map((b, i) => (
                            <motion.span 
                                key={b} 
                                className="filter-tag"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: i * 0.05, type: "spring" }}
                            >
                                {b}
                            </motion.span>
                        ))}
                        {tempFilters.sizes.map((s, i) => (
                            <motion.span 
                                key={s} 
                                className="filter-tag"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: i * 0.05, type: "spring" }}
                            >
                                Size {s}
                            </motion.span>
                        ))}
                        {tempFilters.colors.map((c, i) => (
                            <motion.span 
                                key={c} 
                                className="filter-tag"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: i * 0.05, type: "spring" }}
                            >
                                {c}
                            </motion.span>
                        ))}
                        {tempFilters.materials.map((m, i) => (
                            <motion.span 
                                key={m} 
                                className="filter-tag"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: i * 0.05, type: "spring" }}
                            >
                                {m}
                            </motion.span>
                        ))}
                        <span className="filter-note">(Click "Search" to apply)</span>
                    </motion.div>
                )}

                {/* Product Grid with Framer Motion */}
                <motion.div 
                    className="product-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {products.length === 0 ? (
                        <motion.p 
                            className="no-products"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            No products available.
                        </motion.p>
                    ) : (
                        products.map((product, index) => (
                            <AnimatedProductCard
                                key={product._id}
                                product={product}
                                index={index}
                                onQuickView={setSelectedProduct}
                                onAddToCart={(prod) => {
                                    addToCart(prod);
                                    toast.success(`Added ${prod.name} to cart!`);
                                }}
                                onToggleWishlist={toggleWishlist}
                                isInWishlist={isInWishlist}
                            />
                        ))
                    )}
                </motion.div>

                {/* Pagination with Animation */}
                {totalPages > 1 && (
                    <motion.div 
                        className="pagination"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <motion.button 
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ← Prev
                        </motion.button>

                        {[...Array(totalPages)].map((_, index) => (
                            <motion.button
                                key={index + 1}
                                className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                onClick={() => handlePageChange(index + 1)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                {index + 1}
                            </motion.button>
                        ))}

                        <motion.button 
                            className="page-btn"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Next →
                        </motion.button>
                    </motion.div>
                )}
            </main>
            </div>

            {/* Quick View Modal */}
            {selectedProduct && (
                <QuickViewModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={(product) => {
                        addToCart(product);
                        toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
                    }}
                />
            )}
            
            {/* Testimonials Section */}
            <Testimonials />
            
            {/* Compare Bar (Bottom Sticky) */}
            <CompareBar />
        </>
    );
};

export default HomePage;