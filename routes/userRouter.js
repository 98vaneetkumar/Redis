var express = require('express');
var router = express.Router();
const authentication=require("../middlewares/userAuthentication").verifyToken
const userController=require("../controllers/userController/userController")

module.exports=function(){
    router.post("/login",userController.loginUser);
    router.post("/socialLogin",userController.socialLogin);
    router.post("/notificationOnOff",authentication,userController.notificationOnOff);
    router.post("/optverify",userController.optverify);
    router.post("/resendOtp",userController.resendOtp);
    router.post("/accountdelete",authentication,userController.accountdelete);
    router.post("/completeProfileUser",authentication,userController.completeProfileUser);
    router.post("/saveLocation",authentication,userController.saveLocation);
    router.put("/updateUserDetails",authentication,userController.updateUserDetails);
    router.post("/otherUserProfile",authentication,userController.otherUserProfile);
    router.get("/cmcUser",userController.cmcUser);
    router.post("/logOut",authentication,userController.logOut);
    router.post("/viewClubDetail",authentication,userController.viewClubDetail);
    router.post("/createPost",authentication,userController.createPost);
    router.post("/bookEvent",authentication,userController.bookEvent);
    router.get("/myAllBooking",authentication,userController.myAllBooking);
    router.post("/createRating",authentication,userController.createRating);
    router.post("/likePost",authentication,userController.likePost);
    router.post("/commentOnPost",authentication,userController.commentOnPost);
    router.get("/allPostNotCreatedByMe",authentication,userController.allPostNotCreatedByMe);
    router.get("/allPostCreatedByMe",authentication,userController.allPostCreatedByMe);
    //page 11 user side
    router.post("/likePostUserList",authentication,userController.likePostUserList);
    //page 12 user side
    router.post("/commentPostUseList",authentication,userController.commentPostUseList);
    router.post("/friendRequestSend",authentication,userController.friendRequestSend);
//this will comes in notification form where i accept the request
    router.post("/acceptRejectRequest",authentication,userController.acceptRejectRequest);
    router.get("/notificationList",authentication,userController.notificationList);
    router.post("/favouriteEvent",authentication,userController.favouriteEvent);
    router.get("/favouriteEventList",authentication,userController.favouriteEventList);
    router.post("/contactUs",authentication,userController.contactUs);
    router.get("/listOfAllClub",authentication,userController.listOfAllClub);
    router.get("/faq",authentication,userController.FAQ);
    //Test cases
    router.get("/userPage",userController.userPage);
    router.get("/addFAQ",userController.addFAQ)
    router.get("/messageQueueTest",userController.messageQueueTest)
    return router
}

