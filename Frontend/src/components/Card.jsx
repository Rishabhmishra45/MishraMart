import React, { useContext } from 'react'
import { shopDataContext } from '../context/ShopContext';

const Card = ({ name, image, id, price }) => {
    let { currency } = useContext(shopDataContext);
    return (
        <div className='w-[300px] max-w-[90%] h-[400px] bg-[#ffffff0a] backdrop:blur-lg rounded-lg hover:scale-[102%] flex items-start justify-start flex-col p-[10px] cursor-pointer border-[1px] border-[#80808049]'>
            <img src={image} alt="" className='w-[100%] h-[80%] rounded-sm object-cover' />
            <div className='text-[#c3f6fa] text-[18px] py-[10px]'>{name}</div>
            <div className='text-[#f3fafa] text-[14px]'>{currency} {price}</div>
        </div>
    )
}

export default Card
