import { useState, useEffect, useCallback } from 'react';
import axios from '../api/axiosConfig';
import useDebounce from './useDebounce';

/**
 * Custom hook để fetch products với filters và pagination
 * Giúp tái sử dụng logic ở nhiều components
 */
export const useProducts = (initialFilters = {}, initialPage = 1) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [filters, setFilters] = useState(initialFilters);

    // Debounce cho minPrice và maxPrice để tránh gọi API quá nhiều khi nhập số
    const debouncedMinPrice = useDebounce(filters.minPrice, 800);
    const debouncedMaxPrice = useDebounce(filters.maxPrice, 800);

    useEffect(() => {
        fetchProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, filters.search, filters.brand, filters.size, filters.color, filters.material, debouncedMinPrice, debouncedMaxPrice, filters.inStock, filters.sortBy]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = { page: currentPage, limit: 12 };

            // Add filters với giá trị debounced cho minPrice và maxPrice
            Object.keys(filters).forEach(key => {
                let value = filters[key];
                
                // Sử dụng giá trị debounced cho price
                if (key === 'minPrice') value = debouncedMinPrice;
                if (key === 'maxPrice') value = debouncedMaxPrice;
                
                if (value && value !== 'All') {
                    params[key] = value;
                }
            });

            const res = await axios.get('/products', { params });

            if (Array.isArray(res.data)) {
                setProducts(res.data);
                setTotalProducts(res.data.length);
                setTotalPages(1);
            } else {
                setProducts(res.data.products || []);
                const newTotalPages = res.data.totalPages || 1;
                setTotalPages(newTotalPages);
                setTotalProducts(res.data.totalProducts || 0);
                
                // Nếu trang hiện tại lớn hơn tổng số trang (sau khi filter), tự động chuyển về trang cuối
                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(newTotalPages);
                }
            }
            setError(null);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('Không thể tải sản phẩm. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        // Reset về trang 1 khi thay đổi filter để tránh trang không có data
        setCurrentPage(1);
    }, []);

    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
        setCurrentPage(1);
    }, [initialFilters]);

    return {
        products,
        loading,
        error,
        currentPage,
        totalPages,
        totalProducts,
        filters,
        setCurrentPage,
        updateFilter,
        resetFilters,
        refetch: fetchProducts
    };
};

export default useProducts;
