const db = require('../config/connection');
const collection = require('../config/collections');
const bcrypt = require('bcrypt');
const async = require('hbs/lib/async');
const objectid = require('mongodb').ObjectId

module.exports ={

doLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
        try {
            let loginStatus = false
        let response = {}
        let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })
        if (admin) {
            bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                if (status) {
                    response.admin = admin;
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
addCoupon: (couponDetails) => {
    couponDetails.Value = parseInt(couponDetails.Value)
    return new Promise(async (resolve, reject) => {
        try {
            await db.get().collection(collection.COUPON_COLLECTION).insertOne(couponDetails)
            resolve()
        } catch (error) {
            reject(error)
        }
    })
},
getCoupons: () => {
    return new Promise(async (resolve, reject) => {
        try {
            let coupons = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupons)
        } catch (error) {
            reject(error)
        }

    })
},
deleteCoupon:(couponId)=>{
    return new Promise ((resolve,reject)=>{
        try {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectid(couponId)}).then((response)=>{
                resolve(response)
            })
        } catch (error) {
            reject(error)
        }
        
    })
},



// addBanner: (banner) => {
//     return new Promise(async(resolve,reject)=>{
//     try {
       
//             db.get().collection('banner').insertOne(banner).then((data) => {
//                 resolve()
//             })

       
//     } catch (error) {
//         reject(error)
//     }
// })
   
// },

addBanner: (banner, callback) => {
    try {
        // product.deleted=false
        db.get().collection('banner').insertOne(banner).then((data) => {
            callback(data.insertedId)
        })
    } catch (error) {
        reject(error)
    }
 
},
getAllBanner:()=>{
    return new Promise(async(resolve,reject)=>{
    try {
       
            let banners=await db.get().collection('banner').find().toArray()
            resolve(banners)
       
    } catch (error) {
        reject(error)
    }
})
},
deleteBanner:(bannerId)=>{
    return new Promise((resolve,reject)=>{
    try {
       
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectid(bannerId)}).then((response)=>{
                resolve(response)
            })
       
    } catch (error) {
        reject(error)
    }
})
},
// addCategory: (catName) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             let verifyCat = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({ CategoryName: catName.CategoryName })
//             if (verifyCat) {
//                 resolve({ caterror: true })
//             } else {
//                 let data = await db.get().collection(collection.CATEGORY_COLLECTION).insertOne(catName)
//                 resolve(data.insertedId)
//             }
//         } catch (error) {
//             reject(error)
//         }
//     })
// },
// viewCategory: () => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             let catDetails = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
//             resolve(catDetails)
//         } catch (error) {
//             reject(error)
//         }
//     })
// },
}

