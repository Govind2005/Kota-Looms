import connectDB from "@/config/db";
import authSeller from "@/lib/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import Product from "@/models/Product";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PUT(request) {
  try {
    const { userId } = getAuth(request);
    const isSeller = await authSeller(userId);
    if (!isSeller) {
      return NextResponse.json({ success: false, message: "Not authorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const id = formData.get("id");
    const name = formData.get("name");
    const description = formData.get("description");
    const category = formData.get("category");
    const price = formData.get("price");
    const offerPrice = formData.get("offerPrice");

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing product ID" }, { status: 400 });
    }

    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }


    const files = formData.getAll("images");
    let image = product.image;

    if (files && files[0]?.size > 0) {
      const result = await Promise.all(
        files.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: "auto" }, (err, res) => {
              if (err) reject(err);
              else resolve(res.secure_url);
            }).end(buffer);
          });
        })
      );
      image = result;
    }

    product.name = name;
    product.description = description;
    product.category = category;
    product.price = Number(price);
    product.offerPrice = Number(offerPrice);
    product.image = image;

    await product.save();

    return NextResponse.json({ success: true, message: "Product updated successfully" });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
