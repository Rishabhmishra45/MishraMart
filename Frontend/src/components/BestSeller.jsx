import React, { useContext, useEffect, useState } from 'react'
import Tittle from './Tittle'
import { shopDataContext } from '../context/ShopContext';
import Card from './Card';

const BestSeller = () => {
  let { products } = useContext(shopDataContext);
  let [bestSeller, setBestSeller] = useState([])

  useEffect(() => {
    let filterProduct = products.filter((item) => item.bestseller)
    setBestSeller(filterProduct.slice(0, 4));
  }, [products])
  return (
    <div>
      <div className='h-[8%] w-[100%] text-center mt-[50px]'>
        <Tittle text1={"BEST"} text2={"SELLERS"} />
        <p className='w-[100%] m-auto text-[13px] md:text-[20px] px-[10px] text-blue-100'>Discover Our Top Picks - Best Sellers Loved by Customers!
        </p>
      </div>
      <div className='w-[100%] h-[50%] mt-[30px] flex items-center justify-center flex-wrap gap-[50px]'>
        {
          bestSeller.map((item, index) => (
            <Card key={index} id={item._id} name={item.name} image={item.image1} price={item.price} />
          ))
        }
      </div>
    </div>
  )
}

export default BestSeller
