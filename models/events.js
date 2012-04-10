// export Schemas to web.js
module.exports.configureSchema = function(Schema, mongoose) {
    

    // Event - 
    var Event = new Schema({
      name     : String
    , urlslug   : String
    , desc   : String
    , date      : { type: Date}
    , time      : String
    , place     : String
    });

    // add schemas to Mongoose
    mongoose.model('Event', Event);

};