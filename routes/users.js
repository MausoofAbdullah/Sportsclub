const { response } = require("express");
const express = require("express");
const {
  LogPage,
} = require("twilio/lib/rest/serverless/v1/service/environment/log");
const router = express.Router();
const productHelper = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const twilioHelpers = require("../helpers/twilio-helper");
const adminHelpers=require('../helpers/admin-helpers');
const async = require("hbs/lib/async");
const { Db } = require("mongodb");

const verifyLogin = (req, res, next) => {
  //   if(req.session.loggedIn){
  //     next()
  //   }else{
  //     res.redirect('/')
  //   }
  // }
  if (req.session.userLoggedIn) {
    next();
  } else {
    res.redirect("/");
  }
};
/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.render('users/home',{layout:'user-layout',users:true});
// });

router.get("/", async function (req, res, next) {
  try {
     let user = req.session.user;

  let cartCount = null;
  let whishCount = null;

  if (req.session.user) {
    cartCount = await userHelpers.getCartCount(req.session.user._id);
    whishCount = await userHelpers.getWhishCount(req.session.user._id);
  }
  adminHelpers.getAllBanner().then((banners) => {
  productHelper.getAllProducts().then(async (products) => {
    let category = req.query.category;
    let showCategory = await productHelper.showCategory();
    let catProducts = await productHelper.categoryProducts(category);

    console.log(cartCount);
    res.render("users/view-products", {
      user,
      products,
      layout: "user-layout",
      users: true,
      cartCount,
      whishCount,
      showCategory,
      catProducts,
      banners
    });
  });
})

    
  } catch (error) {
    next(error);
  }
})
  
 

router.get("/login", function (req, res, next) {
  // res.header(
  //   "Cache-control",
  //   "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0"
  // );
  try {
    if (req.session.user) {
      res.redirect("/");
    } else {
      res.render("users/user-login", { loginerr: req.session.userLoginerr ,users:true ,layout:"user-layout"});
      req.session.userLoginerr = false;
    }
  } catch (error) {
    next(error);
  }
})
 

  router.get("/signup", function (req, res, next) {
    // res.header(
    //   "Cache-control",
    //   "no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0"
    // );
    try {
      
      if (req.session.userLoggedIn) {
        res.redirect("/");
      } else {
        res.render("users/user-signup",{ signupErr:req.session.signupErr ,layout: "user-layout",
        users: true,});
        req.session.signupErr=false
      }
    ;
    } catch (error) {
      next(error);
    }
  })

  // router.get("/otp", (req, res) => {
  //   res.render("users/otp", { users: true, loginErr: req.session.loginErr });
  // });

  // router.post("/sign", (req, res, next) => {
  //   try {
  //     userHelpers.verifyUser(req.body).then((response) => {
  //       if (response.status) {
  //         req.session.body = req.body;

  //         twilioHelpers.doSms(req.body).then((data) => {
  //           console.log(req.body);

  //           req.session.body = req.body;
  //           if (data) {
  //             console.log(data);
  //             res.render("users/otp");
  //           } else {
  //             res.redirect("/signup");
  //           }
  //         });
  //       } else {
  //         req.session.signupErr = "Email already exists";
  //         res.redirect("/signup");
  //       }
  //     });
  //   } catch (error) {
  //     next(error)
  //   }
  // });

  // router.post("/otp", (req, res, next) => {
  //   try {
  //     twilioHelpers.otpVerify(req.body, req.session.body).then((response) => {
  //       if (response) {
  //         userHelpers.doSignup(req.session.body).then((response) => {
  //           res.redirect("/login");
  //         });
  //       } else {
  //         req.session.message = "INVALID OTP";
  //         res.redirect("/otp");
  //       }
  //     });
  //   } catch (error) {
  //     next(error);
  //   }
  // });
  router.post('/sign', function(req,res,next){
      userHelpers.doSignup(req.body).then((response)=>{
        if(response.status){
          req.session.signuperr=true
          req.session.signuperr="Email already"
          res.redirect('/signup',{signuperr:req.session.signuperr})
        }
        res.redirect('/login')
      });
  });
  //   router.post('/sign', function(req,res,next){
  //     userHelpers.doSignup(req.body).then((response)=>{

  //       // if(response.status){
  //       //   req.session.body=req.body
  // twilioHelpers.domsg(req.body).then((data)=>{

  //   req.session.body=req.body
  //   if(data){
  //     res.render('/user/otp')
  //   }else{
  //     res.redirect('/signup')
  //   }
  // })

  //       res.redirect('/login')
  //     });
  // });

  // router.post('/otp',(req,res)=>{
  //   twilioHelpers.otpVerify(req.body,req.session.body).then((response)=>{
  //     if(response){
  //       userHelpers.doSignup(req.session.body).then((response)=>{
  //                res.redirect('/login')
  //             })
  //     }
  //   })
  // })

  router.post("/userLogin", function (req, res, next) {
    try {
      userHelpers.doLogin(req.body).then((response) => {
        if (response.status) {
          // req.session.loggedIn=true;
  
          req.session.user = response.user;
          req.session.userLoggedIn = true;
  
          res.redirect("/");
        } else {
          req.session.userLoginerr = true;
          // req.session.userLoginerr = "Invalid username or password";
  
          res.redirect("/login");
        }
      });
    
      
    } catch (error) {
      next(error);
    }

  })

  // router.get("/shop",async function (req, res,next) {
  //   let user = req.session.user;

  //   let cartCount = null;
  //   let whishCount = null;

  //   if (req.session.user) {
  //     cartCount = await userHelpers.getCartCount(req.session.user._id);
  //     whishCount = await userHelpers.getWhishCount(req.session.user._id);

  //   }
  //   productHelper.getAllProducts().then(async(products) => {
  //     let category = req.query.category
  //     let showCategory =await productHelper.showCategory()
  //     let catProducts = await productHelper.categoryProducts(category)
  //     console.log("hoiiiiiiiiiiiiiiiiiii");
  //     console.log(req.body);
  //     res.render("users/user-shop", {
  //       products,
  //       layout: "user-layout",
  //       users: true,
  //       user: req.session.user,
  //       cartCount,
  //       whishCount,
  //       catProducts,
  //       showCategory
  //     });
  //   });
  // });

  router.get("/shop", async (req, res, next) => {
    try {
      let category = req.query.category;
let user=req.session.user
      let cartCount = null;
      if (req.session.user) {
        cartCount = await userHelpers.getCartCount(req.session.user._id);
      }

      let whishCount = null;
      if (req.session.user) {
        whishCount = await userHelpers.getWhishCount(req.session.user._id);
      }

      productHelper.getAllProducts().then(async (products) => {
        let showCategory = await productHelper.showCategory();
        let catProducts = await productHelper.categoryProducts(category);
       

        res.render("users/pro-category", {
          layout: "user-layout",
          users: true,
          catProducts,
          products,

          cartCount,
        
          whishCount,
          showCategory,
          user
        });
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/profile", verifyLogin, async (req, res, next) => {
    try {
      let cartCount = null;
      if (req.session.user) {
        cartCount = await userHelpers.getCartCount(req.session.user._id);
      }
      userDetails = req.session.user;
      let whishCount = null;
      if (req.session.user) {
        whishCount = await userHelpers.getWhishCount(req.session.user._id);
      }
      let userSignupDetails = await userHelpers.getUserDetails(
        req.session.user._id
      );
      let userAddress = await userHelpers.userAddress(req.session.user._id);
      let category = req.query.category;
      let showCategory = await productHelper.showCategory();
      let catProducts = await productHelper.categoryProducts(category);

      res.render("users/profiletrys", {
        layout: "user-layout",
        users: true,
        userDetails,
        cartCount,
        whishCount,
        userSignupDetails,
        userAddress,
        user: req.session.user,
        showCategory,
        catProducts,
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/add-address", async (req, res, next) => {
    try {
      let userProfileDetails = await userHelpers.profileDetails(
        req.body,
        req.session.user._id
      );
      res.redirect("/profile");
    } catch (error) {
      next(error);
    }
  });

  router.get("/delete-address/:id", async (req, res, next) => {
    try {
      addressId = req.params.id;
      userId = req.session.user._id;

      let deleteAddress = await userHelpers.deleteAddress(addressId, userId);
      console.log("hi" + addressId, userId);
      console.log("hi");
      res.redirect("/profile");
    } catch (error) {
      next(error);
    }
  });

  router.post("/update-profile", async (req, res, next) => {
    try {
      let userName = await userHelpers.updateName(
        req.body,
        req.session.user._id
      );
      res.redirect("/profile");
    } catch (error) {
      next(error);
    }
  });

  router.post("/edit-address/:id", (req, res, next) => {
    try {
      addressId = req.params.id;
      usrID = req.session.user._id;
      userHelpers.updateAddress(req.body, addressId, usrID).then((response) => {
        res.redirect("/profile");
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/change-password", async (req, res, next) => {
    try {
      userId = req.session.user._id;

      let userPassword = await userHelpers.updateUserPassword(userId, req.body);

      res.redirect("/profile");
    } catch (error) {
      next(error);
    }
  });

  router.get("/single-product/:id", async (req, res, next) => {
    try {
      let cartCount = null;
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id);
    }
    userDetails = req.session.user;
    let whishCount = null;
    if (req.session.user) {
      whishCount = await userHelpers.getWhishCount(req.session.user._id);
    }
    let proId = req.params.id;
    console.log(proId);
    let proDetails = await userHelpers.getProductDetails(proId);
    console.log(proDetails);
    let user = req.session.user;
    let showCategory = await productHelper.showCategory();
    res.render("users/single-product", {
      proDetails,
      layout: "user-layout",
      users: true,
      user,
      cartCount,
      whishCount,
      showCategory
    });
  
    } catch (error) {
      next(error);
    }
  })

  router.get("/category", async (req, res, next) => {
    try {
      let category = req.query.category;
      let user = req.session.user;
      let cartCount = null;
      if (req.session.user) {
        cartCount = await userHelpers.getCartCount(req.session.user._id);
      }
      let whishCount = null;
      if (req.session.user) {
        whishCount = await userHelpers.getWhishCount(req.session.user._id);
      }
      
      let showCategory = await productHelper.showCategory();
      let catProducts = await productHelper.categoryProducts(category);
      console.log(catProducts + "dfdfdffgfgfg");
      res.render("users/category", {
        catProducts,
        users: true,
        user,
        showCategory,
        layout: "user-layout",
        cartCount,
        whishCount
      });
    
    } catch (error) {
      next(error);
    }
  })

   

  router.get("/cart", verifyLogin, async (req, res,next) => {
    // res.render('users/cart',{layout:'user-layout', users: true})
    try {
      let user = req.session.user;
      let cartCount = null;
      let whishCount = null;
      let products = await userHelpers.getCartProducts(req.session.user._id);
      let totalValue = 0;
  
      if (req.session.user) {
        cartCount = await userHelpers.getCartCount(req.session.user._id);
        whishCount = await userHelpers.getWhishCount(req.session.user._id);
      }
      if (products.length > 0) {
        totalValue = await userHelpers.getTotalAmount(req.session.user._id);
        // single=await userHelpers. getSingleAmount(req.session.user._id)
      }
      let showCategory = await productHelper.showCategory();
  
      console.log(products);
  
      res.render("users/cart", {
        layout: "user-layout",
        users: true,
        products,
        totalValue,
        user,
        cartCount,
        whishCount,
        showCategory ,
        // single
      });
    
    } catch (error) {
      next(error);
    }
  })

  router.get("/delete-product/:carId/:proId", (req, res, next) => {
    try {
      let cartId = req.params.carId;
    let prodId = req.params.proId;
    userHelpers.deleteProduct(cartId, prodId).then((response) => {
      res.json(response);
    });
  
    } catch (error) {
      next(error);
    }
  })

  router.get("/add-to-cart/:id",verifyLogin, (req, res,next) => {
    try {
      console.log("api call");
      userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
        // res.redirect('/')
        res.json({ status: true });
      });
    } catch (error) { 
      next(error);
    }
 
  });

  router.get("/whishlist", verifyLogin, async (req, res, next) => {
    try {
    
     let user = req.session.user;
      let cartCount = null;
      let whishCount = null;
      
      let products = await userHelpers.getWhishProducts(req.session.user._id);
      let showCategory = await productHelper.showCategory();
      if (req.session.user) {
        cartCount = await userHelpers.getCartCount(req.session.user._id);
        whishCount = await userHelpers.getWhishCount(req.session.user._id);
      }

      res.render("users/whishlist", {
        layout: "user-layout",
        users: true,
        products,
        whishCount,
        cartCount,
        
        user,
        
        showCategory
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/add-to-whishlist/:id", (req, res, next) => {
    try {
      userHelpers
        .addToWhishlist(req.params.id, req.session.user._id)
        .then(() => {
          res.json({ status: true });
        });
    } catch (error) {
      next(error);
    }
  });
  router.get("/delete-wishproduct/:carId/:proId", (req, res, next) => {
    try {
      let cartId = req.params.carId;
      let prodId = req.params.proId;
      userHelpers.deletewishProduct(cartId, prodId).then((response) => {
        res.json(response);
      });
    } catch (error) {
      next(error);
    }
   
  });

  router.post("/change-product-quantity", (req, res, next) => {
    try {
      console.log(req.body);
      let userId=req.session.user._id
      userHelpers.changeProductQuantity(req.body).then(async (response) => {
        response.total = await userHelpers.getTotalAmount(userId);
        res.json(response);
      });
    } catch (error) {
      next(error);
    }
   
  });
  router.get("/checkout", verifyLogin, async (req, res, next) => {
    try {
      let total = await userHelpers.getTotalAmount(req.session.user._id);
      let products = await userHelpers.getCartProducts(req.session.user._id);
      let userDetails = await userHelpers.getUserDetails(req.session.user._id);
      let addressId = req.query.id;
      let userId = req.session.user._id;
      let cartCount = null;
      let whishCount = null;
  
      let selectAddress = await userHelpers.placeAddress(addressId, userId);
  
      let userAddress = await userHelpers.userAddress(req.session.user._id);
      if (req.session.user) {
        cartCount = await userHelpers.getCartCount(req.session.user._id);
        whishCount = await userHelpers.getWhishCount(req.session.user._id);
      }
      let showCategory = await productHelper.showCategory();
  
      res.render("users/checkout", {
        layout: "user-layout",
        users: true,
        total,
        user: req.session.user,
        products,
        userDetails,
        userAddress,
        selectAddress,
        whishCount,
        cartCount,
        showCategory
      });
    } catch (error) {
      next(error);
    }
   
  });

  router.post("/checkout", async (req, res, next) => {
    try {
      let products = await userHelpers.getCartProductList(req.body.userId);
    let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
    userHelpers.checkout(req.body, products, totalPrice).then((orderId) => {
      if (req.body.paymentType == "COD") {
        res.json({ codSuccess: true });
      } else {
        userHelpers.generateRazorpay(orderId, totalPrice).then((response) => {
          res.json(response);
        });
      }
    });
      
    } catch (error) {
      next(error);
    }
    

  });

  router.post("/apply-coupon", async (req, res, next) => {
    try {
      console.log(req.body);
      let response = await userHelpers.applyCoupon(
        req.body.couponName,
        req.body.userId
      );
      if (response.CouponName) {
        req.session.CouponName = response.CouponName;
      }
      res.json(response);
    } catch (error) {
      
      next(error);
    }
  });

  router.get("/order-success",async (req, res, next) => {
    try {
      let cartCount=null
      let whishCount=null
      let showCategory = await productHelper.showCategory();
      if (req.session.user) {
        cartCount = await userHelpers.getCartCount(req.session.user._id);
        whishCount = await userHelpers.getWhishCount(req.session.user._id);
      }
      res.render("users/order-success", {
        user: req.session.user,
        layout: "user-layout",
        users: true,
        showCategory,
        whishCount,
        cartCount
      });
    } catch (error) {
      next(error);
    }
    
   
  });


  router.get("/orders", async (req, res,next) => {
    try {
      let cartCount=null
      let whishCount=null
      let showCategory = await productHelper.showCategory();
      if (req.session.user) {
        cartCount = await userHelpers.getCartCount(req.session.user._id);
        whishCount = await userHelpers.getWhishCount(req.session.user._id);
      }
      let orders = await userHelpers.getUserOrders(req.session.user._id);
      res.render("users/orders", {
        layout: "user-layout",
        user: req.session.user,
        orders,
        users: true,
        showCategory,
        cartCount,
        whishCount
      });
    } catch (error) {
      next(error);
    }
   
  });


  router.get("/view-order-products/:id", async (req, res, next) => {
    try {
      let products = await userHelpers.getOrderProduct(req.params.id);
    let orders = await userHelpers.getUserOrders(req.session.user._id);
    value = await userHelpers.value(req.params.id);
    res.render("users/view-order-products", {
      user: req.session.user,
      products,
      orders,
      value,
    });
    } catch (error) {
      next(error);
    }
    
  });

  router.get("/item-cancelled/:id", async (req, res, next) => {
    try {
      orderId = req.params.id;

      let changeStatusCancelled = await userHelpers.changeStatusCancelled(
        orderId
      );
      res.redirect("/orders");
    } catch (error) {
      next(error);
    }
  });

  router.post("/verify-payment", (req, res, next) => {
    try {
      
    userHelpers
    .verifyPayment(req.body)
    .then(() => {
      userHelpers.changePaymentStatus(req.body["order[receipt]"]).then(() => {
        res.json({ status: true });
        console.log("payment successful");
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: "" });
    });
    } catch (error) {
      next(error);
    }
    
  });

  router.get("/userLoggout", function (req, res, next) {
    try {
      req.session.user = null;
    req.session.userLoggedIn = false;
    req.session.userLoggedIn = null;
    req.session.destroy();
    res.redirect("/");
    } catch (error) {
      next(error);
    }
    
  });
;

module.exports = router;
