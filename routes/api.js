/**
  * Module dependencies.
  */
var db = require('../accessDB');
var moment = require('moment'); //time library

module.exports = {

   apiInfo : function(resquest, response){
          response.render('api/developer-info.html');
   },

   getAllEventsJSON : function(request, response){
    
        // define the fields you want to include in your json data
        includeFields = ['name','desc','urlslug','place', 'location', 'link', 'datetime.timestamp'];
        
        // query for all events
        queryConditions = {}; //empty conditions - return everything
        var query = db.Event.find( queryConditions, includeFields);
    
        query.sort('date',-1); //sort by most recent
        query.exec(function (err, eventPosts) {
    
            jsonData = {
              'status' : 'OK',
              'events' : eventPosts
            }
    
            response.json(jsonData);
        });
    },
    
    
    getEventbyIdJSON : function(request, response){
    
        var requestedEventID = request.params.eventID;
    
        // define the fields you want to include in your json data
        includeFields = ['name','desc','urlslug','place', 'location','link', 'datetime.timestamp'];
        
        // query for one events
        var query = db.Event.findById( requestedEventID, includeFields);
    
        query.sort('date',-1); //sort by most recent
        query.exec(function (err, thisEvent) {
    
            jsonData = {
              'status' : 'OK',
              'event' : thisEvent
            }
    
            response.json(jsonData);
        });
    },
    
     getEventsbyDate : function(request, response) {
        
        var requestedDate= request.params.date;
        
        var convertedDate = moment(requestedDate, "YYYY-MM-DD");
        console.log("converted Date: "+convertedDate);
        //console.log(convertedDate.date(), convertedDate.month(), convertedDate.year());

        //
        convertedDate.hours(0).minutes(0).seconds(0);
        var tomorrow = moment(convertedDate).add('hours',24);
        
        // build the query
        var query = db.Event.find({}, ['id', 'name', 'place','desc','location', 'link', 'datetime']);
        query.sort('datetime.timestamp',1); //sort by date in descending order
        query.where('datetime.timestamp').gte(convertedDate).lte(tomorrow);
        //query.$where('moment(this.datetime.timestamp).month() == convertedDate.month()');
       // query.$where('moment(this.datetime.timestamp).year() == convertedDate.year()');

        // run the query and display blog_main.html template if successful
        query.exec({}, function(err, eventPosts){
           if (err){
               console.log("there was an error : "+err);
           }
          else{
          // prepare template data
          var jsonData = {
               'status' : 'OK',
               'date': requestedDate,
               'count': eventPosts.length,
               'events' : eventPosts
          };
          response.json(jsonData);
        }
        });
    }
    
    
    
    
}