var express = require('express');
var {check,validationResult} = require("express-validator/check");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var router = express.Router();
var auth = require("../middleware/auth");
var User = require('../models/user');
 
router.get('/', function (req, res, next) {
   return res.render('test.ejs');
});
router.get('/test_logout', function (req, res, next) {
    User.findOne({unique_id:req.session.userId},function(err,data){
        console.log("data");
        console.log(data);
        if(!data){
            res.redirect('/login');
        }else{
            //console.log("found");
            return res.render('test_logout.ejs', {"name":data.username});
        }
    });
 });
 
router.get('/register', function (req, res, next) {
 return res.render('register.ejs');
});

 
router.post('/register',
[
    check("username","Please enter a valid username").not().isEmpty(),
    check("email","Please enter a valid email").isEmail(),
    check("password","Please enter a valid password").isLength({
        min:6,max:14
    }).isAlphanumeric()
],
 function(req, res, next) {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            errors: errors.array()
        });
    }
   console.log(req.body);
   var personInfo = req.body;
 
 
   if(!personInfo.email || !personInfo.username || !personInfo.password || !personInfo.passwordConf){
       
    res.send();
   } else {
       if (personInfo.password == personInfo.passwordConf) {
 
           User.findOne({email:personInfo.email},function(err,data){
               if(!data){
                   var c;
                   User.findOne({},function(err,data){
 
                       if (data) {
                           console.log("if");
                           c = data.unique_id + 1;
                       }else{
                           c=1;
                       }
                       console.log(c);
                       var newPerson = new User({
                           unique_id:c,
                           email:personInfo.email,
                           username: personInfo.username,
                           password: personInfo.password,
                           passwordConf: personInfo.passwordConf,
                           fname: personInfo.fname,
                           lname: personInfo.lname,
                           phoneNumber: personInfo.phoneNumber
                       });
 
                       newPerson.save(function(err, Person){
                           if(err)
                               console.log(err);
                           else
                               console.log('Success');
                       });
 
                   }).sort({_id: -1}).limit(1);
                   res.redirect('/login');
                //    res.send({"Success":"You are regestered,You can login now."});
               }else{
                   res.send({"Success":"Email is already used."});
               }
 
           });
       }else{
           res.send({"Success":"password is not matched"});
       }
   }
});
 
router.get('/login', function (req, res, next) {
   return res.render('login.ejs');
});
 
router.post('/login', function (req, res, next) {
   //console.log(req.body);
   User.findOne({email:req.body.email},function(err,data){
       if(data){
          
           if(data.password==req.body.password){
               //console.log("Done Login");
               req.session.userId = data.unique_id;
               //console.log(req.session.userId);
            //    res.send({"Success":"Success!"});
                res.redirect("/test_logout");
              
           }else{
            //    res.send({"Success":"Wrong password!"});
                alert("Wrong password!");
               res.redirect("/login");
           }
       }else{
        //    res.send({"Success":"This Email Is not regestered!"});
            alert("This Email Is not regestered!");
            res.redirect("/login");
       }
   });
});
 
router.get('/profile', function (req, res, next) {
   console.log("profile");
   User.findOne({unique_id:req.session.userId},function(err,data){
       console.log("data");
       console.log(data);
       if(!data){
           res.redirect('/');
       }else{
           //console.log("found");
           return res.render('data.ejs', {"name":data.username,"email":data.email,"fname":data.fname,"lname":data.lname,"Mobile":data.phoneNumber});
       }
   });
});
 
router.get('/logout', function (req, res, next) {
   console.log("logout")
   if (req.session) {
   // delete session object
   req.session.destroy(function (err) {
       if (err) {
           return next(err);
       } else {
           return res.redirect('/login');
       }
   });
}
});
 
router.get('/forgetpass', function (req, res, next) {
   res.render("forget.ejs");
});
 
router.post('/forgetpass', function (req, res, next) {
   //console.log('req.body');
   //console.log(req.body);
   User.findOne({email:req.body.email},function(err,data){
       console.log(data);
       if(!data){
           res.send({"Success":"This Email Is not regestered!"});
       }else{
           // res.send({"Success":"Success!"});
           if (req.body.password==req.body.passwordConf) {
           data.password=req.body.password;
           data.passwordConf=req.body.passwordConf;
 
           data.save(function(err, Person){
               if(err)
                   console.log(err);
               else
                   console.log('Success');
                //    res.send({"Success":"Password changed!"});
                    res.redirect("/login");
           });
       }else{
        //    res.send({"Success":"Password does not matched! Both Password should be same."});
            res.redirect("/forgetpass")
       }
       }
   });
  
});
 
module.exports = router;

