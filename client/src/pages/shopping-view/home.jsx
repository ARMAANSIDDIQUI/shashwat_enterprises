import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { GiChocolateBar } from "react-icons/gi";
import { getAllBrands} from '@/store/admin/brands-slice'; // Adjust path based on your structure
import { getAllCategories } from '@/store/admin/category-slice';
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBestProducts,
  fetchProductDetails,
} from "@/store/shop/products-slice";
import ShoppingProductTile from "@/components/shopping-view/product-tile";
import { useNavigate } from "react-router-dom";
import { addToCart, fetchCartItems } from "@/store/shop/cart-slice";
import { useToast } from "@/components/ui/use-toast";
import ProductDetailsDialog from "@/components/shopping-view/product-details";
import { getFeatureImages } from "@/store/common-slice";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Smartphone, Download, CheckCircle } from "lucide-react";

function ShoppingHome() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { bestProducts, productDetails } = useSelector(
    (state) => state.shopProducts
  );
  const { featureImageList } = useSelector((state) => state.commonFeature);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { categoriesList} = useSelector((state) => state.category);
  const { brandsList }  = useSelector((state) => state.brands);

  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);

  const { user } = useSelector((state) => state.auth);
  

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();

  function handleNavigateToListingPage(getCurrentItem, section) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      [section]: [getCurrentItem],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    window.location.href = '/shop/listing';
  }

  const { showInstallButton, handleInstallClick } = usePWAInstall();

  function handleGetProductDetails(getCurrentProductId) {
    dispatch(fetchProductDetails(getCurrentProductId));
  }

  function handleAddtoCart(getCurrentProductId) {
   
    let getCartItems = cartItems.items || [];

    if (getCartItems.length) {
      const indexOfCurrentItem = getCartItems.findIndex(
        (item) => item.productId === getCurrentProductId
      );
      // if (indexOfCurrentItem > -1) {
      //   const getQuantity = getCartItems[indexOfCurrentItem].quantity;
      //   if (getQuantity + 1 > getTotalStock) {
      //     toast({
      //       title: `Only ${getQuantity} quantity can be added for this item`,
      //       variant: "destructive",
      //     });

      //     return;
      //   }
      // }
    }

    dispatch(
      addToCart({
        userId: user?.id,
        productId: getCurrentProductId,
        quantity: 1,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchCartItems(user?.id));
        
      }
    });
  }

  function handleUpdateQuantity(productId, value) {
    let getCartItems = cartItems.items || [];
    
    // Find the product in the cart
    const cartItem = getCartItems.find((item) => item.productId === productId);
  
    if (!cartItem) {
        toast({
            title: "Product not found in the cart",
            variant: "destructive",
        });
        return;
    }
  
    // Find the product details from the product list
    const product = bestProducts.find((item) => item._id === productId);
    if (!product) {
        toast({
            title: "Product details not found",
            variant: "destructive",
        });
        return;
    }
  
    const currentQuantity = cartItem.quantity;
    let newQuantity = value;

    // Ensure new quantity does not go below 1
    if (newQuantity < 1) {
        // Delete the item from the cart if quantity is less than 1
        dispatch(
            deleteCartItem({ userId: user?.id, productId: productId })
        ).then((data) => {
            if (data?.payload?.success) {
               
                dispatch(fetchCartItems(user?.id));  // Fetch updated cart items
            } else {
                toast({
                    title: "Failed to delete cart item",
                    variant: "destructive",
                });
            }
        });
        return;
    }
  
    // Dispatch the updated quantity to the cart
    dispatch(
        updateCartQuantity({
            userId: user?.id,
            productId: productId,
            quantity: newQuantity,
        })
    ).then((data) => {
        if (data?.payload?.success) {
            
            dispatch(fetchCartItems(user?.id));  // Fetch updated cart items
        } else {
            toast({
                title: "Failed to update cart item",
                variant: "destructive",
            });
        }
    });
}

  

  useEffect(() => {
    if (productDetails !== null) setOpenDetailsDialog(true);
  }, [productDetails]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % featureImageList.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [featureImageList]);

  useEffect(() => {
    dispatch(fetchBestProducts());
    dispatch(getAllBrands());
    dispatch(getAllCategories());
  }, [dispatch]);



  useEffect(() => {
    dispatch(getFeatureImages());
  }, [dispatch]);
  

  return (
    
    
    <div className="flex flex-col min-h-screen p-3 mt-16">
      {console.log("Hi")}
     <div className="relative w-full h-[190px] sm:h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden ">
  {featureImageList && featureImageList.length > 0
    ? featureImageList.map((slide, index) => (
        <img
          src={slide?.image}
          key={index}
          className={`${
            index === currentSlide ? "opacity-100" : "opacity-0"
          } absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 rounded-lg`}
        />
      ))
    : null}

  {/* Dots at the bottom */}
  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
    {featureImageList.map((_, index) => (
      <button
        key={index}
        onClick={() => setCurrentSlide(index)}
        className={`w-2 h-   rounded-full ${
          index === currentSlide ? "bg-blue-500" : "bg-gray-300"
        }`}
      />
    ))}
  </div>
</div>

{/* Add View All Products Button */}
<div className="flex justify-center mt-8">
  <button
    onClick={() => window.location.href ="/shop/listing"}
    className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-500 text-white font-semibold text-sm rounded-full shadow-lg 
      hover:scale-105 transition-transform duration-300 ease-in-out 
      focus:ring-4 focus:ring-purple-300 focus:outline-none"
  >
    View All Products
  </button>
</div>

<section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Shop by Brand</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {brandsList?.length > 0 ? (
            brandsList.map((brandItem) => (
              <Card
                key={brandItem.id} // Add a key prop for each item
                onClick={() => handleNavigateToListingPage(brandItem.brandName, "brand")}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <img
                    src={brandItem.imageUrl} // Using dynamic imageUrl from the Redux store
                    alt={brandItem.brandName} // Use the brandName as alt text
                    className="w-18 h-16"
                  />
                  <span className="font-bold">{brandItem.brandName}</span> {/* Display brandName */}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center col-span-full">No brands available</p> // Message if no brands are fetched
          )}
        </div>
      </div>
    </section>


    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoriesList?.length > 0 ? (
            categoriesList.map((categoryItem) => (
              <Card
                key={categoryItem.id} // Add a key prop for each item
                onClick={() => handleNavigateToListingPage(categoryItem.categoryName, "category")}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  {/* If you are storing a URL for the icon, use an img tag */}
                  {categoryItem.imageUrl ? (
                    <img
                      src={categoryItem.imageUrl}
                      alt={categoryItem.categoryName}
                      className="w-12 h-12 mb-4"
                    />
                  ) : (
                    <categoryItem.icon className="w-12 h-12 mb-4 text-primary" /> // Use icon component if available
                  )}
                  <span className="font-bold">{categoryItem.categoryName}</span> {/* Display category name */}
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center col-span-full">No categories available</p> // Message if no categories are available
          )}
        </div>
      </div>
    </section>

      {showInstallButton && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl"></div>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                    Experience Shashwat Enterprises on Mobile
                  </h2>
                  <p className="text-blue-100 text-lg mb-8 max-w-xl">
                    Get the best experience with our official Web App. Fast, reliable, and works offline!
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                    <div className="flex items-center gap-2 text-white">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Fast Access</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>App-like Experience</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Offline Support</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleInstallClick}
                    className="bg-white text-blue-700 hover:bg-blue-50 font-bold py-6 px-10 rounded-xl text-lg shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-3"
                  >
                    <Download className="w-6 h-6" />
                    Download App Now
                  </Button>
                </div>

                <div className="flex-shrink-0 bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/20">
                  <div className="bg-white rounded-2xl p-6 shadow-inner">
                    <Smartphone className="w-32 h-32 md:w-48 md:h-48 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Feature Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {bestProducts && bestProducts.length > 0
              ? bestProducts.map((productItem) => (
                  <ShoppingProductTile
                  product={productItem}
                  handleGetProductDetails={handleGetProductDetails}
                    handleAddtoCart={handleAddtoCart}
                    cartItems={cartItems}
                    handleUpdateQuantity={handleUpdateQuantity}
                  />
                ))
              : null}
          </div>
        </div>
      </section>
      <ProductDetailsDialog
        open={openDetailsDialog}
        setOpen={setOpenDetailsDialog}
        productDetails={productDetails}
      />
    </div>
  );
}

export default ShoppingHome;
