import React from 'react';
import ProductCard from './ProductCard';
import '../styles/ProductMasonryGrid.css';

const ProductMasonryGrid = ({ products, onDelete }) => {
    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="pin-masonry">
            {products.map((product) => (
                <div key={product._id || product.id} className="pin-masonry-item">
                    <ProductCard
                        product={product}
                        onDelete={onDelete}
                    />
                </div>
            ))}
        </div>
    );
};

export default ProductMasonryGrid;
