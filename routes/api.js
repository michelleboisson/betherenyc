/**
  * Module dependencies.
  */
var db = require('../accessDB');

module.exports = {

   getAllEventsJSON : function(request, response){
    
        // define the fields you want to include in your json data
        includeFields = ['name','desc','urlslug','date','time','place', 'location', 'link'];
        
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
        includeFields = ['name','desc','urlslug','date','time','place', 'location','link'];
        
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
    }
}