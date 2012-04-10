// base dependencies for app
var express = require('express')
,   passport = require('passport')
,   mongoose = require('mongoose')
,   ejs = require('ejs')
,   routes = require('./routesConfig')
,   DB = require('./accessDB').AccessDB
,   mongoStore = require('connect-mongodb'); // include Mongoose MongoDB library

var app = module.exports = express.createServer(express.logger());
global.app = app;


var DB = require('./accessDB');
var db = new DB.startup(process.env.MONGOLAB_URI);


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

    app.use(express.cookieParser());//Cookies must be turned on for Sessions
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    /*** Turn on Express Sessions - Use MongoStore ***/
    app.use(express.session({ 
            store: mongoStore({url:process.env.MONGOLAB_URI})
            , secret: 'SuperSecretString'
        }, function() {
            app.use(app.router);
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    /*** end of passport setup ***/

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

// Routes - all URLs are defined inside routesConfig.js
// we pass in 'app'
require('./routesConfig')(app);


// Make server turn on and listen at defined PORT (or port 3000 if is not defined)
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});