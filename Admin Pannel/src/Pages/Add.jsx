import React, { useState } from 'react';
import Nav from '../components/Nav';
import Sidebar from '../components/Sidebar';
import upload_image2 from '../assets/upload_image2.png';
import axios from 'axios';

const Add = () => {
  // images
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [image3, setImage3] = useState(null);
  const [image4, setImage4] = useState(null);

  // other product fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [sizes, setSizes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('image1', image1);
    if (image2) formData.append('image2', image2);
    if (image3) formData.append('image3', image3);
    if (image4) formData.append('image4', image4);

    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('category', category);
    formData.append('sizes', JSON.stringify(sizes));

    try {
      const res = await axios.post(
        'http://localhost:6000/api/product/addproduct',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
      console.log(res.data);
      alert('Product added successfully!');
    } catch (err) {
      console.error('Error uploading:', err);
      alert('Upload error');
    }
  };

  // reusable upload box
  const UploadBox = ({ image, setImage }) => (
    <label className='cursor-pointer'>
      <input
        type='file'
        hidden
        onChange={(e) => setImage(e.target.files[0])}
      />
      <div className='w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-md border border-gray-400/40 overflow-hidden flex items-center justify-center hover:border-blue-400 transition-colors'>
        <img
          src={!image ? upload_image2 : URL.createObjectURL(image)}
          alt=''
          className='w-full h-full object-cover'
        />
      </div>
    </label>
  );

  return (
    <div className='w-[100vw] min-h-[100vh] bg-gradient-to-l from-[#141414] to-[#0c2025] text-white overflow-x-hidden relative'>
      <Nav />
      <Sidebar />

      <div className='w-[82%] h-[100%] flex items-start justify-start overflow-x-hidden absolute right-0'>
        <form
          onSubmit={handleSubmit}
          className='w-[100%] md:w-[90%] h-auto mt-[70px] flex flex-col gap-6 py-[40px] px-[30px] md:px-[60px]'
        >
          <div className='text-[25px] md:text-[35px] font-semibold select-none'>
            Add Product Page
          </div>

          <p className='text-[18px] md:text-[22px] font-semibold mt-2 select-none'>
            Upload Images
          </p>

          {/* tightly spaced boxes */}
          <div className='flex gap-3'>
            <UploadBox image={image1} setImage={setImage1} />
            <UploadBox image={image2} setImage={setImage2} />
            <UploadBox image={image3} setImage={setImage3} />
            <UploadBox image={image4} setImage={setImage4} />
          </div>

          <button
            type='submit'
            className='bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-md text-white font-medium mt-4 w-fit'
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Add;
