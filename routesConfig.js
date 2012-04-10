/** routes.js
  */
var passport = require('passport');

// Route methods

var eventRoute = require('./routes/events');
var userRoute = require('./routes/user');
var apiRoute = require('./routes/api');

// If user is authenticated, redirect to 
function ensureAuthenticated(request, response, next) {
  if (request.isAuthenticated()) { return next(); }

  request.flash("redirect",request.originalUrl);
  response.redirect('/login');
}

module.exports = function(app) {
    
    /*********** EVENT ROUTES ************/
    // main page - display all events
    app.get('/', eventRoute.mainpage );
    
    //request submit page
    app.get('/submit.html', eventRoute.getSubmitEvent);
    
    //post submitted event
    app.post('/submit.html', eventRoute.postSubmittedEvent);
    
    //get event by urlslug
    app.get('/events/:urlslug', eventRoute.getEventbyUrlslug);
    
    //testing google map api
    app.get('/maptest.html', eventRoute.testMap);
    
    //update an event
    app.get("/update/:eventId", eventRoute.getUpdateEvent);
    
    //post the updated event
    app.post("/update", eventRoute.postUpdatedEvent);
    
    // This is a demonstration of using "remote" JSON data.
    // Requesting data from classmate Jackie, getting museum data
    app.get('/museums', eventRoute.getMuseumData);
    
    //pulls data from NYC Dept Parks and Rec, adds today's events to database
    app.get('/nycdata', eventRoute.getNYCData);
    
    
    /*********** EVENT APIs ************/
    // return all event entries in json format
    app.get('/api/allevents', apiRoute.getAllEventsJSON);
        
    // return one event entries in json format
    app.get('/api/event/:eventID', apiRoute.getEventbyIdJSON);

}