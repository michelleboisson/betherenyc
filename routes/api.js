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
    
        query.sort('datetime.timestamp',-1); //sort by most recent
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
    
        query.sort('datetime.timestamp',-1); //sort by most recent
        query.exec(function (err, thisEvent) {
    
            jsonData = {
              'status' : 'OK',
              'event' : thisEvent
            }
    
            response.json(jsonData);
        });
    },
    
    getSearchJSON : function(request,response){
          //var sname = request.params.searchName.toUpperCase();
         //var url_parts = url.parse(request.url, true);
          var sdate = request.query["date"];
          console.log(sdate);
          
          var sname = request.query["name"];
          console.log(sname);
          
          var splace = request.query["place"];
          console.log(splace);
          
          var conditions ={};
          if (sname!= "" && sname!= undefined && sname!=null)
               conditions.name = { $regex: sname };
          
     /*     if (splace!="" && splace!=undefined && splace!=null)
               conditions.location= { placename: { $regex: splace }};
     */        
          var query = db.Event.find( conditions ,['id', 'name', 'place','desc','location', 'link', 'datetime'] );
          
          if(sdate!= "" && sdate!= undefined && sdate!=null){
               var convertedDate = moment(sdate, "YYYY-MM-DD");
               
               convertedDate.hours(0).minutes(0).seconds(0);
               var tomorrow = moment(convertedDate).add('hours',24);
               query.where('datetime.timestamp').gte(convertedDate).lte(tomorrow);
          }
          
          query.sort('datetime.timestamp',-1); //sort by date in descending order
                   	
          query.exec({}, function(err, allEvents){
	       console.log(allEvents);
	       // prepare template data
	       if (err){
                    console.log("there was an error : "+err);
               }
               else{
               // prepare template data
                    var jsonData = {
                    'status' : 'OK',
                    'name-query': sname,
                    'date-query': sdate,
                    'count': allEvents.length,
                    'events' : allEvents
                    };
               response.json(jsonData);
               }
          });
     }   
    
    
}