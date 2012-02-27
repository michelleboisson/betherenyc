// export Schemas to web.js
module.exports.configureSchema = function(Schema, mongoose) {
    
    // Comment - is an embedded document for BlogPost
    Comments = new Schema({
      name      : String
    , text      : String
    , date      : { type: Date, default: Date.now }
    });
    
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
    mongoose.model('Comment', Comments);

};