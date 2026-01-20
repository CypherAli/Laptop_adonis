import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import WishlistContext from '../../../context/WishlistContext';
import CartContext from '../../../context/CartContext';
import { PLACEHOLDER_IMAGES } from '../../../utils/placeholder';
import './WishlistPage.css';

const WishlistPage = () => {
    const { wishlist, removeFromWishlist, clearWishlist } = useContext(WishlistContext);
    const { addToCart } = useContext(CartContext);
    const navigate = useNavigate();

    // eslint-disable-next-line no-unused-vars
    const handleAddToCart = (product) => {
        addToCart(product);
        alert(`${product.name} has been added to cart!`);
    };

    const handleMoveToCart = (product) => {
        addToCart(product);
        removeFromWishlist(product._id);
        alert(`${product.name} has been moved to cart!`);
    };

    if (wishlist.length === 0) {
        return (
            <div className="wishlist-page">
                <div className="wishlist-empty">
                    <div className="empty-icon">❤️</div>
                    <h2>Your wishlist is empty</h2>
                    <p>Add products you love to view them later!</p>
                    <button className="btn-shop" onClick={() => navigate('/')}>
                        Explore Products
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist-page">
            <div className="wishlist-header">
                <div className="header-left">
                    <h1>
                        <span className="heart-icon">❤️</span>
                        My Wishlist
                    </h1>
                    <span className="wishlist-count">{wishlist.length} items</span>
                </div>
                <button className="btn-clear-all" onClick={clearWishlist}>
                    Delete all
                </button>
            </div>

            <div className="wishlist-grid">
                {wishlist.map(product => (
                    <div key={product._id} className="wishlist-card">
                        <button
                            className="btn-remove-item"
                            onClick={() => removeFromWishlist(product._id)}
                            title="Remove from wishlist"
                        >
                            ✕
                        </button>

                        <div className="wishlist-image-wrapper">
                            <img 
                                src={product.imageUrl || PLACEHOLDER_IMAGES.product} 
                                alt={product.name}
                                className="wishlist-image"
                            />
                            {(!product.stock || product.stock <= 0) && (
                                <div className="out-of-stock-overlay">
                                    <span>Hết hàng</span>
                                </div>
                            )}
                        </div>

                        <div className="wishlist-info">
                            <h3 className="wishlist-product-name">{product.name}</h3>
                            <p className="wishlist-brand">{product.brand}</p>
                            
                            <div className="wishlist-price">
                                <span className="price-value">
                                    {product.price.toLocaleString()} VNĐ
                                </span>
                            </div>

                            <div className="wishlist-stock">
                                {(product.stock && product.stock > 0) ? (
                                    <span className="in-stock">
                                        ✓ Còn {product.stock} sản phẩm
                                    </span>
                                ) : (
                                    <span className="out-of-stock">
                                        ✕ Hết hàng
                                    </span>
                                )}
                            </div>

                            <div className="wishlist-actions">
                                <button
                                    className="btn-move-to-cart"
                                    onClick={() => handleMoveToCart(product)}
                                    disabled={!product.stock || product.stock <= 0}
                                >
                                    Add to cart
                                </button>
                                <button
                                    className="btn-remove"
                                    onClick={() => removeFromWishlist(product._id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>

                        {product.addedAt && (
                            <div className="added-date">
                                Đã thêm: {new Date(product.addedAt).toLocaleDateString('vi-VN')}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default WishlistPage;
