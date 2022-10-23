// function addToCart(proId){
//     $.ajax({
//         url:'/add-to-cart/'+proId,
//         method:'get',
//         success:(response)=>{
//             if(response.status){
//             let count=$('#cart-count').html()
//             count=parseInt(count)+1
//             $("#cart-count").html(count)
//             }
            
//         }
//     })
// }

// function addToWhishlist(proId){
//     $.ajax({
//         url:'/add-to-whishlist/'+proId,
//         method:'get',
//         success:(response)=>{
//             if(response.status){
//             let count=$('#wish-count').html()
//             count=parseInt(count)+1
//             $("#wish-count").html(count)
//             }
            
//         }
//     })
// }