import React, { useContext, useMemo } from "react";
import { shopDataContext } from "../context/ShopContext";
import Card from "./Card";

const RelatedProducts = ({ currentProduct }) => {
  const { products } = useContext(shopDataContext);

  const relatedProducts = useMemo(() => {
    if (!currentProduct || !Array.isArray(products)) return [];

    const basePrice = currentProduct.price;

    const scoredProducts = products
      .filter((p) => p._id !== currentProduct._id)
      .map((p) => {
        let score = 0;

        // Category match
        if (p.category === currentProduct.category) score += 40;

        // Subcategory match
        if (
          currentProduct.subcategory &&
          p.subcategory === currentProduct.subcategory
        )
          score += 30;

        // Price similarity (+-20%)
        const priceDiff = Math.abs(p.price - basePrice) / basePrice;
        if (priceDiff <= 0.2) score += 15;

        // Size similarity
        if (
          Array.isArray(p.sizes) &&
          Array.isArray(currentProduct.sizes) &&
          p.sizes.length === currentProduct.sizes.length
        )
          score += 10;

        // Bestseller boost
        if (p.bestseller) score += 5;

        return { ...p, score };
      });

    return scoredProducts
      .filter((p) => p.score >= 40) // minimum relevance
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);
  }, [products, currentProduct]);

  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-14">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-cyan-500">
        Recommended For You
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {relatedProducts.map((item, index) => (
          <div
            key={item._id}
            className="flex-shrink-0 scale-[0.9] origin-top"
          >
            <Card
              id={item._id}
              name={item.name}
              image={item.image1}
              price={item.price}
              category={item.category}
              index={index}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
