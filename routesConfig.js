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
    app.get('/submit.html', ensureAuthenticated, eventRoute.getSubmitEvent);
    
    //post submitted event
    app.post('/submit.html', ensureAuthenticated, eventRoute.postSubmittedEvent);
    
    //get event by urlslug
    app.get('/events/:urlslug', eventRoute.getEventbyUrlslug);
    
    //get event by urlslug
    app.get('/events/permalink/:eventId', eventRoute.getEventbyId);
    
    //update an event
    app.get("/update/:eventId", ensureAuthenticated, eventRoute.getUpdateEvent);
    
    //post the updated event
    app.post("/update", ensureAuthenticated, eventRoute.postUpdatedEvent);
    
    //delete an event
    app.get("/delete/:eventId", ensureAuthenticated, eventRoute.deleteEvent);
    
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
    
    // return entries from a certain data in json
    app.get('/api/:date', apiRoute.getEventsbyDate );
    
     /*********** USER ROUTES ************/    
    
    // Register User - display page
    app.get('/register', userRoute.getRegister);
    
    //Register User - receive registration post form
    app.post('/register', userRoute.postRegister);
    
    // Display login page
    app.get('/login', userRoute.login);
    
    // Login attempted POST on '/local'
    // Passport.authenticate with local email and password, if fails redirect back to GET /login
    // If successful, redirect to /account
    app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function(request, response) {
        if (request.param('redirect') != "") {
            //redirect to page that initiated Login request
            response.redirect( request.param('redirect') );
        } else {
            response.redirect('/account');
        }
    });
    
    // Display account page
    app.get('/account', ensureAuthenticated, userRoute.getAccount);

    app.post('/account/changepassword', ensureAuthenticated, userRoute.postChangePassword),
    
    // Logout user
    app.get('/logout', userRoute.logout);

    app.get('/getusers', userRoute.getUsers);

}