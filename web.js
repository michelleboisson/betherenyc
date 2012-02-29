var express = require('express');
var ejs = require('ejs');
var app = express.createServer(express.logger());

var mongoose = require('mongoose'); // include Mongoose MongoDB library
var schema = mongoose.Schema; 

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
        
        // render the card_form template with the data above
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
    
    // Prepare the blog post entry form into a data object
    var eventData = {
        name : request.body.eventName,
        urlslug : request.body.urlslug,
        date : request.body.eventDate,
        time: request.body.eventTime,
        place: request.body.eventPlace,
        desc : request.body.eventDesc,
        author : {
            name : request.body.name,
            email : request.body.email
        }
    };
/*     newEvent = {
        name : request.body.eventName,
        date: request.body.eventDate,
        time: request.body.eventTime,
        place: request.body.eventPlace
    };
*/  
    // create a new blog post
    var thisEvent = new Event(eventData);
    
    // save the blog post
    thisEvent.save();
    
    // redirect to show the single post
    response.redirect('/events/' + eventData.urlslug); // for example /entry/this-is-a-post
    
    
});


app.get('/events/:urlslug', function(request, response){
    
     // Get the request blog post by urlslug
    
    Event.findOne({urlslug:request.params.urlslug} ,function(err,event){
        if (err) {
            console.log('error');
            console.log(err);
            response.render('card_not_found.html');
            //response.send("uh oh, can't find that post");
        }
        
        // use different layout for single entry view
        //event.layout = 'layout.html';
        
        // found the blogpost
        response.render('single-event.html', event);
    });
    
    
});


app.get('/maptest.html', function(request, response){
    response.render("maptest.html");
});



// Make server turn on and listen at defined PORT (or port 3000 if is not defined)
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});