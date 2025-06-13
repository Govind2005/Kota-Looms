import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import Product from "@/models/Product";

// configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function DELETE(request) {
  try {
    const { userId } = getAuth(request);
    const isSeller = await authSeller(userId);

    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Not authorized" });
    }

    
    const {id} = await request.json();
    
    if(!id) {
      return NextResponse.json({success: false, message: "Missing product ID"})
    }
    
    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" });
    }

    // OPTIONAL: Delete associated images from Cloudinary if you stored public_id
    // const deletePromises = product.imagePublicIds.map(publicId => 
    //   cloudinary.uploader.destroy(publicId)
    // );
    // await Promise.all(deletePromises);

    await product.deleteOne();

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
