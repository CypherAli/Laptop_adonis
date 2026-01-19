import React from 'react';
import { 
    FiSearch, 
    FiX,
    FiChevronDown,
    FiCheck
} from 'react-icons/fi';
import { 
    MdBrandingWatermark, 
    MdMoney, 
    MdSort, 
    MdHome
} from 'react-icons/md';
import { 
    GiConverseShoe,
    GiRunningShoe,
    GiSonicShoes
} from 'react-icons/gi';
import './FilterSidebar.css';

const FilterSidebar = ({
    tempFilters,
    handleTempFilterChange,
    toggleArrayFilter,
    handleApplyFilters,
    handleClearFilters,
    handleKeyPress,
    brands,
    sizeOptions,
    colorOptions,
    materialOptions,
    activeFiltersCount
}) => {
    // State quản lý sections
    const [expandedSections, setExpandedSections] = React.useState({
        brand: true,
        size: true,
        color: true,
        material: true,
        price: true,
        sort: true
    });

    // Brand data với icons (shoe brands)
    const brandData = {
        'Nike': { icon: <GiRunningShoe />, count: 12 },
        'Adidas': { icon: <GiSonicShoes />, count: 15 },
        'Puma': { icon: <GiConverseShoe />, count: 8 },
        'Converse': { icon: <GiConverseShoe />, count: 6 },
        'Vans': { icon: <GiConverseShoe />, count: 9 },
        'New Balance': { icon: <GiRunningShoe />, count: 7 },
        'Reebok': { icon: <GiSonicShoes />, count: 5 },
        'Skechers': { icon: <GiRunningShoe />, count: 4 },
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <aside className="sidebar">
            <div className="filter-section-new">
                {/* Header */}
                <div className="filter-header-new">
                    <h3>
                        <FiSearch className="header-icon" />
                        SEARCH & FILTER
                    </h3>
                    {activeFiltersCount > 0 && (
                        <span className="active-filters-badge-new">
                            {activeFiltersCount}
                        </span>
                    )}
                </div>
                
                {/* Search Bar */}
                <div className="filter-group-new">
                    <div className="search-box-new">
                        <FiSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search shoes..."
                            value={tempFilters.searchQuery}
                            onChange={(e) => handleTempFilterChange('searchQuery', e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="search-input-new"
                        />
                        {tempFilters.searchQuery && (
                            <button 
                                className="clear-btn"
                                onClick={() => handleTempFilterChange('searchQuery', '')}
                            >
                                <FiX />
                            </button>
                        )}
                    </div>
                </div>

                {/* Brand Filter - Horizontal Scroll */}
                <div className="filter-group-new">
                    <div 
                        className="filter-group-header-new"
                        onClick={() => toggleSection('brand')}
                    >
                        <div className="header-left">
                            <MdBrandingWatermark className="section-icon" />
                            <span>BRAND</span>
                        </div>
                        <FiChevronDown className={`chevron-icon ${expandedSections.brand ? 'expanded' : ''}`} />
                    </div>
                    {expandedSections.brand && (
                        <div className="filter-brand-scroll-container">
                            <div className="filter-brand-list">
                                {brands.map(brand => {
                                    const data = brandData[brand] || { icon: <MdBrandingWatermark />, count: 0 };
                                    const isSelected = tempFilters.brands.includes(brand);
                                    return (
                                        <div 
                                            key={brand} 
                                            className={`brand-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => toggleArrayFilter('brands', brand)}
                                        >
                                            <div className="brand-icon-wrapper">
                                                {data.icon}
                                            </div>
                                            <div className="brand-info">
                                                <span className="brand-name">{brand}</span>
                                                <span className="brand-count">{data.count}</span>
                                            </div>
                                            {isSelected && (
                                                <div className="check-badge-new">
                                                    <FiCheck />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Size Filter - Grid Selection */}
                <div className="filter-group-new">
                    <div 
                        className="filter-group-header-new"
                        onClick={() => toggleSection('size')}
                    >
                        <div className="header-left">
                            <GiConverseShoe className="section-icon" />
                            <span>SIZE</span>
                        </div>
                        <FiChevronDown className={`chevron-icon ${expandedSections.size ? 'expanded' : ''}`} />
                    </div>
                    {expandedSections.size && (
                        <div className="filter-options-grid">
                            {sizeOptions && sizeOptions.map(size => {
                                const isSelected = tempFilters.sizes && tempFilters.sizes.includes(size);
                                return (
                                    <div 
                                        key={size} 
                                        className={`option-chip ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleArrayFilter('sizes', size)}
                                    >
                                        <span>{size}</span>
                                        {isSelected && <FiCheck className="check-icon" />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Color Filter - Color Palette */}
                <div className="filter-group-new">
                    <div 
                        className="filter-group-header-new"
                        onClick={() => toggleSection('color')}
                    >
                        <div className="header-left">
                            <span className="section-icon">🎨</span>
                            <span>COLOR</span>
                        </div>
                        <FiChevronDown className={`chevron-icon ${expandedSections.color ? 'expanded' : ''}`} />
                    </div>
                    {expandedSections.color && (
                        <div className="filter-options-grid">
                            {colorOptions && colorOptions.map(color => {
                                const isSelected = tempFilters.colors && tempFilters.colors.includes(color);
                                return (
                                    <div 
                                        key={color} 
                                        className={`option-chip ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleArrayFilter('colors', color)}
                                    >
                                        <span>{color}</span>
                                        {isSelected && <FiCheck className="check-icon" />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Material Filter - List */}
                <div className="filter-group-new">
                    <div 
                        className="filter-group-header-new"
                        onClick={() => toggleSection('material')}
                    >
                        <div className="header-left">
                            <span className="section-icon">✨</span>
                            <span>MATERIAL</span>
                        </div>
                        <FiChevronDown className={`chevron-icon ${expandedSections.material ? 'expanded' : ''}`} />
                    </div>
                    {expandedSections.material && (
                        <div className="filter-options-grid">
                            {materialOptions && materialOptions.map(material => {
                                const isSelected = tempFilters.materials && tempFilters.materials.includes(material);
                                return (
                                    <div 
                                        key={material} 
                                        className={`option-chip ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleArrayFilter('materials', material)}
                                    >
                                        <span>{material}</span>
                                        {isSelected && <FiCheck className="check-icon" />}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Price Range - Range Slider */}
                <div className="filter-group-new">
                    <div 
                        className="filter-group-header-new"
                        onClick={() => toggleSection('price')}
                    >
                        <div className="header-left">
                            <MdMoney className="section-icon" />
                            <span>PRICE RANGE</span>
                        </div>
                        <FiChevronDown className={`chevron-icon ${expandedSections.price ? 'expanded' : ''}`} />
                    </div>
                    {expandedSections.price && (
                        <div className="filter-price-container">
                            <div className="price-inputs-new">
                                <div className="price-input-wrapper">
                                    <label>FROM</label>
                                    <input 
                                        type="text" 
                                        placeholder="500,000đ"
                                        value={tempFilters.minPrice ? `${parseInt(tempFilters.minPrice).toLocaleString()}đ` : ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^\d]/g, '');
                                            handleTempFilterChange('minPrice', value);
                                        }}
                                        onKeyPress={handleKeyPress}
                                    />
                                </div>
                                <div className="price-input-wrapper">
                                    <label>TO</label>
                                    <input 
                                        type="text" 
                                        placeholder="10,000,000đ"
                                        value={tempFilters.maxPrice ? `${parseInt(tempFilters.maxPrice).toLocaleString()}đ` : ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^\d]/g, '');
                                            handleTempFilterChange('maxPrice', value);
                                        }}
                                        onKeyPress={handleKeyPress}
                                    />
                                    <FiChevronDown className="dropdown-icon-new" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* In Stock Checkbox */}
                <div className="filter-group-new checkbox-group-new">
                    <label className="checkbox-label-new">
                        <input 
                            type="checkbox" 
                            checked={tempFilters.inStock}
                            onChange={(e) => handleTempFilterChange('inStock', e.target.checked)}
                        />
                        <MdHome className="checkbox-icon-new" />
                        <span>Only show in-stock products</span>
                    </label>
                </div>

                {/* Sort By - Dropdown */}
                <div className="filter-group-new">
                    <div 
                        className="filter-group-header-new"
                        onClick={() => toggleSection('sort')}
                    >
                        <div className="header-left">
                            <MdSort className="section-icon" />
                            <span>SORT BY</span>
                        </div>
                        <FiChevronDown className={`chevron-icon ${expandedSections.sort ? 'expanded' : ''}`} />
                    </div>
                    {expandedSections.sort && (
                        <select 
                            value={tempFilters.sortBy} 
                            onChange={(e) => handleTempFilterChange('sortBy', e.target.value)}
                            className="sort-select-new"
                        >
                            <option value="">Newest</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="popularity">Most Popular</option>
                        </select>
                    )}
                </div>

            </div>
            
            {/* Action Buttons - Fixed Outside Scroll */}
            <div className="filter-actions-fixed">
                <button 
                    className="apply-btn-new"
                    onClick={handleApplyFilters}
                >
                    <FiCheck /> APPLY
                </button>

                <button 
                    className="clear-btn-new"
                    onClick={handleClearFilters}
                >
                    <FiX /> CLEAR
                </button>
            </div>
        </aside>
    );
};

export default FilterSidebar;
