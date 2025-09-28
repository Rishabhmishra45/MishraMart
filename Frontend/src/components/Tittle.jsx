import React from 'react'

const Tittle = ({ text1, text2 }) => {
    return (
        <div className='inline-flex gap-2 items-center text-center mb-3 text-[35px] md:text-[40px]'>
            <p className='text-blue-100'>{text1} <span className='text-[#00D3F3]'>{text2}</span></p>
        </div>
    )
}

export default Tittle
