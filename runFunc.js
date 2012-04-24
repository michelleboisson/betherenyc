//one time functions

console.log("Running this one function...........................................");

// base dependencies for script
var mongoose = require('mongoose')
    , db = require('./accessDB')
    , moment = require('moment'); //time library

db.startup(process.env.MONGOLAB_URI); // start the db connection


// find events, fix time 
var query = db.Event.find({}, ['id', 'name', 'date', 'time', 'datetime.timestamp']);
    query.where(this.time != undefined && this.time != '' && this.datetime.timestamp == '');
    
    query.exec(function(err, events) {    
    if (events.length == 0) {
        console.log("There are currently no events");
        
    } else {
        console.log ("numEvents affected: "+events.length);
        
        // loop through and print out all users
        //for(i=0; i<events.length; i++) {
          
        events.forEach(function(event, index, array){    
            //console.log(events[i].name+" doen't have a timestamp. DOES HAVE: "+events[i].date+" - "+events[i].time);
 
            console.log(event.name);
            var thisTime = event.time;
            var thisDate = event.date;
            var translatedTime = moment(thisTime, "h:m a");//.format("dddd, MMMM Do YYYY, h:mm:ss a");
            
            var translatedDate = moment(thisDate);//.format("dddd, MMMM Do YYYY, h:mm:ss a");
            translatedDate.hours(translatedTime.hours()).minutes(translatedTime.minutes()).seconds(translatedTime.seconds());
            
            //not sure why I have to do this...
            translatedDate.add('days', 1);
     
           // console.log(index+" adfsdaf "+translatedTime.format("dddd, MMMM Do YYYY, h:mm:ss a")+" - "+translatedDate.format("dddd, MMMM Do YYYY, h:mm:ss a"));
           // console.log("------"+moment(translatedDate, "dddd, MMMM Do YYYY, h:mm:ss a"));
           // console.log("------"+translatedDate+" ------- "+new Date(translatedDate)+ " -------- "+ moment(translatedDate).format("dddd, MMMM Do YYYY, h:mm:ss a"));
           
            var updatedData = {
                datetime: {
                    timestamp : new Date(translatedDate)
                },
                lastEdited: new Date()
            }
            var conditions = { _id: event.id }
            //, update = { updatedData}
            , options = { multi: false };

            db.Event.update(conditions, updatedData, options, function callback (err, numAffected) {
              // numAffected is the number of updated documents
              
              if (err){
                console.log(err);
              }
              else{
                console.log(numAffected);
              }
            });
        
           
           
           
        });
    }
    
    console.log("*******CLOSING DB - SCRIPT SHOULD TERMINATE AS EXPECTED ******");
    db.closeDB(); // <--- VERY IMPORTANT. MUST CLOSE DB WHEN FINISHED.
   
})
    
