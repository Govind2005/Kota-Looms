'use client';
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import { SignedIn, SignedOut, useClerk } from "@clerk/nextjs";

const EditProductPage = () => {
  const { getToken } = useAppContext();
  const router = useRouter();
  const { id } = useParams();

  const [files, setFiles] = useState([]);
  const [imageURLs, setImageURLs] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Saree');
  const [price, setPrice] = useState('');
  const [offerPrice, setOfferPrice] = useState('');

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.post(`/api/product/get`, { id }, {
  headers: { Authorization: `Bearer ${token}` },
});

        if (data.success) {
          const product = data.product;
          setName(product.name);
          setDescription(product.description);
          setCategory(product.category);
          setPrice(product.price);
          setOfferPrice(product.offerPrice);
          setImageURLs(product.image);  // existing images
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('id', id); // important
    formData.append('name', name);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('price', price);
    formData.append('offerPrice', offerPrice);

    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const token = await getToken();
      const { data } = await axios.put('/api/product/update', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        toast.success(data.message);
        router.push('/seller/product-list'); // or wherever your list page is
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const RequireSignIn = () => {
    const { openSignIn } = useClerk();
    useEffect(() => {
      openSignIn();
    }, [openSignIn]);
    return null;
  };

  return (
    <>
      <SignedOut><RequireSignIn /></SignedOut>
      <SignedIn>
        <div className="flex-1 min-h-screen flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="md:p-10 p-4 space-y-5 max-w-lg">
            <div>
              <p className="text-base font-medium">Product Image</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {[...Array(4)].map((_, index) => (
                  <label key={index} htmlFor={`image${index}`}>
                    <input
                      onChange={(e) => {
                        const updatedFiles = [...files];
                        updatedFiles[index] = e.target.files[0];
                        setFiles(updatedFiles);
                      }}
                      type="file"
                      id={`image${index}`}
                      hidden
                    />
                    <Image
                      className="max-w-24 cursor-pointer"
                      src={
                        files[index]
                          ? URL.createObjectURL(files[index])
                          : imageURLs[index] || assets.upload_area
                      }
                      alt={`image${index}`}
                      width={100}
                      height={100}
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="product-name" className="font-medium">Product Name</label>
              <input
                id="product-name"
                type="text"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="product-description" className="font-medium">Product Description</label>
              <textarea
                id="product-description"
                className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40 resize-none"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="flex items-center gap-5 flex-wrap">
              <div className="flex flex-col gap-1 w-32">
                <label htmlFor="category" className="font-medium">Category</label>
                <select
                  id="category"
                  className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Saree">Saree</option>
                  <option value="Suit">Suit</option>
                </select>
              </div>
              <div className="flex flex-col gap-1 w-32">
                <label htmlFor="price" className="font-medium">Price</label>
                <input
                  type="number"
                  id="price"
                  className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1 w-32">
                <label htmlFor="offerPrice" className="font-medium">Offer Price</label>
                <input
                  type="number"
                  id="offerPrice"
                  className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500/40"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white font-medium rounded">
              Update
            </button>
          </form>
        </div>
      </SignedIn>
    </>
  );
};

export default EditProductPage;
