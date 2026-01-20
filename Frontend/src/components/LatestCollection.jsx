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
    <section className="w-full py-12 sm:py-16">
      <div className="text-center">
        <Tittle text1={"LATEST"} text2={"COLLECTIONS"} />
        <p className="m-auto text-xs sm:text-base md:text-lg px-4 max-w-2xl" style={{ color: "var(--muted)" }}>
          Step Into Style - New Collection Dropping This Season!
        </p>
      </div>

      <div className="mt-10 flex items-center justify-center flex-wrap gap-8 sm:gap-10">
        {latestProducts.map((item, index) => (
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
    </section>
  );
};

export default LatestCollection;
