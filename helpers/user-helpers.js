const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const async = require('hbs/lib/async');
const { response } = require('../app');
const objectid = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const { resolve } = require('path');
var instance = new Razorpay({
    key_id: process.env.RAZOR_ID,
    key_secret: process.env.RAZOR_SECRET,
});

module.exports = {
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            let signUpStatus = false
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email})
            if(user)
            {  resolve({ status: false }),response.status=true }
                else{
                    userData.Password = await bcrypt.hash(userData.Password, 10)
                    userData.blocked=false
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve(data.insertedId)
                })

                }


        })
    },

    // doSignup: (userData) => {
        
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             userData.Password = await bcrypt.hash(userData.Password, 10)
    //             userData.blocked = false
    
    //             db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
    //                 resolve(data)
    //             })
    //         } catch (error) {
                
    //         }
           
    //     })


    // },

    // verifyUser: (userData) => {
    //     let response = {}
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let verify = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
    //             if (verify) {
    //                 response.status = false
    //                 resolve(response)
    //             } else {
    //                 response.status = true
    //                 resolve(response)
    //             }
    //         } catch (error) {
                
    //         }
           
    //     })
    // },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            try {
                let loginStatus = false
                let response = {}
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email, blocked: false })
                if (user) {
                    bcrypt.compare(userData.Password, user.Password).then((status) => {
                        if (status) {
                            response.user = user;
                            response.status = true;
                            resolve(response);
    
                        } else {
                            resolve({ status: false })
                        }
                    })
                } else {
                    resolve({ status: false })
                }
            } catch (error) {
                reject(error)
            }
          
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            try {
                let userdetails = await db.get().collection(collection.USER_COLLECTION).find().toArray()
                resolve(userdetails)
            } catch (error) {
                reject(error)
            }
           
        })
    },

    getProductDetails: async (proId) => {
        return new Promise(async (resolve, reject) => {
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectid(proId) }).then((response) => {
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
           
        })
    },


    getUserDetails: (usrID) => {
        return new Promise(async(resolve, reject) => {
            try {
                let userData= await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectid(usrID) })  
                resolve(userData)
            } catch (error) {
                reject(error)
            }
          
            
        })
    },

    updateUserProfile: (userId, userData) => {
        return new Promise(async (resolve, reject) => {
            
            try {
                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId) }, {
                    $set: {
                        Name: userData.Name
                    }
                })
                resolve(response)
            } catch (error) {
                reject(error)
            }

        })

    },
   

    userAddress:(usrID)=>{
        return new Promise((resolve,reject) => {
        try {
          
                let address= db.get().collection(collection.USER_COLLECTION).aggregate([
                    {
                        $match: { _id: objectid(usrID) }
                    },
                    {
                        $unwind:'$Addresses'
                    },
                    {
                        $project: {
                            id:'$Addresses._addId',
                            Name:'$Addresses.Name',
                            Email:'$Addresses.Email',
                            Mobile:'$Addresses.Mobile',
                            Address:'$Addresses.Address',
                            Town:'$Addresses.Town',
                            Pincode:'$Addresses.Pincode',
                            District:'$Addresses.District',
                            State:'$Addresses.State',
                            
                       
                        }
        
                    }
        
                ]).toArray()
                resolve(address)
            
        } catch (error) {
            reject(error)
        }
    })
    
    },

    profileDetails: (addressData,usrID) => {
        create_random_id(15)
            function create_random_id(string_Length) {
                var randomString = ''
                var numbers = '1234567890'
                for (var i = 0; i < string_Length; i++) {
                    randomString += numbers.charAt(Math.floor(Math.random() * numbers.length))
                }
                addressData._addId = "ADD" + randomString
            }
            let subAddress = {
                _addId: addressData._addId,
                Name: addressData.Name,
                Email: addressData.Email,
                Mobile: addressData.Mobile,
                Address: addressData.Address,
              
                Town: addressData.Town,
                District: addressData.District,
                Pincode: addressData.Pincode,
               
                State: addressData.State
            }
            return new Promise(async (resolve, reject) => {
        try {
            
                let user = await db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectid(usrID) })
        
                if (user.Addresses) {
                    if (user.Addresses.length < 4) {
                        db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(usrID) }, {
                            $push: { Addresses: subAddress }
                        }).then(() => {
                            resolve()
                        })
                    } else {
                        resolve({ full: true })
                    }
        
                } else {
                    Addresses = [subAddress]
                    db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(usrID) }, { $set: { Addresses } }).then(() => {
                        resolve()
                    })
                }
             
        } catch (error) {
            reject(error)
        }
      })
       
    
        },

    deleteAddress: ( addressId,userId) => {
        return new Promise(async (reject, resolve) => {
            try {
                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId) }, {
                    $pull: { Addresses: { _addId:addressId } }
                    
                })
                console.log("hihow are");
            } catch (error) {
                reject(error)
            }
        })
    },
    getAddress: (userId, addId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let address = await db.get().collection(collection.USER_COLLECTION).aggregate([
                    {
                        $match: {
                            _id: objectid(userId)
                        }
                    },
                    {
                        $unwind: '$Addresses'
                    },
                    {
                        $project: { Addresses: 1 }
                    },
                    {
                        $match: { 'Addresses._addId': addId }

                    }
                ]).toArray()
                resolve(address[0])
            } catch (error) {
                reject(error)
            }
        })
    },
    editAddress: (userId, addId, addData) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(userId), "Addresses._addId": addId }, {
                    $set: {
                        "Addresses.$.Name": addData.Name,
                        "Addresses.$.Phone": addData.Phone,
                        "Addresses.$.Building_Name": addData.Building_Name,
                        "Addresses.$.Street_Name": addData.Street_Name,
                        "Addresses.$.City": addData.City,
                        "Addresses.$.District": addData.District,
                        "Addresses.$.State": addData.State,
                        "Addresses.$.Pincode": addData.Pincode
                    }
                })
                resolve({ status: true })
            } catch (error) {
                reject(error)
            }

        })
    },
    placeAddress:(addressId,userId)=>{
        return new Promise(async (resolve,reject) => {
        try {
           
     
            let address= await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match: { _id: objectid(userId) }
                },
                {
                    $unwind:'$Addresses'
                },
                {
                    $match: { 'Addresses._addId':addressId }
                },
                {
                    $project: {
                        id:'$Addresses._addId',
                        Name:'$Addresses.Name',
                        Email:'$Addresses.Email',
                        Mobile:'$Addresses.Mobile',
                        Address:'$Addresses.Address',
                        Town:'$Addresses.Town',
                        Pincode:'$Addresses.Pincode',
                        District:'$Addresses.District',
                        State:'$Addresses.State',
                   
                    }
    
                }
    
            ]).toArray()
            resolve(address[0])
            console.log(address[0]);
        } catch (error) {
            reject(error)
        }
    })
     
    },
    updateAddress:(address,addressId,usrID)=>{
        return new Promise(async(resolve, reject)=>{
        try {
            
                let user= await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectid(usrID),"Addresses._addId":addressId},
                {
                    $set:{
                        "Addresses.$.Name":address.Name,
                        "Addresses.$.Email":address.Email,
                        "Addresses.$.Mobile":address.mobile,
                        "Addresses.$.Address":address.Address,
                        "Addresses.$.Town":address.Town,
                        "Addresses.$.District":address.District,
                        "Addresses.$.State":address.State,
                        "Addresses.$.Pincode":address.Pincode
                      
                    }
                }
                ).then((response)=>{
                    resolve(response)
                })
           
        } catch (error) {
            reject(error)
        }
    })
    },
    updateName:(userName,usrID)=>{
        return new Promise((resolve, reject)=>{
        try {
           
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectid(usrID)},{$set:{Name:userName.name}}).then(()=>{
                    resolve()
                })
            
        } catch (error) {
            reject(error)
        }
    })
    },
    updateUserPassword:(usrID,userPassword)=>{
        return new Promise(async(resolve, reject) =>{
    
        try {
          
       
               
                userPassword.password = await bcrypt.hash(userPassword.password, 10)
               
                db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectid(usrID)},{$set:{Password:userPassword.password}}).then((data)=>{
                  
                    resolve(data)
        
            })
      
        } catch (error) {
            reject(error)
        }
    })
    
    
    
    },


    blockUser: (usrID, userDetails) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(usrID) }, {
                    $set: {
                        blocked: true
                    }
                }).then((response) => {
                    resolve()
                })
            } catch (error) {
                reject(error)
            }

           
        })
    },
    unblockUser: (usrID, userDetails) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectid(usrID) }, {
                    $set: {
                        blocked: false
                    }
                }).then((response) => {
                    resolve()
                })
            } catch (error) {
                reject(error)
            }
          
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectid(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            try {
                let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectid(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectid(userId), 'products.item': objectid(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectid(userId) },
                            {
                                $push: { products: proObj }

                            }).then((response) => {
                                resolve()
                            })
                }
                } else {
                let cartObj = {
                    user: objectid(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })

            }
            } catch (error) {
                reject(error)
            }
            
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectid(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
    
                    },
                    {   
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }  
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    }
    
                ]).toArray()
                // console.log(cartItems[0].products);
                resolve(cartItems)
            } catch (error) {
                reject(error)
            }
            
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectid(userId) })
                if (cart) {
                    count = cart.products.length
    
                }
                resolve(count)
            } catch (error) {
                reject(error) 
            }
           
        })
    },
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            try {
                if (details.count == -1 && details.quantity == 1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ _id: objectid(details.cart) },
                            {
                                $pull: { products: { item: objectid(details.product) } }
                            }).then((response) => {
                                resolve({ removeProduct: true })
                            })
                } else {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ _id: objectid(details.cart), 'products.item': objectid(details.product) },
                            {
                                $inc: { 'products.$.quantity': details.count }
                            }
                        ).then((response) => {
                            resolve({ status: true })
    
                        })
    
                }
            } catch (error) {
                reject(error)
            }
           
        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                    {
                        $match: { user: objectid(userId) }
                    },
                    {
                        $unwind: '$products'
                    },
                    {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
    
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$product.price' }] } }
                        }
                    }
    
                ]).toArray()
    
    if(total.length==0){
        resolve(total)
    } 
    else{
        resolve(total[0].total)
    }
               
            } catch (error) {
                reject(error)
            }
            
        })

    },

    // getSingleAmount: (userId) => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
    //                 {
    //                     $match: { user: objectid(userId) }
    //                 },
    //                 {
    //                     $unwind: '$products'
    //                 },
    //                 {
    //                     $project: {
    //                         item: '$products.item',
    //                         quantity: '$products.quantity'
    //                     }
    
    //                 },
    //                 {
    //                     $lookup: {
    //                         from: collection.PRODUCT_COLLECTION,
    //                         localField: 'item',
    //                         foreignField: '_id',
    //                         as: 'product'
    //                     }
    //                 },
    //                 {
    //                     $project: {
    //                         item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
    //                     }
    //                 },
    //                 {
    //                     $group: {
    //                         _id: null,
    //                         total: { $multiply: [{ $toInt: '$quantity' }, { $toInt: '$product.price' }] } 
    //                     }
    //                 }
    
    //             ]).toArray()
    
    
    //             resolve(total[0].total)
    //         } catch (error) {
    //             reject(error)
    //         }
            
    //     })

    // },
    deleteProduct :(cartId,proId)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({_id:objectid(cartId)},
                        {
                            $pull:{products:{item:objectid(proId)}}
                        }).then((response)=>{
                            resolve({removeProduct:true})
                        })
            } catch (error) {
                reject(error)
            }
           
        })
    },
    deletewishProduct:(cartId,proId)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.WHISH_COLLECTION)
                .updateOne({_id:objectid(cartId)},
                        {
                            $pull:{products:{item:objectid(proId)}}
                        }).then((response)=>{
                            resolve({removeProduct:true})
                        })
            } catch (error) {
                reject(error)
            }
           
        })
    },
    
    
    // addToWhishlist: (proId, userId) => {
    //     let proObj = {
    //         item: objectid(proId),
    //         quantity: 1
    //     }
    //     return new Promise(async (resolve, reject) => {
    //         let userWhish = await db.get().collection(collection.WHISH_COLLECTION).findOne({ user: objectid(userId) })
    //         if (userWhish) {
    //             let proExist=userWhish.products.findIndex(products=>products.item==proId)
    //             console.log(proExist);
    //             if(proExist!=-1){
    //                 db.get().collection(collection.WHISH_COLLECTION)
    //                 .updateOne({user:objectid(userId),'products.item':objectid(proId)},
    //                 {
    //                     $inc:{'products.$.quantity':1}
    //                 }
    //                 ).then(()=>{
    //                     resolve()
    //                 })
    //             }else
    //             db.get().collection(collection.WHISH_COLLECTION)
    //                 .updateOne({ user: objectid(userId) },
    //                     {
    //                         $push: { products: proObj }

    //                     }).then((response) => {
    //                         resolve()
    //                     })

    //         } else {
    //             let whishObj = {
    //                 user: objectid(userId),
    //                 products: [proObj]
    //             }
    //             db.get().collection(collection.WHISH_COLLECTION).insertOne(whishObj).then((response) => {
    //                 resolve()
    //             })

    //         }
    //     })
    // },

    // getWhishProducts: (userId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let whishItems = await db.get().collection(collection.WHISH_COLLECTION).aggregate([
    //             {
    //                 $match: { user: objectid(userId) }
    //             },
    //             {
    //                 $unwind: '$products'
    //             },
    //             {
    //                 $project: {
    //                     item: '$products.item',
    //                     quantity: '$products.quantity'
    //                 }

    //             },
    //             {
    //                 $lookup: {
    //                     from: collection.PRODUCT_COLLECTION,
    //                     localField: 'item',
    //                     foreignField: '_id',
    //                     as: 'products'
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     item: 1, quantity: 1, products: { $arrayElemAt: ['$products', 0] }
    //                 }
    //             }

    //         ]).toArray()
    //         console.log("what is this"+whishItems);
    //         resolve(whishItems)
    //     })
    // },


    addToWhishlist:(proId,usrID)=>{
        let prodObj = {
            item: objectid(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
        try {
            
                let userWish = await db.get().collection(collection.WHISH_COLLECTION).findOne({ user: objectid(usrID) })
                if (userWish) {
                    let proExist = userWish.products.findIndex(products => products.item == proId)
                    
                    if (proExist != -1) {
                        db.get().collection(collection.WHISH_COLLECTION)
                            .updateOne({
                                user: objectid(usrID),
                                'products.item': objectid(proId)
                            }
                                , {
                                    $inc: { 'products.$.quantity': 1 }
                                }
                            )
                    } else {
    
    
    
                        db.get().collection(collection.WHISH_COLLECTION).updateOne({ user: objectid(usrID) }, {
    
                            $push: { products: prodObj }
    
    
                        }
    
                        )
                            .then((response) => {
                                resolve(response)
                            })
                    }
    
                }
                else {
                    let wishObj = {
                        user: objectid(usrID),
                        products: [prodObj]
    
                    }
                    await db.get().collection(collection.WHISH_COLLECTION).insertOne(wishObj).then((response) => {
                        resolve(response)
                    })
    
                }
           
    
        } catch (error) {
            reject(error)
        }
    })
       
    },

    getWhishProducts:(usrID)=>{
        return new Promise(async(resolve, reject)=>{
        try {
            
                let whishItems=await db.get().collection(collection.WHISH_COLLECTION).aggregate([
                    {
                        $match: { user: objectid(usrID) }
                    },
                    {
                        $unwind: '$products'
                    }, {
                        $project: {
                            item: '$products.item',
                            quantity: '$products.quantity'
                        }
                    },
                    {
                        $lookup: {
                            from: collection.PRODUCT_COLLECTION,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'products'
                        }
                    },
                    {
                        $project: {
                            item: 1, quantity: 1, products: { $arrayElemAt: ['$products', 0] }
                        }
                    }
                    
                ]).toArray()
    
                resolve(whishItems)
                console.log("what is this"+whishItems);
    
            
        } catch (error) {
            reject(error)
        }
    })
    },
    getWhishCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let count = 0
            let whish = await db.get().collection(collection.WHISH_COLLECTION).findOne({ user: objectid(userId) })
            if (whish) {
                count = whish.products.length

            }
            resolve(count)
            } catch (error) {
                reject(error)
            }
            
        })
    },
    deleteWish:(wishId,proId)=>{
        return new Promise((resolve,reject)=>{
        try {
           
                db.get().collection(collection.WHISH_COLLECTION).updateOne({_id:objectid(wishId)},
                {
                    $pull:{products:{item:objectid(proId)}}
                }
                ).then((response)=>{
                    resolve({deleteProduct:true})
                })
           
        } catch (error) {
            reject(error)
        }
    })
    },

    checkout: (order, products, total) => {
        return new Promise((resolve, reject) => {
            try {
                let status = order.paymentType === 'COD' ? 'placed' : 'pending'
                let orderObj = {
                    deliveryDetails: {
                        phone: order.phone,
                        address: order.country,
                        postcode: order.postcode,
                    },
                    userId: objectid(order.userId),
                    paymentType: order.paymentType,
                    products: products,
                    totalAmount: order['grandTotal'],
                    status: status,
                    date: new Date().toDateString()
                }
                db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                    db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectid(order.userId) })
                    resolve(response.insertedId)
             
                })
            } catch (error) {
                reject(error)
            }
       
           

        })

    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectid(userId) })
            resolve(cart.products)
            } catch (error) {
                reject(error)
            }
            
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectid(userId) }).sort({date:-1}).toArray()
                resolve(orders)
            } catch (error) {
                reject(error)
            }
           
        })
    },
    // getOrderProducts: (orderId) => {
    //     return new Promise(async (resolve, reject) => {
    //         let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
    //             {
    //                 $match: { _id: objectid(orderId) }
    //             },
    //             {
    //                 $unwind: '$products'
    //             },
    //             {
    //                 $project: {
    //                     item: '$products.item',
    //                     quantity: '$products.quantity'
    //                 }

    //             },
    //             {
    //                 $lookup: {
    //                     from: collection.PRODUCT_COLLECTION,
    //                     localField: 'item',
    //                     foreignField: '_id',
    //                     as: 'product'
    //                 }
    //             },
    //             {
    //                 $project: {
    //                     item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
    //                 }
    //             }

    //         ]).toArray()
    //         // console.log(cartItems[0].products);
    //         resolve(orderItems)
    //     })
    // },

    getOrderProduct:(orderID)=>{
        return new Promise(async(resolve, reject)=>{
        try {
          
           
                let orderItems=await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                    [
                        {
                          '$match': {
                            '_id': new objectid(orderID)
                          }
                        }, {
                          '$unwind': {
                            'path': '$products'
                          }
                        }, {
                          '$lookup': {
                            'from': 'product', 
                            'localField': 'products.item', 
                            'foreignField': '_id', 
                            'as': 'result'
                          }
                        }, {
                          '$unwind': {
                            'path': '$result'
                          }
                        }, {
                          '$project': {
                            'products':1, 
                            'result': 1, 
                            'date': 1, 
                            'totalAmount': 1, 
                            'paymentType': 1, 
                            'status': 1
                          }
                        }
                      ]
                    
                ).toArray()
               
                resolve(orderItems)
    
          
        } catch (error) {
            reject(error)
        }
    })
    },
    value:(orderId)=>{
        let response={}
        return new Promise(async (resolve, reject) => {
        try {
           
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectid(orderId)})
            console.log(order);
            console.log(order._id);
     if(order){
        if(order.value){
            response.status= true
            response.id =order._id
            
            resolve(response)
        }else{
            if(order.cancel){

    
            }else{
                response.status=false
                response.id =order._id
            resolve(response)
    
            }
    
        
        }
       
     }else{
        response.status=false
        response.id =order._id
        resolve(response)
     }
    
    
        } catch (error) {
            reject(error)
        }
    })
    
        },
    generateRazorpay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            try {
                var options = {
                    amount: total * 100,  // amount in the smallest currency unit
                    currency: "INR",
                    receipt: "" + orderId
                };
                instance.orders.create(options, function (err, order) {
                    console.log("new order", order);
                    resolve(order)
                });
            } catch (error) {
                reject(error)
            }
           

        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            try {
                const crypto = require('crypto');
                let hmacValue = crypto.createHmac('sha256', '74AOB12QHdv6YwNjShJeObfZ')
                hmacValue.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
                hmacValue = hmacValue.digest('hex');
                if (hmacValue == details['payment[razorpay_signature]']) {
                    resolve()
                } else {
                    reject()
                }
            } catch (error) {
                reject(error)
            }
         

        })
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            try {
                db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectid(orderId) },
                    {
                        $set: {
                            status: 'placed'
                        }
                    }).then(() => {
                        resolve()
                    })
            } catch (error) {
                reject(error)
            }
           
        })
    },
    applyCoupon: (couponName, userId) => {
        let userrId = objectid(userId)
        return new Promise(async (resolve, reject) => {
            try {
                let result = await db.get().collection(collection.COUPON_COLLECTION).findOne({ CouponName: couponName })
                if (result) {
                    var d = new Date()
                    let str = d.toJSON().slice(0, 10)
                    if (str >= result.Expiry_Date) {
                        resolve({ expired: true })
                    } else {
                        let user = await db.get().collection(collection.COUPON_COLLECTION).findOne({ CouponName: couponName, users: { $in: [objectid(userId)] } })
                        if (user) {
                            resolve({ used: true })
                        } else {
                            resolve(result)
                        }
                    }
                } else {
                    resolve({ notAvailable: true })
                }
            } catch (error) {
                reject(error)
            }

        })
    },
    adminOrders:()=>{
        return new Promise(async(resolve, reject)=>{
        try {
            
                let adminorderlist=db.get().collection(collection.ORDER_COLLECTION).find().sort({date:-1}).toArray()
                resolve(adminorderlist)
           
        } catch (error) {
            reject(error)
        }
    })
    },
    
    changeStatus:(orderId)=>{
        return new Promise(async(resolve, reject) => {
        try {
           
    
                let changeOrderStatus = await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(orderId)},{$set:{status:'packed',value:false,shipped: true,delivered: false}})
                    resolve()  
           
        } catch (error) {
            reject(error)
        }
    })
    
    },
    
    changeStatusShipped:(orderId)=>{
        return new Promise(async(resolve, reject) => {
        try {
            
                let changeOrderStatus = await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(orderId)},{$set:{status:'Shipped',value:false,shipped: false,delivered: true}})
                resolve()  
        
            
        } catch (error) {
            reject(error)
        }
    })
       
    },
    
    changeStatusDelivered:(orderId)=>{
        return new Promise(async(resolve, reject) => {
        try {
            
                let changeOrderStatus = await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(orderId)},{$set:{status:'Delivered',value:true,shipped: false,delivered: true}})
                resolve()  
        
           
        } catch (error) {
            reject(error)
        }
    })
    },
    btnChange:(orderId)=>{
        let response = {}
            return new Promise(async (resolve, reject) => {
        try {
            
                let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectid(orderId) })
                if (order){
                    if(order.shipped){
                        response.id=orderId
                        response.status = true
                        response.pack=false
                        resolve(response)
                    }else if(order.delivered){
                        response.id=orderId
                        response.status = false
                        resolve(response)
                    }else{
                        response.pack=true
                        response.status = false
                        response.id=orderId
                        resolve(response)
                    }
    
                    
                }
    
           
        } catch (error) {
            reject(error)
        }
    })

    }, 
    changeStatusCancelled:(orderId)=>{
        return new Promise(async(resolve, reject) => {
        try {
            
                let changeOrderStatus = await db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectid(orderId)},{$set:{status:'Cancelled',value:false}})
                resolve()  
        
           
        } catch (error) {
            reject(error)
        }
    })
    }, 
    
    getUserCount:  (req, res) => {
        return new Promise(async(resolve, reject) => {
        try {
           
    
    
                let user = await db.get().collection(collection.USER_COLLECTION).find().count()
        
                resolve(user)
          
        } catch (error) {
            reject(error)
        }
    })
    },

    getOrderCount:  (req, res) => {
        return new Promise(async(resolve, reject) => {
        try {
           
    
    
                let user = await db.get().collection(collection.ORDER_COLLECTION).find().count()
        
                resolve(user)
           
        } catch (error) {
            reject(error)
        }
    })
    },
    totalCOD: () => {
        return new Promise(async (resolve, reject) => {
        try {
           
  
                let count = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentType: "COD", }).count()
                resolve(count)
          
       
        } catch (error) {
            reject(error)
        }
    })
    },
    totalONLINE: () => {
        return new Promise(async (resolve, reject) => {
        try {
          
  
                let onlineCount = await db.get().collection(collection.ORDER_COLLECTION).find({ paymentType: "ONLINE", }).count()
                resolve(onlineCount)
          
        
        } catch (error) {
            reject(error)
        }
    })
    },

    totalDelivered: () => {
        return new Promise(async (resolve, reject) => {
        try {
           
  
                let totalDeliveredCount = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "Delivered" }).count()
                resolve(totalDeliveredCount)
          
        } catch (error) {
            reject(error)
        }
        
        
    })
    },
    cancelled: () => {
        return new Promise(async (resolve, reject) => {
        try {
           
  
                let cancelled = await db.get().collection(collection.ORDER_COLLECTION).find({ status: "Cancelled" }).count()
                resolve(cancelled)
          
       
        } catch (error) {
            reject(error)
        }
    })
    },


    totalMonthAmount: () => {
        return new Promise(async (resolve, reject) => {
        try {
           

                let amount = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            
                    
                    {
                        $setWindowFields: {
                          
                           
                           output: {
                            Tamount: {
                                 $sum: "$totalAmount",
                                 
                              }
                           }
                        }
    
                     },
                     {
                     
                            $project: {
                                Tamount:1
                            }
                    
                     }
    
                ]).toArray()
                resolve(amount[0])
                console.log( Tamount);
    
          
        } catch (error) {
            reject(error)
        }
    })
},

}
