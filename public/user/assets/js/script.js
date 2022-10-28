// // function addToCart(proId){
// //     $.ajax({
// //         url:'/add-to-cart/'+proId,
// //         method:'get',
// //         success:(response)=>{
// //             if(response.status){
// //             let count=$('#cart-count').html()
// //             count=parseInt(count)+1
// //             $("#cart-count").html(count)
// //             }
            
// //         }
// //     })
// // }

// // function addToWhishlist(proId){
// //     $.ajax({
// //         url:'/add-to-whishlist/'+proId,
// //         method:'get',
// //         success:(response)=>{
// //             if(response.status){
// //             let count=$('#wish-count').html()
// //             count=parseInt(count)+1
// //             $("#wish-count").html(count)
// //             }
            
// //         }
// //     })
// // }

// function addToCart(proId) {
//     Swal.fire({
//         // position: 'top-end',
//         icon: 'success',
//         title: 'Added to Cart',
//         showConfirmButton: false,
//         timer: 1500
//       })
//     $.ajax({
//         url: '/add-to-cart/' + proId,
//         method: 'get',
//         success: (response) => {
//             if (response.status) {
//                 let count = $('#cart-count').html()
//                 count = parseInt(count) + 1
                
//                 $("#cart-count").html(count)
//                 location.reload()

//             }
//         }
//     })
// }



//   function removeProduct(cartId, proId) {
//         console.log(cartId, proId)
//         $.ajax({
//             url: '/delete-product/' + cartId + '/' + proId,
//             method: 'get',
//             success: (response) => {
//                 if (response.removeProduct) {
                
//                     location.reload()
//                     $("#cart-count").load(location.href + "#cart-count");
//                         	Swal.fire(
// 						'product removed',
// 						'',
// 						'success'
// 					)
//                 }
//             }
//         })
//     }



// function addToWhishlist(proId) {
//     Swal.fire({
//         // position: 'top-end',
//         icon: 'success',
//         title: 'Added to Wishlist',
//         showConfirmButton: false,
//         timer: 1500
//       })
//     $.ajax({
//         url: '/add-to-whishlist/' + proId,
//         method: 'get',
//         success: (response) => {
//             if (response.status) {
//                 let count = $('#whish-count').html()
//                 count = parseInt(count) + 1
                
//                 $("#whish-count").html(count)
//                 location.reload()

//             }
//         }
//     })
// }

function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
            let count=$('#cart-count').html()
            count=parseInt(count)+1
           document.getElementById('cart-count').innerHTML=count
//$("#cart-count").html(count)
            location.reload()
            	Swal.fire(
						'Item added to Cart!',
						'',
						'success'
					)
            }else{
                location.href="/login"
            }
            
        }
    })
}