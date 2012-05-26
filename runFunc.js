//one time functions

console.log("Running this one function function...........................................");

// base dependencies for script
var mongoose = require('mongoose')
    , db = require('./accessDB')
    , moment = require('moment'); //time library

db.startup(process.env.MONGOLAB_URI); // start the db connection



var query = db.Event.find({}, ['id','name', 'name._keywords', 'date', 'time', 'datetime.timestamp']);
    //query.where(this.time != undefined && this.time != '' );
    //query.where('name._keywords').in(['Yogi']);
    //query.where('name._keywords').in(['Yogi','Teen']);
    query.exec(function(err, events) {
    
        if (err){
            console.log(err);
        }
        console.log("count", events.length);
        events.forEach(function(event, index, array){    
            console.log("this event: ", event.name);
        });
    
        console.log("*******CLOSING DB - SCRIPT SHOULD TERMINATE AS EXPECTED ******");
    db.closeDB(); // <--- VERY IMPORTANT. MUST CLOSE DB WHEN FINISHED.

    });
    
