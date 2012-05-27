console.log("Running this daily function...........................................");

// base dependencies for script
var mongoose = require('mongoose')
    , db = require('./accessDB')
    , moment = require('moment') //time library
    , xml2js = require('xml2js') //xml to js 
    , parser = new xml2js.Parser() //xml to js
    , jsdom = require("jsdom") //dom parser
    , requestURL = require('request'); //gets data from outside


db.startup(process.env.MONGOLAB_URI); // start the db connection

        var saved = 0;
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
                    console.log(result.channel.item[0]);
                    
                    var nycGovData = result.channel.item; //array of events from nycgovparks.org in JSON
                    console.log(nycGovData.length + " total events found");
                    
                    //get data from tomorrow
                    var tomorrow = moment().add('days', 1);
                    console.log("Tomorrow is " +tomorrow);
                    var tomorrowStr = tomorrow.format("YYYY-MM-DD");
                    
                    var nycGovDataToday = []; //variable to hold tomorrow's events
                
                    var reslog ="";
                    //find events that are happening tomorrow
                    for (i = 0; i < nycGovData.length; i++){
                        
                        if (nycGovData[i].eventStartDate == tomorrowStr){
                            console.log("TOMORROW: " +nycGovData[i].title);
                            reslog += nycGovData[i].title+"<br/>";
                            nycGovDataToday.push(nycGovData[i]);
                        }
                    }
                    console.log("Found " +nycGovDataToday.length + " events happening tomorrow.");
                
                    console.log('Done with data');
                
                    nycGovDataToday.forEach(function(element, index, array){
                    
                        //visit the link to get the freaking latitude and longitude
                        //parse the html via jsdom!
                        var eventLink = element.link;
                        var mydata = [];
                        
                        jsdom.env(eventLink, ['http://code.jquery.com/jquery-1.7.min.js'], function(errors, window) {
                            console.log("visiting "+ eventLink);
                            //look for event information in the html
                            var $ = window.$;
                            $(".map_locations").each(function () {
                                mydata = $(this).attr('id').split('__');
                                //console.log("place: "+ mydata[2]);
                                //console.log("lat: "+mydata[0]);
                                //console.log("lng: "+mydata[1]);
           //                 }); // close each on window page
           //             });// close visit link
                                
                                var thisStartTime, thisDate, thisEndTime = "";
                                
                                thisStartTime = element.eventStartTime;
                                thisDate = element.eventStartDate;
                                thisEndTime = String(element.eventEndTime);
                                console.log("from JSON, end time: "+ String(element.eventEndTime));
                            
                            console.log("1");
                                //var translatedStartTime = moment(thisStartTime, "h:m a");
                                var translatedStartTime = moment(thisStartTime, "h:m a").add('hours',4);
                                console.log("start time "+ translatedStartTime.hours());
                                 console.log("2");
                                 console.log("thisStartTime: " + thisStartTime);
                                 console.log("thisEndTime: " + thisEndTime);
                            
                                //var translatedEndTime = moment(thisEndTime, "h:m a");
                                var translatedEndTime = moment(thisEndTime, "h:m a").add('hours',4);
                                console.log("end time "+ translatedEndTime.hours());
                                if (translatedEndTime.hours() == 0){
                                   translatedEndTime = moment(translatedStartTime).add('hours', 2); //add 2 hours by default
                                }
                               
                                console.log("3");
                                var translatedDate = moment(thisDate);//.format("dddd, MMMM Do YYYY, h:mm:ss a");
                                
                                var startTimeStamp = moment(translatedDate);
                                startTimeStamp.hours(translatedStartTime.hours()).minutes(translatedStartTime.minutes());
                                console.log("startTimeStamp: "+ moment(startTimeStamp).calendar());
                                
                                var endTimeStamp = moment(translatedDate);
                                endTimeStamp.hours(translatedEndTime.hours()).minutes(translatedEndTime.minutes());
                                console.log("endTimeStamp: "+ moment(endTimeStamp).calendar());
                            
                            //not sure why I have to do this...
                            //translatedDate.add('days', 1);

                                var eventData = {
                                    name : element.title,
                                    urlslug : convertToSlug(element.title),
                                    place: element.eventLocation,
                                    desc : element.description,
                                    link : element.link,
                                    location: {
                                         latitude : mydata[0]
                                        ,longitude : mydata[1]
                                        ,placename : mydata[2]
                                        ,address: mydata[4]
                                    },
                                    datetime : {
                                        timestamp: new Date(translatedDate),
                                        date: new Date(thisDate),
                                        starttimestamp: new Date(startTimeStamp),
                                        endtimestamp: new Date(endTimeStamp)
                                    },
                                    lastEdited: new Date(),
                                    author: {
                                        name: "NYC Parks and Recreation"
                                    }
                                };//end event data  
                                    console.log("eventData: "+eventData.name);
                                    console.log("start: "+moment(eventData.datetime.starttimestamp).calendar());
                                    console.log("end: "+moment(new Date(eventData.datetime.endtimestamp)).calendar());
                                    // create a new event 
                                    var thisEvent = new db.Event(eventData);
                                    

                                    // save the event to the database
                                      thisEvent.save(function (err, doc){
                                        saved++;
                                        console.error('--------------SAVED!'+ saved+ '-----------------------------');
                                    });
                                
                                });
                            console.log("Array: ", array.length);
                            //when we've saved all the elements
                             if (saved >= array.length){
                            console.log("*******CLOSING DB - SCRIPT SHOULD TERMINATE AS EXPECTED ******");
                            db.closeDB(); // <--- VERY IMPORTANT. MUST CLOSE DB WHEN FINISHED.
                        }
                       
                        });//end jsdom
                        
                    }); //end for each event found...
                    //response.redirect('/');
                }); //end parser
            }//end if httpResponse
            
        }); // end of requestURL callback

    
function convertToSlug(Text)
{
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}
function getCleanURLSource(url){
    return url.substring(url.charAt(0),url.indexOf('/'));
}



