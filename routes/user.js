var db = require('../accessDB');
var fs = require('fs');
var knox = require('knox');

var myBucket = 'testing-johnsapp';
var S3Client = knox.createClient({
      key: process.env.AWS_KEY
    , secret: process.env.AWS_SECRET
    , bucket: myBucket
});

module.exports = {


    // app.get('/register'...)
    getRegister: function(request, response) {
        
        response.render('user/register.html');
    },

    // app.post('/register'...)
    postRegister: function(request, response) {
        db.saveUser({
              fname : request.param('firstname')
            , lname : request.param('lastname')
            , email : request.param('email')
            , password : request.param('password')
        }, function(err,docs) {
            response.redirect('/account');
        });
    },

    postChangePassword : function(request, response) {
        if (request.param('password') == request.param('password2')) {
            
            //look up user
            db.User.findById(request.user._id, function(err, user){
                
                //set the new password
                user.set('password', request.param('password'));
                user.save();
                
                // set Flash message and redirect back to /account
                request.flash("message", "Password was updated");
                
                response.redirect('/account');
                
            })
            
        } else {
            
            request.flash("message", "Passwords Do Not Match");
            response.redirect('/account');
        }
    },
    
    // app.get('/login', ...
    login: function(request, response) {
        
        templateData = {
             message: request.flash('error')[0], // get error message is received from prior login attempt
             redirect : request.flash("redirect")
        }
        
        response.render('user/login.html', templateData);
    },

    // app.get('/account', ensureAuthenticated, ...
    getAccount: function(request, response) {
        templateData = {
            currentUser : request.user,
            message : request.flash('message')[0] // get message is received from prior form submission like password change

        }
    
        response.render('user/account.html', templateData );
    },

    getUsers : function(request, response) {
        db.User.find({},['email','name.first','name.last'], function(err,users) {
            
            if (err) {
                console.log(err);
                response.send("an error occurred");
            }
            
            response.json(users);
            
        })
        
    },
    
    // app.get('/logout'...)
    logout: function(request, response){
        request.logout();
        response.redirect('/');
    }

};
