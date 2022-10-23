const db = require('../config/connection');
const collection = require('../config/collections');
const async = require('hbs/lib/async');
const objectId=require('mongodb').ObjectID

module.exports = {  
    addProduct: (product, callback) => {
        try {
            product.deleted=false
            db.get().collection('product').insertOne(product).then((data) => {
                callback(data.insertedId)
            })
        } catch (error) {
            reject(error)
        }
     
    },
    

    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({deleted:false}).toArray()
                resolve(products)
            } catch (error) {
                reject(error)
            }
      
        })
    },
    // getAllProducts:()=>{
    //     return new Promise(async(resolve,reject)=>{
    //         try {
    //             let deleted = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({  deleted: false })
    //             if(deleted){
    //                 let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
    //                 resolve(products)
                    
    //             }else {
    //                 resolve({ status: false })
    //             }
                
    //         } catch (error) {
    //             reject(error)
    //         }
      
    //     })
    // },

    addCategory : (cataData)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                
                cataData.category = cataData.category.toUpperCase();
    
                let categoryExist = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({category:cataData.category,})
    
                if (categoryExist){
                    resolve({exist:true})
                }else{
                    db.get().collection(collection.CATEGORY_COLLECTION).insertOne(cataData)
                    resolve({exist:false})
                }
            } catch (error) {
                reject(error)
            }
          
           
        })
        
    },
    showCategory:()=>{
        return new Promise(async(resolve,reject)=>{
            try {
                let categories=await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
                resolve(categories)
            } catch (error) {
                reject(error)
            }
           
        })
    },

    deleteCategory : (catId)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({_id:objectId(catId)}).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
           
            
        })
    },

    //  deleteProduct:(proId)=>{
    //     return new Promise((resolve,reject)=>{
    //         try {
    //             db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
    //                 $set:{
    //                     deleted:true
    //                 }
    //             }).then((response)=>{
    //                 resolve(response)
    //             })
    //         } catch (error) {
    //             reject(error)
    //         }
           
    //     })
    // },
deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                    $set:{
                        deleted:true
                    }
                }).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
           
        })
    },

    // deleteProduct: (proId) => {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             let imgDel = null
    //             let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(proId) })
    //             imgDel = product.Image
    //             await db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(proId) })
    //             resolve(imgDel)
    //         } catch (error) {
    //             reject(error)
    //         }
    //     })
    // },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                    resolve(product)
                })
            } catch (error) {
                reject(error)
            }
          
            
        })
    }, 
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            try {
                db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                    $set:{
                        name:proDetails.name,
                        description:proDetails.description,
                        price:proDetails.price
                 
    
                        
                    }
                }) .then((response)=>{
                    resolve()
                })
            } catch (error) {
                reject(error)
            }
          
        })
    },

    categoryProducts: (data) => {
      
        return new Promise(async (resolve, reject) => {
            try {
                let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ category: data ,deleted:false}).toArray()
           
                resolve(products)  
            } catch (error) {
                reject(error)
            }
           
        })
    },
    getAllCategory:()=>{
        return new Promise(async(resolve,reject)=>{
        try {
           
                let category=await db.get().collection('category').find().toArray()
                resolve(category)
            
        } catch (error) {
            reject(error)
        }
    })
        
    },
   
    
    
}