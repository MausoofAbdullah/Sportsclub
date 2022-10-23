
// require('dotenv').config();
const accountID=process.env.ACCOUNTID
const authToken=process.env.AUTHTOKEN
const serviceID=process.env.SERVICEID

const client=require('twilio')(accountID, authToken, serviceID)


module.exports={
    doSms:(userData)=>{
        console.log(userData.Mobile);
        return new Promise(async(resolve,reject)=>{
            try {
                let res={}
                await  client.verify.services(serviceID).verifications.create({
                    to:`+91${userData.Mobile}`,
                    channel: 'sms' 
                }).then((res)=>{
                    res.valid=true;
                    resolve(res)
                }).catch((err)=>{
                    console.log(err)
                })
            } catch (error) {
                reject(error)
            }
          
        })
    },
    otpVerify:(otpData,userData)=>{
        return new Promise(async(resolve,reject)=>{
            try {
                await  client
                .verify
                .services(serviceID)
                .verificationChecks
                .create({
                    to: `+91${userData.Mobile}`,
                    code:otpData.otp
                }).then((verifications)=>{
                    resolve(verifications.valid)
                })
            } catch (error) {
                reject(error)
            }
          
        })
    }
}
    
// module.exports = {

//     doSms: (userData) => {

//         return new Promise(async (resolve, reject) => {
//             let res = {}
//             console.log(userData);
//             console.log('eeeeeeeeeeeeeeee');
//             await client.verify.services(serviceSid).verifications.create({

//                 to: +91${userData.number},
//                 channel: "sms"
//             }).then((reeee) => {
//                 res.valid = true;
//                 resolve(res)
//                 console.log(reeee);
//             }).catch((err) => {

//                 console.log(err);

//             })
//         })
//     },

//     otpVerify: (otpData, userData) => {
//         console.log(otpData);
//         console.log(userData);


//         return new Promise(async (resolve, reject) => {
//             await client.verify.services(serviceSid).verificationChecks.create({
//                 to: +91${userData.number},
//                 code: otpData.otp
//             }).then((verifications) => {
//                 console.log(verifications);
//                 resolve(verifications.valid)
//             })
//         })
//     }



// }