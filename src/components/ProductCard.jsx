import React from "react";
import { Link, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
import { FiShoppingCart, FiEye } from "react-icons/fi";
import { MdOutlineCategory } from "react-icons/md";
// import { addToCart } from "../redux/cartSlice";
// import { toast } from "react-toastify";

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  const productImage =
    product.images?.[0] || product.image || "https://via.placeholder.com/300";

  const handleBuyNow = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const productData = {
      id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: productImage,
    };

    // dispatch(
    //   addToCart({
    //     product: product._id,
    //     name: product.name,
    //     price: product.price,
    //     image: productImage,
    //     quantity: 1,
    //   }),
    // );

    navigate("/checkout", { state: { product: productData } });
    // toast.info(" جاري التوجه لصفحة الدفع");
    confirm(" جاري التوجه لصفحة الدفع");
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
      <div className="relative overflow-hidden h-56">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-green-700 text-white px-2 py-1 rounded-lg text-sm font-semibold">
          {product.price} جنيه
        </div>
        {/* عرض عدد الصور المتاحة */}
        {product.images && product.images.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            📸 {product.images.length} صور
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center text-gray-300 text-sm mb-2">
          <MdOutlineCategory className="ml-1" />
          <span>{product.category}</span>
        </div>
        <h3 className="text-lg font-semibold mb-2 line-clamp-1 text-gray-200">
          {product.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description.replace(/<[^>]*>/g, "").substring(0, 100)}...
        </p>
        <div className="flex justify-between items-center">
          <Link
            to={`/product/${product._id}`}
            className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <FiEye />
            <span>تفاصيل</span>
          </Link>
          <button
            onClick={handleBuyNow}
            className="flex items-center space-x-1 bg-yellow-600 text-white px-3 py-2 rounded-lg hover:bg-yellow-700 transition"
          >
            <FiShoppingCart />
            <span>شراء الآن</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
