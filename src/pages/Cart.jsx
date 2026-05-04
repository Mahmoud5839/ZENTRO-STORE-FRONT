import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addToCart, removeFromCart } from "../redux/cartSlice";
// import { toast } from "react-toastify";
import {
  FaTrashAlt,
  FaShoppingCart,
  FaArrowLeft,
  FaCreditCard,
  FaPlus,
  FaMinus,
} from "react-icons/fa";
import { MdShoppingBag, MdRemoveShoppingCart } from "react-icons/md";
import { FiPackage, FiTruck } from "react-icons/fi";
import { HiOutlineShoppingBag } from "react-icons/hi";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);

  const removeFromCartHandler = (id, name) => {
    dispatch(removeFromCart(id));
    console.log(`Removed product ${id} from cart`);
  };

  const changeQuantityHandler = (item, qty) => {
    if (qty < 1) return;
    dispatch(
      addToCart({
        ...item,
        quantity: qty,
      }),
    );
  };

  const checkoutHandler = () => {
    if (!userInfo) {
      alert("يرجى تسجيل الدخول اولا لإتمام عملية الشراء");
      navigate("/login", { state: { from: "/cart" } });
    } else {
      navigate("/checkout");
    }
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen  flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className=" rounded-full w-32 h-32 flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MdRemoveShoppingCart className="text-5xl text-gray-200" />
          </div>
          <h2 className="text-2xl font-bold text-gray-300 mb-3">سلتك فارغة</h2>
          <p className="text-gray-500 mb-8">
            يلا بينا نشوف منتجاتنا واختار اللي يعجبك
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-yellow-500  px-6 py-3 rounded-lg hover:bg-yellow-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <FaShoppingCart />
            <span>تسوق الآن</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gray-900">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-yellow-500 flex items-center gap-3">
              <MdShoppingBag className="text-yellow-500" />
              سلة التسوق
            </h1>
            <p className="text-gray-200 mt-1">
              لديك {totalItems} {totalItems === 1 ? "منتج" : "منتجات"} في سلتك
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 text-yellow-500 hover:text-yellow-700 transition font-medium"
          >
            <FaArrowLeft />
            <span>مواصلة التسوق</span>
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.product}
                className="bg-yellow-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group"
              >
                <div className="flex flex-col sm:flex-row items-center p-4 gap-4">
                  {/* Product Image */}
                  <div className="w-28 h-28 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-xl shadow-sm"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 text-center sm:text-right">
                    <Link
                      to={`/product/${item.product}`}
                      className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <div className="text-2xl font-bold text-blue-600 mt-1">
                      ${item.price}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border-2 rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          changeQuantityHandler(
                            item,
                            Math.max(1, item.quantity - 1),
                          )
                        }
                        className="px-3 py-2 hover:bg-gray-100 transition text-gray-600"
                      >
                        <FaMinus className="text-sm" />
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          changeQuantityHandler(item, item.quantity + 1)
                        }
                        className="px-3 py-2 hover:bg-gray-100 transition text-gray-600"
                      >
                        <FaPlus className="text-sm" />
                      </button>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() =>
                        removeFromCartHandler(item.product, item.name)
                      }
                      className="text-red-500 hover:text-red-700 transition p-2 hover:bg-red-50 rounded-full"
                      title="حذف المنتج"
                    >
                      <FaTrashAlt className="text-lg" />
                    </button>
                  </div>

                  {/* Item Total */}
                  <div className="text-center sm:text-left min-w-[80px]">
                    <p className="text-sm text-gray-500">الإجمالي</p>
                    <p className="text-xl font-bold text-gray-800">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Delivery Estimate */}
                <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 flex items-center gap-2 border-t">
                  <FiTruck className="text-green-600" />
                  <span>توصيل خلال 2-4 أيام عمل</span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3 bg-gray-900 ">
            <div className=" rounded-2xl shadow-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 p-4 rounded-xl text-white mb-4 flex items-center gap-2">
                <FiPackage  />
                ملخص الطلب
              </h2>

              <div className="space-y-3 border-b pb-4">
                <div className="flex justify-between text-gray-200">
                  <span>عدد المنتجات</span>
                  <span className="font-semibold">{totalItems}</span>
                </div>
                <div className="flex justify-between text-gray-200">
                  <span>المجموع الفرعي</span>
                  <span>{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-200">
                  <span>الشحن</span>
                  <span className="text-green-600">مجاني</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 mb-6">
                <span className="text-lg font-bold text-gray-200">
                  الإجمالي
                </span>
                <span className="text-2xl font-bold text-yellow-500">
                  {totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                onClick={checkoutHandler}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <FaCreditCard />
                <span>إتمام الشراء</span>
              </button>

              <div className="mt-4 text-center text-xs text-gray-400">
                <p>الدفع آمن ومشفر 🔒</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Section يمكن إضافتها لاحقاً */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-yellow-500 hover:text-yellow-700 transition font-medium"
          >
            <HiOutlineShoppingBag className="text-xl" />
            <span>استمر في التسوق</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
