import React, { useEffect, useState } from 'react'
import { backendUrl, currency } from "../App";
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const List = ({ token }) => {
  const [list,setList] = useState([]);
  const fetchList = async () =>{
    try {
      const response = await axios.get(`${backendUrl}/api/products/list`)
     if(response.data.success){
       setList(response.data.products);
     }
     else{
      toast.error(response.data.message)
     }
    } catch (error) {
       console.log(error)
       toast.error(error.message)
    }
  }

  const removeProduct = async(id) =>{
    try {
         const response = await axios.post(`${backendUrl}/api/products/remove`,{id},{headers:{token}})
         if(response.data.success){
            toast.success(response.data.message)
            await fetchList();
         }
         else{
             toast.error(response.data.message)
         }
    } catch (error) {
       console.log(error)
       toast.error(error.message)
    }

  }
  useEffect(()=>{
   fetchList()
  },[])
  return (
    <>
      <p className='mb-2'>All Products List</p>
      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Actions</b>
        </div>
        {
          list.map((item, index) => (
            <div className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm' key={index}>
              <img className='w-12' src={item.image && item.image[0] ? item.image[0] : ''} alt="" />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>{currency}{item.price}</p>
              <div className='flex justify-center'>
                <span
                  onClick={() => removeProduct(item._id)}
                  className='cursor-pointer text-red-400 text-lg flex items-center justify-center'
                >
                  <img className='w-5 h-5' src={assets.bin_icon} alt="" />
                </span>
              </div>
            </div>
          ))
        }
      </div>
    </>
  )
}

export default List