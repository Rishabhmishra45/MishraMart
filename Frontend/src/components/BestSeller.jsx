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
    <section className="w-full py-8 sm:py-12 lg:py-16 bg-[color:var(--background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8 lg:mb-10">
          <Tittle text1={"BEST"} text2={"SELLERS"} />
          <p className="mx-auto text-sm sm:text-base lg:text-lg text-[color:var(--muted)] px-4 max-w-2xl mt-2 sm:mt-3">
            Discover Our Top Picks - Best Sellers Loved by Customers!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 justify-items-center">
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
      </div>
    </section>
  );
};

export default BestSeller;