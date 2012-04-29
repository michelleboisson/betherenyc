console.log("Running this daily function...........................................");

// base dependencies for script
var mongoose = require('mongoose')
    , db = require('./accessDB')
    , moment = require('moment') //time library
    , xml2js = require('xml2js') //xml to js 
    , parser = new xml2js.Parser() //xml to js
    , jsdom = require("jsdom") //dom parser
    , moment = require('moment') //time library


db.startup(process.env.MONGOLAB_URI); // start the db connection


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
                    //var today = "2012-04-22";
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
                            
                            //look for event information in the html
                            var $ = window.$;
                            $(".map_locations").each(function () {
                                var mydata = $(this).attr('id').split('__');
                                //console.log("place: "+ mydata[2]);
                                //console.log("lat: "+mydata[0]);
                                //console.log("lng: "+mydata[1]);
                            var thisTime = element.eventStartTime;
                            var thisDate = element.eventStartDate;
                            
                            var translatedTime = moment(thisTime, "h:m a");//.format("dddd, MMMM Do YYYY, h:mm:ss a");
                            var translatedDate = moment(thisDate);//.format("dddd, MMMM Do YYYY, h:mm:ss a");
                            translatedDate.hours(translatedTime.hours()).minutes(translatedTime.minutes()).seconds(translatedTime.seconds());
            
                            //not sure why I have to do this...
                            //translatedDate.add('days', 1);

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
                                    },
                                    datetime : {
                                        timestamp: new Date(translatedDate)
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
                    //response.redirect('/');
                }); //end parser
            }//end if httpResponse
        }); // end of requestURL callback
    }//end nyc data route  