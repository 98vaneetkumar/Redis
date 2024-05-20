var express = require('express');
var router = express.Router();
const authentication=require("../middlewares/userAuthentication").verifyToken
const clubController=require("../controllers/userController/clubController")
const userController=require("../controllers/userController/userController")


module.exports =function() {
    router.post("/login",userController.loginUser);
    router.post("/socialLogin",userController.socialLogin);
    router.post("/notificationOnOff",userController.notificationOnOff);
    router.post("/optverify",userController.optverify);
    router.post("/resendOtp",userController.resendOtp);

    router.post("/accountdelete",authentication,userController.accountdelete);
    router.post("/saveLocation",authentication,userController.saveLocation);
    router.post("/logOut",authentication,userController.logOut);


    router.get("/questionAnswer",authentication,clubController.questionAnswer);
    router.post("/userQuestionAnswer",authentication,clubController.userQuestionAnswer);
    router.post("/completeProfile",authentication,clubController.completeProfile);
    router.put("/updateDetails",authentication,clubController.updateDetails);
    router.post("/cmcClub",authentication,clubController.cmcClub);

    router.post("/createEvent",authentication,clubController.createEvent);
    router.post("/userListBookingEvent",authentication,clubController.userListBookingEvent);
    router.delete("/deleteEvent",authentication,clubController.deleteEvent);
    router.get("/myCreatedEvent",authentication,clubController.myCreatedEvent);
    router.post("/clubAllEvent",authentication,clubController.clubAllEvent);
    router.get("/eventDetail",authentication,clubController.eventDetail)

    return router
};