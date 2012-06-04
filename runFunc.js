//one time functions

console.log("Running this one function function...........................................");
console.log("...........................................REMOVING OLD EVENTS...........................................");

// base dependencies for script
var mongoose = require('mongoose')
    , db = require('./accessDB')
    , moment = require('moment'); //time library

db.startup(process.env.MONGOLAB_URI); // start the db connection

var today = moment().subtract('days',1);

var query = db.Event.remove({'datetime.date' : undefined}, ['id','name', 'datetime.date']);
    //query.where(this.time != undefined && this.time != '' );
    //query.where('name._keywords').in(['Yogi']);
    //query.where('name._keywords').in(['Yogi','Teen']);
    //query.where('datetime.date').lte(today);
    query.exec(function(err, events) {
    
        if (err){
            console.log(err);
        }
        console.log("count", events.length);
        
        events.forEach(function(event, index, array){   
        
            console.log("this event: ", index, event.datetime.date, event.name);
            
            
            if (index >= events.length){
	          console.log("*******CLOSING DB - SCRIPT SHOULD TERMINATE AS EXPECTED ******");
        db.closeDB(); // <--- VERY IMPORTANT. MUST CLOSE DB WHEN FINISHED.

            }
        });//end forEach
    
        
    });//end query
    
