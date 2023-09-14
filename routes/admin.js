const express = require('express');
const async = require('hbs/lib/async');
const router = express.Router();
const productHelper = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const adminHelpers=require('../helpers/admin-helpers');
const { changeStatusShipped, changeStatusDelivered } = require('../helpers/user-helpers');
const fs = require('fs')
const path = require('path');

/* GET home page. */


router.get('/', function(req, res, next){
try {
  if(req.session.adminloggedIn){
    res.redirect('/admin/index') 
  }else{
   console.log("something")
    res.render('admin/admin-login',{});
  }

} catch (error) {
  next(error);
}
 
  
    // res.render('admin/login',{admin:true});
  
});

router.get('/index', async(req, res, next) =>{

  try {
    let userCount = await userHelpers.getUserCount()
    let orderCount = await userHelpers.getOrderCount()
    let codCount = await userHelpers.totalCOD()
    let totalDelivered = await userHelpers.totalDelivered()
    let cancelled = await userHelpers.cancelled()
    let monthamount = await userHelpers.totalMonthAmount()
       
          let ONLINECount = await userHelpers.totalONLINE()
          if (req.session.adminLoggedIn){
    res.render('admin/index',{ admin: true ,layout:'admin-layout',userCount,orderCount,codCount,ONLINECount,totalDelivered,cancelled,monthamount})}
    else{
      res.render('admin/admin-login',{admin:true});
    }
    
  } catch (error) {
    next(error);
  }
 
})


router.get('/view-products', function (req, res, next) {
  try {
    res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
    productHelper.getAllProducts().then((products) => {
      if (req.session.adminLoggedIn) {
        res.render('admin/view-products', { products, admin: true });
      } else {
        res.redirect('/admin')
      }
    })
  } catch (error) {
    next(error);
  }

});

// const admindb = {
//   email: "admin@gmail.com",
//   password:12345
// }
// router.post('/admin-login', function (req, res) {
//   res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
//   if (req.body.email == admindb.email && req.body.password == admindb.password) {
//     req.session.adminLoggedIn = true;
//     res.render('admin/home',{admin:true});
//   } else {
//     req.session.adminLoggErr = true;
//     res.redirect('/admin');
//   }
// });
router.post('/admin-login',  function (req, res,next) {
  try {
    res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
  adminHelpers.doLogin(req.body).then(async(response)=>{
    if (response.status) {
      req.session.adminLoggedIn = true;
      let userCount = await userHelpers.getUserCount()
      let orderCount = await userHelpers.getOrderCount()
      let codCount = await userHelpers.totalCOD()
      let totalDelivered = await userHelpers.totalDelivered()
      let cancelled = await userHelpers.cancelled()
      let monthamount = await userHelpers.totalMonthAmount()
         
            let ONLINECount = await userHelpers.totalONLINE()
            res.render('admin/index',{ admin: true ,layout:'admin-layout',userCount,orderCount,codCount,ONLINECount,totalDelivered,cancelled,monthamount})
    } else {
      req.session.adminLoggErr = true;
      res.redirect('/admin');
    }

  })
  } catch (error) {
    next(error);
  }
  

});

//old//

// router.get('/add-products', function (req, res, next) {
//   res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
//   if (req.session.adminLoggedIn) {
//     res.render('admin/add-products', { admin: true });
//   } else {
//     res.redirect('/admin');
//   }
// });

//new

router.get('/add-products',(req,res, next)=>{
  try {
    res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
    productHelper.showCategory().then((catDetails)=>{
      if (req.session.adminLoggedIn){
      res.render('admin/add-products',{admin:true,layout:'admin-layout',catDetails})
      }else{
        res.redirect('/admin');
      }
      
    })
  } catch (error) {
    next(error);
  }
 
  
})

//new

router.post('/add-products',(req,res, next)=>{
  // req.body.price = parseInt(req.body.price)
  try {
    productHelper.addProduct(req.body,(id,category)=>{
      let image=req.files.Image
      image.mv('./public/product-images/'+id+'.jpg',(err)=>{
        if(!err){
          res.redirect('/admin/view-products')
        }else{
          console.log(err)
        }
      })
    })
  } catch (error) {
    next(error);
  }
 
})


router.get('/add-categories', function (req, res, next) {
  try {
    res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
  if (req.session.adminLoggedIn) {
    res.render('admin/add-categories', { admin: true });
  } else {
    res.redirect('/admin');
  }
  } catch (error) {
    next(error);
  }

});

router.post('/add-categories', (req, res, next) => {
  try {
    productHelper.addCategory(req.body).then((response) => {
      // res.redirect('/admin/add-categories')
      res.json(response)
    });
  } catch (error) {
    next(error);
  }
 
});
//fsdfdsfdf//
// router.post('/add-categories', (req, res) => {
//   console.log(req);
//   productHelper.addCategory(req.body, (id) => {
//     let image = req.files.Image;
//     image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
//       if (!err) {
//         res.render('admin/add-categories',{admin:true})
//       } else {
//         console.log(err);
//       }
//     })
//   });
// });

//gfgfgfgfgfgf//


router.get('/view-categories', function (req, res, next) {
  try {
    res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
    productHelper.showCategory().then((categories) => {
      if (req.session.adminLoggedIn) {
        res.render('admin/view-categories', { categories, admin: true });
      } else {
        res.redirect('/admin')
      }
    })
  } catch (error) {
    next(error);
  }
 
});
router.get('/delete-category/:id',(req,res, next)=>{
  try {
    let catId = req.params.id
    productHelper.deleteCategory(catId).then((response)=>{
      console.log(response);
      res.redirect('/admin/view-categories')
    })
  } catch (error) {
    next(error);
  }
 
})


router.get('/delete-product/:id',(req,res, next)=>{
  try {
    let proId=req.params.id
    productHelper.deleteProduct(proId).then((response)=>{
      res.redirect('/admin/view-products')
    })
  } catch (error) {
    next(error);
  }
//   try {
//     let proId = req.params.id
//     var imgDel = productHelper.deleteProduct(proId)
//     console.log(imgDel,"fffffffffffffffffffff");
//     if (imgDel) {
        
//             var imagePath = path.join(__dirname, '../public/product-images/' + imgDel)
//             fs.unlink(imagePath, (err) => {
//                 if (err)
//                     return
//             })
        
//     }
//     res.redirect('/admin/view-products')
// } catch (error) {
//     console.log(error);
//     next(error)
// }

 
})

//old
// router.get('/edit-product/:id',async(req,res)=>{
//   let product=await productHelper.getProductDetails(req.params.id)
//   res.render('admin/edit-product',{product})
// })

router.get('/edit-product/:id',async(req,res, next)=>{
  try {
    let catDet=await productHelper.showCategory()
    await productHelper.getProductDetails(req.params.id).then((product)=>{
    res.render('admin/edit-product',{admin:true,layout:'admin-layout', product,catDet})
    })
  } catch (error) {
    next(error);
  }

  
  })

router.post('/edit-product/:id',(req,res, next)=>{
  try {
    let id=req.params.id
    productHelper.updateProduct(req.params.id,req.body).then(()=>{
      res.redirect('/admin')
      if(req.files.Image){
        let image=req.files.Image
        image.mv('./public/product-images/'+id+'.jpg')
      }
    })
  } catch (error) {
    next(error);
  }

})



// router.get('/delete-category/:id',(req,res)=>{
//   let catId=req.params.id
//   productHelper.deleteCategory(catId).then((response)=>{
//     res.redirect('/admin/view-categories')
//   })
// })


// router.get('/edit-category/:id',async(req,res)=>{
//   let category=await productHelper.getCategoryDetails(req.params.id)
//   res.render('admin/edit-category',{category})
// })

// router.post('/edit-category/:id',(req,res)=>{
//   let id=req.params.id
//   productHelper.updateCategory(req.params.id,req.body).then(()=>{
//     res.redirect('/admin/view-categories')
   
//   })
// })

router.get('/manage-users', function (req, res, next) {
  try {
    res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
    userHelpers.getAllUsers().then((userdetails) => {
      if (req.session.adminLoggedIn) {
        res.render('admin/manage-users', { userdetails, admin: true });
      } else {
        res.redirect('/admin')
      }
    }
    )
  } catch (error) {
    next(error);
  }
 
});


// router.get('/block-user/:id', async (req, res) => {
//   res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
//   if (req.session.adminLoggedIn) {
//     let user = await userHelpers.getUserDetails(req.params.id)
//     res.render('admin/manage-users', { user,admin:true ,blocked:true})
//   } else {
//     res.redirect('/admin');
//   }
// })



// router.get('/unblock-user/:id', async (req, res) => {
//   res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0')
//   if (req.session.adminLoggedIn) {
//     let user = await userHelpers.getUserDetails(req.params.id)
//     res.render('admin/manage-users', { user,admin:true ,})
//   } else {
//     res.redirect('/admin');
//   }
// })


router.get('/block-user/:id', (req, res, next) => {
  try {
    userHelpers.blockUser(req.params.id, req.body).then(() => {
  
      res.redirect('/admin/manage-users')
    })
  } catch (error) {
    next(error);
  }
 
})


router.get('/unblock-user/:id', (req, res, next) => {
  try {
    userHelpers.unblockUser(req.params.id, req.body).then(() => {
      res.redirect('/admin/manage-users')
    })
  } catch (error) {
    next(error);
  }
 
})


// router.get('/category',async(req,res,next)=>{
//   try {
//     if (req.session.catError) {
//         var catDetails = await adminHelpers.viewCategory()
//         res.render('admin/admin-Category', { layout: 'admin-layout', admin: true, catDetails, catError: req.session.catError })
//         req.session.catError = false
//     } else {
//         var catDetails = await adminHelpers.viewCategory()
//         res.render('admin/admin-Category', { layout: 'admin-layout', catDetails, admin: true, })
//     }
// } catch (error) {
//     console.log(error);
//     next(error)
// }
// })

// router.post('/category',async(req,res,next)=>{
//   try {
//     let response = await adminHelpers.addCategory(req.body)
//     if (response.caterror) {
//         req.session.catError = "Category already exist"
//         res.redirect('/admin/category')
//     } else {
//         res.redirect('/admin/category')
//     }
// } catch (error) {
//     console.log(error);
//     next(error)
// }
// })

router.get('/coupon',async(req,res,next)=>{
  try {
    let coupons = await adminHelpers.getCoupons()
    res.render('admin/admin-Coupon', { layout: 'admin-layout', admin: true, coupons })
} catch (error) {
    console.log(error);
    next(error)
}
})

router.post('/coupon',async(req,res,next)=>{
  try {
    await adminHelpers.addCoupon(req.body)
    res.redirect('/admin/coupon')
} catch (error) {
    console.log(error);
    next(error)
}
})

router.get("/delete-coupon/:id", (req, res, next) => {
  try {
    let couponId = req.params.id;
  adminHelpers.deleteCoupon(couponId).then((response) => {
    res.redirect("/admin/coupon");
  });
  } catch (error) {
    next(error);
  }
  
});

router.get('/order',async(req,res,next)=>{
  try {
    order=await userHelpers.adminOrders()
 

    res.render('admin/order', { admin: true ,layout:'admin-layout',order})
    
  } catch (error) {
    next(error)
  }
 
  })

  router.get('/view-orderproduct/:id',async(req,res,next)=>{
    try {
      singleId = req.params.id
      let products=await userHelpers.getOrderProduct(req.params.id)
      buttonchange = await userHelpers.btnChange(singleId)
     
      res.render('admin/view-order',{products,singleId,admin: true ,layout:'admin-layout',buttonchange})
      
    } catch (error) {
      next(error)
    }
   
  })

  router.get('/item-packed/:id',async(req,res,next)=>{
    try {
      orderId = req.params.id
      // let products=await userHelpers.getOrderProduct(req.params.id)
      // buttonchange = await userHelpers.btnChange(singleId)
      let changeStatusPacked = userHelpers.changeStatus(orderId)
     
      // res.render('admin/view-orderproduct',{products,singleId,admin: true ,layout:'admin-layout',buttonchange})
      res.redirect('/admin/order')
    } catch (error) {
      next(error)
    }
   
    
  
  })

  router.get('/item-shipped/:id',async(req,res,next)=>{
    try {
      orderId = req.params.id

    let changeStatusShipped = userHelpers.changeStatusShipped(orderId)
    res.redirect('/admin/order')
      
    } catch (error) {
      next(error)
    }
    
    
  
  })

  router.get('/item-delivered/:id',async(req,res,next)=>{
    try {
      orderId = req.params.id

    let changeStatusDelivered =await userHelpers.changeStatusDelivered(orderId)
    res.redirect('/admin/order')
      
    } catch (error) {
      next(error)
    }
    
    
  
  })

  router.get('/view-banner',(req,res,next)=>{
    try {
      adminHelpers.getAllBanner().then((banners)=>{
      
        res.render('admin/view-banner',{admin:true,layout:'admin-layout',banners})
        
      })
      
    } catch (error) {
      next(error)
    }
   
   
    
  })
  router.get('/add-banner', function (req, res, next) {
    try {
      res.render('admin/add-banner', {admin:true,layout:'admin-layout'});
    } catch (error) {
      next(error)
    }
    
     
    
    
      
      })
   
   
 
  
  // router.post('/add-banner',(req, res,next) => {
  //   try {
      
  
  //   adminHelpers.addBanner(req.body).then((response) =>{
  //     let image=req.files.Image
  //     image.mv('./public/product-images/.jpg',(err)=>{
  //       if(!err){
  //         res.redirect('/admin/add-banner')
  //       }else{
  //         console.log(err)
  //       }
  //     })
     
  //   })
      
  //   } catch (error) {
  //     next(error)
  //   }
    
    
  // });
  router.post('/add-banner',(req,res, next)=>{
    // req.body.price = parseInt(req.body.price)
    try {
      adminHelpers.addBanner(req.body,(id)=>{
        let image=req.files.Image
        image.mv('./public/product-images/'+id+'.jpg',(err)=>{
          if(!err){
            res.redirect('/admin/add-banner')
          }else{
            console.log(err)
          }
        })
      })
    } catch (error) {
      next(error);
    }
   
  })
  
  router.get('/delete-banner/:id',(req,res,next)=>{
    try {
      let bannerId=req.params.id
   
    adminHelpers.deleteBanner(bannerId).then((response)=>{
      res.redirect('/admin/view-banner')
    })
      
    } catch (error) {
      next(error)
    }
    
  
  })

router.get('/admin-logout', function(req, res, next) {
  try {
      // req.session.destroy();
  req.session.adminLoggedIn=false
  req.session.adminLoggedIn = null;

  res.redirect('/admin');
  } catch (error) {
    next(error);
  }

  
});


router.use(function(req, res, next) {
  next(createError(404));
});

// error handler
router.use(function(err, req, res, next) {
  console.log(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('admin/error');
});

module.exports = router;
