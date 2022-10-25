const mongoClient = require('mongodb').MongoClient
const state = {
    db: null
}


module.exports.connect = function (done) {
    const url = 'mongodb+srv://MausoofAbdullah2:9686327955@cluster0.79bwqcz.mongodb.net/?retryWrites=true&w=majority' 
   
    const dbname = 'SportsClub'
   

    mongoClient.connect(url, (err, data) => {
        if (err) return done(err)
        state.db = data.db(dbname)
        done()

    })

}

module.exports.get = function () {
    return state.db
}