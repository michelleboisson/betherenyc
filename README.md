This is all the code behind [betherenyc.com] (http://betherenyc.herokuapp.com)
This web app shows you events that are happening here and now, in NYC. Currently I am pulling data from nycgovparks.org feed. Users can add events.

The app is written in NodeJS, uses MongoDb, is built for Heroku, and uses following dependencies:
- [express](http://expressjs.com/): 2.5.6 - for server setup
- [ejs](http://embeddedjs.com/) : latest - for templating 
- [mongoose](mongoosejs.com) : 2.5.6 - for database modeling and queries
- [request](https://github.com/mikeal/request) : 2.9.153 - for HTTP request method
- [xml2js](https://github.com/Leonidas-from-XIV/node-xml2js) - for converting xml to js objects
- [connect-mongodb](https://github.com/masylum/connect-mongodb) - for connecting to mongodb
- bcrypt : 0.4.1 - for password hashing
- [passport](http://passportjs.org/): 0.1.7 - for user auth
- passport-local: 0.1.2
- knox : 0.0.9 - Node Amazon S3 Client
- [jsdom](https://github.com/tmpvar/jsdom): 0.2.14 - A javascript implementation of the W3C DOM.
- [moment](http://momentjs.com/): 1.5.0 - a javascript data library

On the front-end:
-HTML 5, CSS3, jQuery, Google Maps API, Google geocoder, momentjs, FourSquare API


# Getting Setup
##Set up file structure and Heroku App

In your terminal, clone this repo

	git clone git@github.com:michelleboisson/betherenyc.git


If you haven't already, create a new app on Heroku (cedar), this will add an additional remote GIT path to Heroku. (Assumes you have [Heroku Toolbelt](https://toolbelt.heroku.com/) installed)

	heroku create --stack cedar

## Set up MongoDB and .env

Add free [MongoLab account add-on](https://addons.heroku.com/mongolab) for your MongoDB 

	heroku addons:add mongolab:starter

Heroku and MongoLab have provided a mongodb:// connection string in your Heroku config. This is your "username and password" to get access. We can keep the connection string out of the code and private by putting it inside a .env environment variable file. 

Get your connection URI

	heroku config | grep MONGOLAB_URI

Copy the Mongo URI connection string starting from **mongodb://** to the end, will look like

    mongodb://heroku_randomapp:hashedpassword@subdomain.mongolab.com:port/heroku_randomapp
    
Add local config variable for MongoLab

    echo MONGOLAB_URI=mongodb://heroku_randomapp:hashedpassword@subdomain.mongolab.com:port/heroku_randomapp >> .env
 
    
# Get the party started

## Install Node Modules

    npm install
    
## Run locally

    foreman start web
    
Visit on your browser at [http://localhost:5000](http://localhost:5000)

# Run on Heroku

Commit all changes

    git commit -am "my commit message"
    
Push to Heroku

    git push heroku master
       
## Run a one-off script

### Sample One Off Script runFunc.js

This file helped me do some editing on database entries as a one-off script locally or on heroku.

Heroku docs on One-Off Processes [https://devcenter.heroku.com/articles/oneoff-admin-ps](https://devcenter.heroku.com/articles/oneoff-admin-ps)

To Use:

1) update Procfile - add following line to existing file

    mytask: node runFunc.js

2) To run locally

    foreman start mytask

3) Execute from Heroku (must be commited and pushed to Heroku first)

    heroku run mytask

### Heroku Scheduler
I'm using a Heroku scheduler to automatically get new events from nycgovparks.org every day. Install the scheduler from Heroku by typing this in your terminal.

    heroku addons:add scheduler:standard

Then in the Procfile you will see:
    
    getNewData : node getNewData.js
    
Here's more infor on the scheduler: [https://devcenter.heroku.com/articles/scheduler](https://devcenter.heroku.com/articles/scheduler)
