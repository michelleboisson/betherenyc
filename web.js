var express = require('express'); 
var ejs = require('ejs');
var app = express.createServer(express.logger());

var mongoose = require('mongoose'); // include Mongoose MongoDB library
var schema = mongoose.Schema; 

var requestURL = require('request'); //gets data from outside


var fs = require('fs');
var xml2js = require('xml2js'); //xml to js 
var parser = new xml2js.Parser(); //xml to js 


/************ DATABASE CONFIGURATION **********/
app.db = mongoose.connect(process.env.MONGOLAB_URI); //connect to the mongolabs database - local server uses .env file

// Include models.js - this file includes the database schema and defines the models used
require('./models').configureSchema(schema, mongoose);

// Define your DB Model variables
var Event = mongoose.model('Event');
/************* END DATABASE CONFIGURATION *********/


/*********** SERVER CONFIGURATION *****************/
//like a setup function
app.configure(function() {
    
    /*********************************************************************************
        Configure the template engine
        We will use EJS (Embedded JavaScript) https://github.com/visionmedia/ejs
        
        Using templates keeps your logic and code separate from your HTML.
        We will render the html templates as needed by passing in the necessary data.
    *********************************************************************************/

    app.set('view engine','ejs');  // use the EJS node module
    app.set('views',__dirname+ '/views'); // use /views as template directory
    app.set('view options',{layout:true}); // use /views/layout.html to manage your main header/footer wrapping template
    app.register('html',require('ejs')); //use .html files in /views -- instead of having to call them .ejs

    /******************************************************************
        The /static folder will hold all css, js and image assets.
        These files are static meaning they will not be used by
        NodeJS directly. 
        
        In your html template you will reference these assets
        as yourdomain.heroku.com/img/cats.gif or yourdomain.heroku.com/js/script.js
    ******************************************************************/
    app.use(express.static(__dirname + '/static'));
    
    //parse any http form post
    app.use(express.bodyParser());
    
    /**** Turn on some debugging tools ****/
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

});
/*********** END SERVER CONFIGURATION *****************/

app.get('/', function(request, response) {
        
    // build the query
    var query = Event.find({});
    query.sort('date',-1); //sort by date in descending order
    
    // run the query and display blog_main.html template if successful
    query.exec({}, function(err, allPosts){
        
        // prepare template data
        var templateData = {
            pageTitle : 'BeThereNYC- Coming Soon',
            posts : allPosts
        };
        
        // render the page template with the data above
        response.render('home.html', templateData);
        
    });
    
});

//request submit page
app.get('/submit.html', function(request, response) {
    console.log("Requesting Submit Page")
    
    response.render("submit.html");
});

app.post('/submit.html', function(request, response){
    
    console.log('Received new event submission')
    console.log(request.body);
    
    // Prepare the event entry form into a data object
    var eventData = {
        name : request.body.eventName,
        urlslug : request.body.urlslug,
        date : request.body.eventDate,
        time: request.body.eventTime,
        place: request.body.eventPlace,
        desc : request.body.eventDesc
    };

    // create a new blog post
    var thisEvent = new Event(eventData);
    
    // save the blog post
    thisEvent.save();
    
    // redirect to show the single post
    response.redirect('/events/' + eventData.urlslug); // for example /entry/this-is-a-post
    
    
});


app.get('/events/:urlslug', function(request, response){
    
     // Get the request blog post by urlslug
     
      // build the query
    var query = Event.find({});
    query.sort('date',-1); //sort by date in descending order
    
    // run the query and display blog_main.html template if successful
    query.exec({}, function(err, allPosts){
        
        
         Event.findOne({urlslug:request.params.urlslug} ,function(err,event){
        if (err) {
            console.log('error');
            console.log(err);
            response.render('card_not_found.html');
            //response.send("uh oh, can't find that post");
        }
        
        // prepare template data
        var templateData = {
            event : event,
            posts : allPosts
        };
        
        // render the card_form template with the data above
        response.render('single-event.html', templateData);
        
        });
    });
    
    
});


app.get('/maptest.html', function(request, response){
    response.render("maptest.html");
});

app.get("/update/:eventId", function(request, response){
    
    // get the request blog post id
    var requestedEventID = request.params.eventId;
    
    // find the requested document
    Event.findById( requestedEventID, function(err, thisevent) {
        
        if (err) {
            console.log(err);
            response.send("an error occurred!");
        }
        
        if (thisevent == null ) {
            console.log('post not found');
            response.send("uh oh, can't find that post");

        } else {
            
            // prepare template data
            // blogpost data & updated (was this entry updated ?update=true)
            templateData = {
                event : thisevent,
                updated : request.query.update
            };
            
            // found the blogpost
            response.render('update-event.html', templateData);
        }
        
    })
    
});

app.post("/update", function(request, response){
    
    // update post body should have form element called blog_post_id
    var postid = request.body.event_id;
    console.log("postid: " +postid);

    // we are looking for the BlogPost document where _id == postid
    var condition = { _id : postid };
    
    // update these fields with new values
    var updatedData = {
        name : request.body.eventName,
        date : request.body.eventDate,
        time: request.body.eventTime,
        place: request.body.eventPlace,
        desc : request.body.eventDesc
    };
    
    // we only want to update a single document
    var options = { multi : false };
    
    // Perform the document update
    // find the document with 'condition'
    // include data to update with 'updatedData'
    // extra options - this time we only want a single doc to update
    // after updating run the callback function - return err and numAffected
    
    Event.update( condition, updatedData, options, function(err, numAffected){
        
        if (err) {
            console.log('Update Error Occurred');
            response.send('Update Error Occurred ' + err);

        } else {
            
            console.log("update succeeded");
            console.log(numAffected + " document(s) updated");
            
            //redirect the user to the update page - append ?update=true to URL
            response.redirect('/update/' + postid + "?update=true");
            
        }
    });
    
});


// return all event entries in json format
app.get('/api/allevents', function(request, response){
    
    // define the fields you want to include in your json data
    includeFields = ['name','desc','urlslug','date','time','place'];
    
    // query for all events
    queryConditions = {}; //empty conditions - return everything
    var query = Event.find( queryConditions, includeFields);

    query.sort('date',-1); //sort by most recent
    query.exec(function (err, eventPosts) {

        // render the card_form template with the data above
        jsonData = {
          'status' : 'OK',
          'events' : eventPosts
        }

        response.json(jsonData);
    });
});


// This is a demonstration of using "remote" JSON data.
// Requesting data from classmate Jackie, getting museum data

app.get('/museums',function(request, response) {

    // define the remote JSON feed
    museumsURL= "http://nycmuseums.herokuapp.com/data/allmuseums";
    museumsSiteName = museumsURL.substring(museumsURL.lastIndexOf('//')+2, museumsURL.length);
    museumsSiteName = museumsSiteName.substring(museumsSiteName.charAt(0),museumsSiteName.indexOf('/'));

    //str.substring(3,7)

    // make the request
    requestURL(museumsURL, function(error, httpResponse, data) {
        //if there is an error
        if (error) {
            console.error(error);
            response.send("uhoh there was an error");
        }

        // if successful HTTP 200 response
        if (httpResponse.statusCode == 200) {

            //convert JSON into native javascript
            museumData = JSON.parse(data);

            if (museumData.status == "OK") {
                museums = museumData.museum;

                //render template with remote data
                templateData = {
                    museums : museums,
                    sitename : museumsSiteName,
                    source_url : museumsURL   
                }
                response.render("museums.html",templateData)
            } else {

                response.send("blog post JSON status != OK");
            }
        }
    }); // end of requestURL callback
}); //end of /jsontest route

app.get('/nycdata',function(request, response){

    // define the remote feed
    nycGovURL= "http://www.nycgovparks.org/xml/events_300_rss.xml";
    //museumsSiteName = nycGovURL.substring(nycGovURL.lastIndexOf('//')+2, nycGovURL.length);
    //museumsSiteName = museumsSiteName.substring(museumsSiteName.charAt(0),museumsSiteName.indexOf('/'));

    // make the request
    requestURL(nycGovURL, function(error, httpResponse, data) {
        //if there is an error
        if (error) {
            console.error(error);
            response.send("uhoh there was an error");
        }

        // if successful HTTP 200 response
        if (httpResponse.statusCode == 200) {
            
            //cleaning the data before parsing
            data = data.replace(/event:parkids/g, "eventParkids");
            data = data.replace(/event:parknames/g, "eventParkNames");
            data = data.replace(/event:startdate/g, "eventStartDate");
            data = data.replace(/event:enddate/g, "eventEndDate");
            data = data.replace(/event:endtime/g, "eventEndTime");
            data = data.replace(/event:starttime/g, "eventStartTime");
            data = data.replace(/event:contact_phone/g, "eventContactPhone");
            data = data.replace(/event:location/g, "eventLocation");
            data = data.replace(/event:categories/g, "eventCategories");

            //parse the data, convert to js object
            parser.parseString(data, function (err, result) {
                //convert to JSON
                JSON.stringify(result);
                
                var nycGovData = result.channel.item; //array of events from nycgovparks.org in JSON
                console.log(nycGovData.length + " total events found");
                
                //get data from today
                var now = new Date();
                var today = now.toJSON().toString().substring(0,now.toJSON().toString().indexOf('T'));
                console.log("Today is " +today);
                
                console.log(nycGovData[0]);
                console.log(nycGovData[0].eventStartDate);
                
                var nycGovDataToday = []; //variable to hold today's events
                
 /*               for (today in nycGovData.eventStartDate){
                    console.log("TODAY: " +nycGovData.title);
                }
 */
                var reslog ="";
                //find events that are happening today
                for (i = 0; i < nycGovData.length; i++){
                    
                    if (nycGovData[i].eventStartDate == today){
                        console.log("TODAY: " +nycGovData[i].title);
                        reslog += nycGovData[i].title+"<br/>";
                        nycGovDataToday.push(nycGovData[i]);
                    }
                }
                console.log("Found " +nycGovDataToday.length + " events happening today.");
                
                console.log('Done with data');
                response.send("Found " +nycGovDataToday.length + " events happening today.<br/><br/>"+reslog);
                
            });
                    
                
                
                //response.render("museums.html",templateData)
            //} else {

              //  response.send("blog post JSON status != OK");
            }
        //}
    }); // end of requestURL callback
}); //end of /nycdata route 



// Make server turn on and listen at defined PORT (or port 3000 if is not defined)
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});