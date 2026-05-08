import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import api from "../services/api";
import {
  FaShoppingCart,
  FaTruck,
  FaShieldAlt,
  FaHeadset,
  FaArrowLeft,
} from "react-icons/fa";
import { MdCategory, MdFeaturedPlayList } from "react-icons/md";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [categories, setCategories] = useState([]);
  const [showAllProducts, setShowAllProducts] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get("/products");
      setProducts(data);
      setFilteredProducts(data);

      // استخراج الأقسام الفريدة
      const uniqueCategories = [
        "الكل",
        ...new Set(data.map((p) => p.category).filter(Boolean)),
      ];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // فلتر حسب القسم
  const filterByCategory = (category) => {
    setActiveCategory(category);
    if (category === "الكل") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter((p) => p.category === category));
    }
    setShowAllProducts(false);
  };

  // المنتجات المعروضة (4 أو الكل)
  const displayedProducts = showAllProducts
    ? filteredProducts
    : filteredProducts.slice(0, 4);

  // أحدث المنتجات (أول 4)
  const latestProducts = [...products].reverse().slice(0, 4);

  return (
    <div className="min-h-screen ">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r  text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl font-bold mb-4 animate-fade-in">
              أهلاً بيك في <span className="text-yellow-300">ZENTRO</span>
            </h1>
            <p className="text-xl mb-8 opacity-90">
              اكتشف أفضل المنتجات بأفضل الأسعار. توصيل سريع وضمان الجودة.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  document
                    .getElementById("products")
                    .scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition shadow-lg"
              >
                تسوق الآن
              </button>
              <Link
                to="/cart"
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 px-6 py-3 rounded-lg font-semibold transition"
              >
                <FaShoppingCart className="inline ml-2" />
                عربة التسوق
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaTruck className="text-2xl text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-400">
                توصيل سريع
              </h3>
              <p className="text-gray-300 text-sm">توصيل خلال 2-4 أيام عمل</p>
            </div>
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-2xl text-green-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-400">
                ضمان الجودة
              </h3>
              <p className="text-gray-300 text-sm">ضمان لمدة سنة كاملة</p>
            </div>
            <div className="text-center p-6 rounded-xl hover:shadow-lg transition">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeadset className="text-2xl text-orange-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-400">
                دعم 24/7
              </h3>
              <p className="text-gray-300 text-sm">فريق دعم جاهز لمساعدتك</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Filter */}
      {categories.length > 1 && (
        <section className="py-8 ">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => filterByCategory(category)}
                  className={`px-5 py-2 rounded-full font-medium transition-all duration-300 ${
                    activeCategory === category
                      ? "bg-blue-600 text-white shadow-lg scale-105"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {category === "الكل" ? (
                    <MdCategory className="inline ml-1" />
                  ) : null}
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Section */}
      <section id="products" className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                <MdFeaturedPlayList className="text-blue-200" />
                {activeCategory === "الكل"
                  ? "جميع المنتجات"
                  : `منتجات ${activeCategory}`}
              </h2>
              <p className="text-gray-200 text-sm mt-1">
                {filteredProducts.length} منتج متاح
              </p>
            </div>

            {filteredProducts.length > 4 && !showAllProducts && (
              <button
                onClick={() => setShowAllProducts(true)}
                className="flex items-center gap-1 text-yellow-500 hover:text-yellow-700 font-medium transition"
              >
                عرض الكل
                <FaArrowLeft className="text-sm" />
              </button>
            )}

            {showAllProducts && (
              <button
                onClick={() => setShowAllProducts(false)}
                className="flex items-center gap-1 text-gray-300 hover:text-gray-500 font-medium transition"
              >
                عرض أقل
                <FaArrowLeft className="text-sm rotate-180" />
              </button>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white p-4 rounded-xl shadow"
                >
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 mb-2 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                لا توجد منتجات  حاليا  
              </h3>
              <p className="text-gray-400">انتظرنا قريبا</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {displayedProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="transform hover:-translate-y-2 transition duration-300"
                  style={{
                    animation: `fadeInUp 0.5s ease ${index * 0.05}s both`,
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Latest Products Section */}
      {latestProducts.length > 0 && (
        <section className="py-12 ">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-200">
                أحدث المنتجات
              </h2>
              <p className="text-gray-400">آخر ما أضفناه للمتجر</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {latestProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">اشترك في النشرة البريدية</h2>
          <p className="mb-6 opacity-90">
            احصل على أحدث العروض والخصومات أول بأول
          </p>
          <div className="max-w-md mx-auto flex gap-3">
            <input
              type="email"
              placeholder="بريدك الإلكتروني"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-3 rounded-lg font-semibold transition">
              اشتراك
            </button>
          </div>
        </div>
      </section>

      {/* Animation Styles */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fadeInUp 0.6s ease-out;
          }
        `}
      </style>
    </div>
  );
};

export default Home;
