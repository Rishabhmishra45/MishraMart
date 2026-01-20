import React, { useContext, useEffect, useState } from "react";
import Tittle from "./Tittle";
import { shopDataContext } from "../context/ShopContext";
import Card from "./Card";

const LatestCollection = () => {
  const { products } = useContext(shopDataContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    const list = Array.isArray(products) ? products : [];
    setLatestProducts(list.slice(0, 8));
  }, [products]);

  return (
    <section className="w-full py-8 sm:py-12 lg:py-16 bg-[color:var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <Tittle text1={"LATEST"} text2={"COLLECTIONS"} />
          <p className="mx-auto text-sm sm:text-base lg:text-lg text-[color:var(--muted)] px-4 max-w-2xl mt-2 sm:mt-3">
            Step Into Style - New Collection Dropping This Season!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
          {latestProducts.slice(0, 4).map((item, index) => (
            <Card
              key={item?._id || index}
              id={item._id}
              name={item.name}
              image={item.image1}
              price={item.price}
              category={item.category}
              index={index}
            />
          ))}
        </div>

        {/* Second row for remaining 4 items */}
        <div className="mt-8 sm:mt-10 lg:mt-12 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
          {latestProducts.slice(4, 8).map((item, index) => (
            <Card
              key={item?._id || index + 4}
              id={item._id}
              name={item.name}
              image={item.image1}
              price={item.price}
              category={item.category}
              index={index + 4}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestCollection;