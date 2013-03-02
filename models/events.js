var moment = require('moment'); //time library

// export Schemas to web.js
module.exports.configureSchema = function(Schema, mongoose) {
    

    // Event - 
    var Event = new Schema({
      name     : String
    , urlslug   : { type: String }
    , desc   : String
    , time      : String
    , place     : String
    , author    : {
            name: String
        ,   email: String
    }
    , location  : {
           latitude : Number
        ,  longitude : Number
        ,  placename : String
        ,  address : String
        ,  trains: String
        ,  station: String
    }
    , datetime : {
        timestamp: {type: Date},
        date: {type: Date},
        starttimestamp: {type: Date},
        endtimestamp: {type: Date}
    }
    , link  : String
    , lastEdited: { type: Date }
  
});
Event
.virtual('datetime.strDate')
.get(function () {
	var thisStrDate = moment(this.datetime.date);
	var convertedDate = moment(thisStrDate, "YYYY-MM-DD");
    return convertedDate;

  return this.link.substring(this.link.charAt(0),this.link.indexOf('/',8));
});

Event
.virtual('linkname')
.get(function () {
  return this.link.substring(this.link.charAt(0),this.link.indexOf('/',8));
});
Event
.virtual('datetime.moment')
.get(function() {
    var thisEventMoment = moment(this.datetime.timestamp);
    return thisEventMoment;
});
Event
.virtual('name.keywords')
.get(function() {
    var thisNameKeywords = this.name.split(" ");
    return thisNameKeywords;
});
    // add schemas to Mongoose
    mongoose.model('Event', Event);

};