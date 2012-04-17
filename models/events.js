var moment = require('moment'); //time library

// export Schemas to web.js
module.exports.configureSchema = function(Schema, mongoose) {
    

    // Event - 
    var Event = new Schema({
      name     : String
    , urlslug   : { type: String }
    , desc   : String
    , date      : { type: Date}
    , time      : String
    , place     : String
    , author    : { type: Schema.ObjectId, ref: 'User' }
    , location  : {
           latitude : Number
        ,  longitude : Number
        ,  placename : String
    }
    , datetime : {
        timestamp: {type: Date}
    }
    , link  : String
  
});
    Event
    .virtual('properDate')
    .get(function () {
        var date = moment(this.date);
        var time = moment(this.time);
        
        return this.name.first + ' ' + this.name.last;
    });

    // add schemas to Mongoose
    mongoose.model('Event', Event);

};