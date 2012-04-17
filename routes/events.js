/**
  * Module dependencies.
  */
var db = require('../accessDB');

var requestURL = require('request'); //gets data from outside
var fs = require('fs');
var xml2js = require('xml2js'); //xml to js 
var parser = new xml2js.Parser(); //xml to js
var jsdom = require("jsdom"); //dom parser 


module.exports = {
    
    mainpage : function(request, response) {
        
        today = new Date();
        yesterday = new Date();
        yesterday.setDate(yesterday.getDate()-1);
        tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate()+1);
        
        // build the query
        var query = db.Event.find({}, ['id', 'name', 'place', 'date', 'time', 'location']);
        query.sort('date',-1); //sort by date in descending order
        query.where('date').gte(yesterday).lte(tomorrow);
    
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
    },
    
    getSubmitEvent : function(request, response) {
        console.log("Requesting Submit Page");
        templateData = {
            currentUser : request.user
        }
        response.render("submit.html", templateData);
    },
    
    postSubmittedEvent : function(request, response){
    
        console.log('Received new event submission')
        console.log(request.body);
    
        // Prepare the event entry form into a data object
        var eventData = {
            name : request.body.eventName,
            urlslug : request.body.urlslug,
            date : request.body.eventDate,
            time: request.body.eventTime,
            place: request.body.eventPlace,
            desc : request.body.eventDesc,
            author : request.user._id
        };

        // create a new blog post
        var thisEvent = new db.Event(eventData);
    
        // save the blog post
        thisEvent.save();
    
        // redirect to show the single post
        response.redirect('/events/' + eventData.urlslug); // for example /entry/this-is-a-post
    
    },
    
    getEventbyUrlslug : function(request, response){
        var hasOwner;
         // Get the request blog post by urlslug
     
        // build the query for the sidebar
        var query = db.Event.find({});
        query.populate('author');
        query.sort('date',-1); //sort by date in descending order
        query.limit(5);
        
        // run the query and display blog_main.html template if successful
        query.exec({}, function(err, allPosts){
                
            db.Event.findOne({urlslug:request.params.urlslug}).populate('author').run(function(err,event){
                if (err) {
                    console.log('error');
                    console.log(err);
                    response.render('card_not_found.html');
                    //response.send("uh oh, can't find that post");
                }
                if (event == null ) {
                    console.log('post not found');
                    response.send("uh oh, can't find that post");
                }else{
                    if (event.author == "undefined" || event.author == "" || event.author == null) {
                        hasOwner = false;
                    }else{
                        hasOwner = true;
                    }
                    
                    if (hasOwner && typeof request.user != "undefined" && (request.user._id.toString() == event.author._id.toString()) ) {
                        isOwner = true;
                    } else {
                        isOwner = false;
                    }
                    
                     //if this is an admin
                    if (typeof request.user != "undefined" && request.user.accessLevel == "0")
                    {
                        isOwner = true;
                    }
                    
                    
                // prepare template data
                   var templateData = {
                        user_is_owner : isOwner,
                        event_has_owner : hasOwner,
                        event : event,
                        posts : allPosts
                   };
                }
                // render the card_form template with the data above
                response.render('single-event.html', templateData);
            });
        });
    },
    
    
    getEventbyId : function(request, response){
        var hasOwner;
         // Get the request blog post by urlslug
     
        // build the query for the sidebar
        var query = db.Event.find({});
        query.populate('author');
        query.sort('date',-1); //sort by date in descending order
        query.limit(5);
        
        // run the query and display blog_main.html template if successful
        query.exec({}, function(err, allPosts){
                
            db.Event.findById(request.params.eventId).populate('author').run(function(err,event){
                if (err) {
                    console.log('error');
                    console.log(err);
                    response.render('card_not_found.html');
                    //response.send("uh oh, can't find that post");
                }
                if (event == null ) {
                    console.log('post not found');
                    response.send("uh oh, can't find that post");
                }else{
                    if (event.author == "undefined" || event.author == "" || event.author == null) {
                        hasOwner = false;
                    }else{
                        hasOwner = true;
                    }
                    
                    if (hasOwner && typeof request.user != "undefined" && (request.user._id.toString() == event.author._id.toString()) ) {
                        isOwner = true;
                    } else {
                        isOwner = false;
                    }
                    
                    //if this is an admin
                    if (typeof request.user != "undefined" && request.user.accessLevel == "0")
                    {
                        isOwner = true;
                    }
                    
                    
                // prepare template data
                   var templateData = {
                        user_is_owner : isOwner,
                        event_has_owner : hasOwner,
                        event : event,
                        posts : allPosts
                   };
                }
                // render the card_form template with the data above
                response.render('single-event.html', templateData);
            });
        });
    },
    

    testMap : function(request, response){
        response.render("maptest.html");
    },
    
    getUpdateEvent : function(request, response){
    
        // get the request blog post id
        var requestedEventID = request.params.eventId;
        
        // find the requested document
        db.Event.findById( requestedEventID, function(err, thisevent) {
        
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
        
        });
    },
    
    postUpdatedEvent : function(request, response){
    
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
        
        db.Event.update( condition, updatedData, options, function(err, numAffected){
            
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
    },
    
    getMuseumData : function(request, response) {

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
    },
    
    
    getNYCData : function(request, response){

        // define the remote feed
        nycGovURL= "http://www.nycgovparks.org/xml/events_300_rss.xml";

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
                        
                    var nycGovDataToday = []; //variable to hold today's events
                
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
                
                    nycGovDataToday.forEach(function(element, index, array){
                    
                        //visit the link to get the freaking latitude and longitude
                        //parse the html via jsdom!
                        var eventLink = element.link;
                        jsdom.env(eventLink, ['http://code.jquery.com/jquery-1.7.min.js'], function(errors, window) {
                            
                            var $ = window.$;
                            $(".map_locations").each(function () {
                                var mydata = $(this).attr('id').split('__');
                                //console.log("place: "+ mydata[2]);
                                //console.log("lat: "+mydata[0]);
                                //console.log("lng: "+mydata[1]);
                                
                                var eventData = {
                                    name : element.title,
                                    urlslug : convertToSlug(element.title),
                                    date : element.eventStartDate,
                                    time: element.eventStartTime,
                                    place: element.eventLocation,
                                    desc : element.description,
                                    link : element.link,
                                    location: {
                                         latitude : mydata[0]
                                        ,longitude : mydata[1]
                                        ,placename : mydata[2]
                                    }
                                };//end event data  
                        
                                    console.log("eventData: "+eventData);
                                    // create a new event 
                                    var thisEvent = new db.Event(eventData);
    
                                    // save the event to the database
                                    thisEvent.save();
                                    
                                    
                           //console.log("there have been", window.$("a").length, "nodejs releases!");
                                });
                        });//end jsdom
                        
                        
                    }); //end for each event found...
                    response.redirect('/');
                }); //end parser
            }//end if httpResponse
        }); // end of requestURL callback
    }//end nyc data route  
}


function convertToSlug(Text)
{
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}