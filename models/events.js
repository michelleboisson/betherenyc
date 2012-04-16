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
    , link  : String
  
});
    Event
    .virtual('prettyDate')
    .get(function () {
        var date = new Date(this.date);
        var d = date.getDate();
        var m = date.getMonth()+1;
        
        return this.name.first + ' ' + this.name.last;
    });


    // add schemas to Mongoose
    mongoose.model('Event', Event);

};