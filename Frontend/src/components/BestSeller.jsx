import React, { useContext, useEffect, useState } from "react";
import Tittle from "./Tittle";
import { shopDataContext } from "../context/ShopContext";
import Card from "./Card";

const BestSeller = () => {
  const { products } = useContext(shopDataContext);
  const [bestSeller, setBestSeller] = useState([]);

  useEffect(() => {
    const list = Array.isArray(products) ? products : [];
    const filterProduct = list.filter((item) => item?.bestseller);
    setBestSeller(filterProduct.slice(0, 4));
  }, [products]);

  return (
    <section className="w-full py-12 sm:py-16">
      <div className="text-center">
        <Tittle text1={"BEST"} text2={"SELLERS"} />
        <p className="m-auto text-xs sm:text-base md:text-lg px-4 max-w-2xl" style={{ color: "var(--muted)" }}>
          Discover Our Top Picks - Best Sellers Loved by Customers!
        </p>
      </div>

      <div className="mt-10 flex items-center justify-center flex-wrap gap-8 sm:gap-10">
        {bestSeller.map((item, index) => (
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

export default BestSeller;
