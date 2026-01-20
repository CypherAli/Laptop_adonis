import React, { useContext } from 'react';
import { FiCheckSquare, FiSquare } from 'react-icons/fi';
import ComparisonContext from '../../context/ComparisonContext';
import './CompareButton.css';

const CompareButton = ({ product, onCompareChange }) => {
    const { toggleCompare, isInCompare } = useContext(ComparisonContext);
    const isComparing = isInCompare(product._id);

    const handleToggleCompare = (e) => {
        e.preventDefault();
        e.stopPropagation();

        toggleCompare(product);

        // Notify parent component if needed
        if (onCompareChange) {
            onCompareChange();
        }
    };

    return (
        <button
            className={`compare-btn ${isComparing ? 'active' : ''}`}
            onClick={handleToggleCompare}
            title={isComparing ? 'Bỏ khỏi so sánh' : 'Thêm vào so sánh'}
        >
            {isComparing ? (
                <>
                    <FiCheckSquare /> Đang so sánh
                </>
            ) : (
                <>
                    <FiSquare /> So sánh
                </>
            )}
        </button>
    );
};

export default CompareButton;
