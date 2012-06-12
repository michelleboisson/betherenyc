//one time functions

// base dependencies for script
var mongoose = require('mongoose')
    , db = require('./accessDB')
    , moment = require('moment'); //time library

db.startup(process.env.MONGOLAB_URI); // start the db connection

console.log("Running this one function function...........................................");
console.log("...........................................REMOVING OLD EVENTS...........................................");


var today = moment().subtract('days',1);
console.log("today minus 1 day: "+today.calendar());

var query = db.Event.remove({}, ['id','name', 'datetime.starttimestamp']);
    //query.where(this.time != undefined && this.time != '' );
    //query.where('name._keywords').in(['Yogi']);
    //query.where('name._keywords').in(['Yogi','Teen']);
    query.where('datetime.starttimestamp').lt(today);
    query.exec(function(err, events) {
    
        if (err){
            console.log(err);
        }
        console.log("count", events.length);
        
        if (events.length == 0){
        	console.log("no events found.");
	        console.log("*******CLOSING DB - SCRIPT SHOULD TERMINATE AS EXPECTED ******");
	        db.closeDB(); // <--- VERY IMPORTANT. MUST CLOSE DB WHEN FINISHED.
        }
        
        events.forEach(function(event, index, array){   
        
            console.log("this event: ", index, event.datetime.starttimestamp, event.name);
            
            
            if (index >= events.length){
	          
	          console.log("*******CLOSING DB - SCRIPT SHOULD TERMINATE AS EXPECTED ******");
	          db.closeDB(); // <--- VERY IMPORTANT. MUST CLOSE DB WHEN FINISHED.

            }
        });//end forEach
    
        
    });//end query
    
