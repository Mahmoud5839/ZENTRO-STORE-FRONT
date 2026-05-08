import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
// import { toast } from "react-toastify";
import {
  FiMinus,
  FiPlus,
  FiCheck,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiShoppingCart,
} from "react-icons/fi";
import {
  MdOutlineCategory,
  MdInventory,
  MdStar,
  MdStarHalf,
} from "react-icons/md";
import api from "../services/api";
import { addToCart } from "../redux/cartSlice";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // إضافة إلى عربة التسوق
  const addToCartHandler = () => {
    const images = product.images || [product.image];
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        price: product.price,
        image: images[0] || "https://via.placeholder.com/300",
        quantity: quantity,
      }),
    );
    setAddedToCart(true);
    // toast.success(" تم إضافة المنتج إلى السلة");
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // طلب مباشر (يودي لصفحة الدفع)
  const directOrderHandler = () => {
    console.log("directOrderHandler called, userInfo:", userInfo);

    if (!userInfo) {
      // toast.info(" يرجى تسجيل الدخول أولاً");
      navigate("/login", { state: { from: `/product/${id}`, quantity } });
    } else {
      const images = product.images || [product.image];
      console.log("Navigating to /checkout with product:", product._id);

      navigate("/checkout", {
        state: {
          product: {
            id: product._id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            image: images[0] || "https://via.placeholder.com/300",
          },
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-3xl text-red-600">المنتج غير موجود</h2>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image || "https://via.placeholder.com/500"];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Product Main Card */}
        <div className="rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-10 p-6 md:p-8">
            {/* Right Column - Images Gallery */}
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden bg-gray-100">
                <Swiper
                  spaceBetween={10}
                  navigation={true}
                  thumbs={{ swiper: thumbsSwiper }}
                  modules={[Navigation, Thumbs]}
                  className="main-swiper"
                >
                  {images.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <img
                        src={img}
                        alt={`${product.name} - ${idx + 1}`}
                        className="w-full h-96 object-contain"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>

              {images.length > 1 && (
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={10}
                  slidesPerView={4}
                  freeMode={true}
                  watchSlidesProgress={true}
                  modules={[Navigation, Thumbs]}
                  className="thumbs-swiper"
                >
                  {images.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <div className="cursor-pointer rounded-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition">
                        <img
                          src={img}
                          alt={`Thumb ${idx + 1}`}
                          className="w-full h-20 object-cover"
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              )}
            </div>

            {/* Left Column - Product Info */}
            <div className="space-y-6">
              {/* Product Title & Category */}
              <div className="border-b pb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-200 mb-3">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1">
                    <MdOutlineCategory className="text-xl" />
                    <span>{product.category}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MdInventory className="text-xl" />
                    <span>المتبقي: {product.countInStock} قطعة</span>
                  </div>
                </div>
              </div>

              {/* Rating Placeholder */}
              <div className="flex items-center gap-2 text-yellow-400">
                <div className="flex">
                  <MdStar />
                  <MdStar />
                  <MdStar />
                  <MdStar />
                  <MdStarHalf />
                </div>
                <span className="text-gray-500 text-sm">(4.5 - 127 تقييم)</span>
              </div>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed">
                {product.description ||
                  "وصف المنتج غير متوفر حالياً. يرجى التواصل معنا لمزيد من التفاصيل."}
              </p>

              {/* Price */}
              <div className="bg-green-200 rounded-xl p-4">
                <div className="text-4xl font-bold text-green-600">
                  ${product.price}
                </div>
                <p className="text-gray-500 text-sm mt-1">الشحن مجانا</p>
              </div>

              {/* Quantity Selector */}
              {product.countInStock > 0 && (
                <div className="space-y-3 rounded-md shadow-2xl p-3">
                  <label className="block text-gray-300 font-medium">
                    الكمية المطلوبة
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 rounded-lg">
                      <button
                        onClick={() =>
                          quantity > 1 && setQuantity(quantity - 1)
                        }
                        className="px-4 py-2 text-gray-200 hover:bg-gray-600 transition rounded-r-lg"
                      >
                        <FiMinus />
                      </button>
                      <span className="w-16 text-center text-gray-300 font-semibold">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          quantity < product.countInStock &&
                          setQuantity(quantity + 1)
                        }
                        className="px-4 py-2 text-gray-200 hover:bg-gray-600 transition rounded-l-lg"
                      >
                        <FiPlus />
                      </button>
                    </div>
                    <span className="text-gray-300 text-sm">
                      أقصى كمية متاحة: {product.countInStock}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Add to Cart Button */}
                <button
                  onClick={addToCartHandler}
                  disabled={product.countInStock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                    addedToCart
                      ? "bg-green-500 text-white"
                      : "bg-gray-800 text-white hover:bg-gray-900"
                  } ${
                    product.countInStock === 0
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <FiCheck />
                      تم الإضافة
                    </>
                  ) : (
                    <>
                      <FiShoppingCart />
                      أضف إلى السلة
                    </>
                  )}
                </button>

                {/* Direct Order Button */}
                {product.countInStock > 0 ? (
                  <button
                    onClick={directOrderHandler}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    طلب الآن
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 bg-gray-400 text-white py-4 rounded-xl font-bold text-lg cursor-not-allowed"
                  >
                    غير متوفر حالياً
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <FiTruck className="text-4xl text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-lg mb-2">توصيل سريع</h4>
            <p className="text-gray-500 text-sm">توصيل خلال 2-4 أيام عمل</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <FiShield className="text-4xl text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-lg mb-2">ضمان الجودة</h4>
            <p className="text-gray-500 text-sm">ضمان لمدة سنة كاملة</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <FiRefreshCw className="text-4xl text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-lg mb-2">استبدال واسترجاع</h4>
            <p className="text-gray-500 text-sm">استرجاع خلال 14 يوم</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
