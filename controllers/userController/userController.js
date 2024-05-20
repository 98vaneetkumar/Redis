const Joi = require("joi");
const Sequelize = require("sequelize");
let helper = require("../../helpers/helper");
const privateKey = "config.APP_URLS.PRIVATE_KEY_ADMIN";
const Models = require("../../models/index");
const {redisClient,getFromRedis,setInRedis,delInRedis,emailQueue} = require("../../redis/redis");
Models.bookEvent.belongsTo(Models.events, { foreignKey: "eventId" });
Models.events.hasMany(Models.eventImages, { foreignKey: "eventId" });
Models.post.hasMany(Models.postTagPeople, { foreignKey: "postId" });
Models.postTagPeople.belongsTo(Models.users, { foreignKey: "userId" });
Models.post.belongsTo(Models.users, { foreignKey: "user_id" });
Models.postComment.belongsTo(Models.users, { foreignKey: "userId" });
Models.postLike.belongsTo(Models.users, { foreignKey: "userId" });
Models.users.hasMany(Models.post, { foreignKey: "user_id" });
Models.users.hasMany(Models.favouriteEvent, { foreignKey: "userId" });
Models.favouriteEvent.belongsTo(Models.events, { foreignKey: "userId" });
Models.users.hasOne(Models.userSession, { foreignKey: "userId" });
//User model work on the base of role only //not type
module.exports = {
  loginUser: async (req, res) => {
    try {
      const validationSchema = Joi.object()
        .required()
        .keys({
          country_code: Joi.string().required(),
          phone: Joi.string().required(),
          device_token: Joi.string().optional(),
          device_type: Joi.number().optional().valid(1, 2),
          role: Joi.number().required().valid(1, 2),
        });
      helper.dataValidator(validationSchema, req?.body);
      const { country_code, phone, device_token, device_type, role } = req.body;
      let user = await Models.users.findOne({
        where: { country_code, phone },
        raw: true,
      });
      if (user && user.role == 1 && req.body && req.body.role == 2) {
        return helper.error(res, "This Number is register with us as a user !");
      } else if (user && user.role == 2 && req.body && req.body.role == 1) {
        return helper.error(res, "This Number is register with us as a club !");
      }
      if (user) {
        let objToSave = {
          is_otp_verified: 0,
          role: user.role,
          type: 1,
          notification_status: 1,
        };
        await Models.users.update(objToSave, { where: { id: user.id } });
      }
      if (!user) {
        //set type=0 beacuse no default value set for it.
        user = await Models.users.create({
          country_code,
          phone,
          role,
          type: 0,
        });
      }
      user = await Models.users.findOne({
        where: { country_code, phone },
        raw: true,
      });
      let objToSave = {
        device_token: device_token,
        device_type: device_type,
        userId: user.id,
      };
      await Models.userSession.create(objToSave);
      let phoneNumber = req.body.country_code + req.body.phone;
      // const resp = await otpManager.sendOTP(phoneNumber);
      return helper.success(res, "OTP sended succesfully", {});
    } catch (error) {
      helper.failed(res, error);
    }
  },
  socialLogin: async (req, res) => {
    try {
      const validationSchema = Joi.object()
        .required()
        .keys({
          socialId: Joi.string().required(),
          socialType: Joi.string().required(),
          name: Joi.string().optional(),
          email: Joi.string().optional(),
          device_token: Joi.string().optional(),
          device_type: Joi.number().optional().valid(1, 2),
          role: Joi.number().required().valid(1, 2),
        });
      helper.dataValidator(validationSchema, req?.body);

      let emailcheck = await Models.users.findOne({
        where: {
          email: req.body.email,
          socialId: req.body.socialId,
          role: req.body.role,
        },
      });

      if (
        emailcheck &&
        emailcheck.role == 1 &&
        req.body &&
        req.body.role == 2
      ) {
        return helper.error(
          res,
          "This account is register with us as a user !"
        );
      } else if (
        emailcheck &&
        emailcheck.role == 2 &&
        req.body &&
        req.body.role == 1
      ) {
        return helper.error(
          res,
          "This account is register with us as a club !"
        );
      }
      if (emailcheck) {
        let token = await helper.JWTManager.createToken({
          id: emailcheck?.id,
        });
        let response = await Models.users.findOne({
          where: { id: emailcheck.id },
        });
        response.token = token;
        return helper.success(res, "User Already exist", response);
      } else {
        let userName;
        if (!req.body.name) {
          let nameArr = req.body.email.split("@");
          userName = nameArr[0].replace(/^\d+|\d+$/g, "");
        }
        if (req.files && req.files?.image) {
          let image = req.files.image;
          var uploadImage = helper.imageUpload(image, "uploads");
        }
        let objToSave = {
          name: userName,
          socialId: req.body.socialId,
          socialType: req.body.socialType,
          email: req.body.email,
          device_token: req.body.device_token,
          device_type: req.body.device_type,
          image: req.files && req.files.image ? uploadImage : "",
          notification_status: 1,
          type: 0,
          role: req.body.role,
        };
        let userdata = await Models.users.create(objToSave);

        let userData = await Models.users.findOne({
          where: {
            id: userdata.id,
          },
          raw: true,
        });
        let parentKey = `userId:${id.toString()}`;
        let childKey = `userId:${id.toString()}`;
        let response;
        await delInRedis(parentKey, childKey);
        let data = await getFromRedis(parentKey, childKey);
        if (data) {
          response = JSON.parse(data);
        } else {
          await setInRedis(parentKey, childKey, JSON.stringify(userData));
        }
        let token = await helper.JWTManager.createToken({ id: userData?._id });
        userData.token = token;
        return helper.success(res, "User register success ", userData);
      }
    } catch (error) {
      throw error;
    }
  },
  notificationOnOff: async (req, res) => {
    try {
      const findStatus = await Models.users.findOne({
        where: { id: req.user.id },
        raw: true,
      });
      let message;

      if (findStatus) {
        const newStatus = findStatus.notification_status === 1 ? 0 : 1;
        message = newStatus === 0 ? "off" : "on";

        await Models.users.update(
          { notification_status: newStatus },
          { where: { id: req.user.id } }
        );

        const data = await Models.users.findOne({
          where: { id: req.user.id },
          raw: true,
        });

        let parentKey = `userId:${id.toString()}`;
        let childKey = `userId:${id.toString()}`;
        let response;
        
        let redisData = await getFromRedis(parentKey, childKey);
        if (redisData) {
          await delInRedis(parentKey,childKey);
          response = data;
        } else {
          await setInRedis(parentKey, childKey, JSON.stringify(userData));
        }
        return helper.success(
          res,
          `Notification ${message} successfully`,
          response
        );
      } else {
        return helper.error(res, "User not found", 404);
      }
    } catch (error) {
      throw error;
    }
  },
  optverify: async (req, res) => {
    try {
      const validationSchema = Joi.object().required().keys({
        country_code: Joi.string().required(),
        phone: Joi.string().required(),
        otp: Joi.string().required(),
      });
      helper.dataValidator(validationSchema, req?.body);
      const { country_code, phone, otp } = req.body;

      const data = await Models.users.findOne({
        where: { country_code: country_code, phone: phone },
        raw: true,
      });

      // if (!data) throw "Invalid OTP";
      if (!data) {
        return helper.error(res, "No user found");
      }
      if (otp != 1111) {
        return helper.error(res, "Invalid OTP");
      }
      let token = await helper.JWTManager.createToken({ id: data.id });
      data.token = token;
      return helper.success(res, "OTP verified successfully", data);
    } catch (error) {
      throw error;
    }
  },
  resendOtp: async (req, res) => {
    try {
      const validationSchema = Joi.object().required().keys({
        country_code: Joi.string().required(),
        phone: Joi.string().required(),
      });
      helper.dataValidator(validationSchema, req?.body);

      let mobileNumber = req.body.country_code + req.body.phone;
      // await otpManager.sendOTP(mobileNumber);
      return await helper.success(res, "Resend otp successfully");
    } catch (error) {
      console.log(error);
      return helper.failed(res, error);
    }
  },
  accountdelete: async (req, res) => {
    try {
      await Models.users.delete({ where: { id: req.user.id } });
      return helper.success(res, "Your account deleted successfully");
    } catch (error) {
      throw error;
    }
  },
  completeProfileUser: async (req, res) => {
    try {
      const validationSchema = Joi.object().required().keys({
        name: Joi.string().required(),
        gender: Joi.string().required(),
        age: Joi.string().required(),
        email: Joi.string().required(),
        bio: Joi.string().optional(),
      });
      helper.dataValidator(validationSchema, req?.body);
      let objToSave = {
        name: req.body.name,
        gender: req.body.gender,
        age: req.body.age,
        email: req.body.email,
        bio: req.body.bio,
        image: "",
      };
      if (req.files && req.files.image) {
        const imageName = helper.imageUpload(req.files.image, "uploads");
        objToSave.image = imageName;
      }
      await Models.users.update(objToSave, { where: { id: req.user.id } });
      let id = req.user.id;
      let parentKey = `${id.toString()}`;
      let childKey = `${id.toString()}`;
      let response =await getFromRedis(parentKey,childKey)
      var result;
      if(response&&response!=false){
        result=response
      }else{
        result = await Models.users.findOne({
          where: { id: req.user.id },
          include: [
            {
              model: Models.userSession,
              required: false,
            },
          ],
        });
        await setInRedis(parentKey,childKey,result)
      }
      return await helper.success(res, "Detail saved successfully", result);
    } catch (error) {
      throw error;
    }
  },
  saveLocation: async (req, res) => {
    try {
      let objToSave = {
        location: req.body.location,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        device_token: req.body.device_token,
        device_type: req.body.device_type,
      };
       await Models.userSession.update(objToSave, {
        where: { device_token: req.body.device_token },
      });
      let id = req.user.id;
      let parentKey = `${id.toString()}`;
      let childKey = `${id.toString()}`;
      let response;
      let redisResponse =  await getFromRedis(parentKey, childKey);
      if (redisResponse) {
        await delInRedis(parentKey,childKey)
      }else{
        response = await Models.users.findOne({
          where: { id: req.user.id },
          include: [
            {
              model: Models.userSession,
              required: false,
              where: { device_token: req.body.device_token },
            },
          ],
        });
        await setInRedis(parentKey,childKey,JSON.stringify(response))
      }
      return await helper.success(res, "Location saved successfully", response);
    } catch (error) {
      throw error;
    }
  },
  updateUserDetails: async (req, res) => {
    try {
      const validationSchema = Joi.object().required().keys({
        name: Joi.string().required(),
        gender: Joi.string().required(),
        age: Joi.string().required(),
        email: Joi.string().required(),
        bio: Joi.string().optional(),
        image: Joi.string().optional(),
      });
      helper.dataValidator(validationSchema, req?.body);
      let objToSave = {};
      objToSave = {
         name: req.body.name,
         gender: req.body.gender,
         age: req.body.age,
         email: req.body.email,
         bio: req.body.bio,
       };
      if (req.files && req.files.image) {
        const imageName = helper.imageUpload(req.files.image, "uploads");
        objToSave.image = imageName;
      }
      await Models.users.update(objToSave, { where: { id: req.user.id } });
      let id = req.user.id;
      let parentKey = `userId:${id.toString()}`;
      let result = `userId:${id.toString()}`;
      await delInRedis(parentKey, result);
      let response = await Models.users.findOne({
          where: { id: req.user.id },
          raw: true,
        });
        await setInRedis(parentKey, result, JSON.stringify(response));
      return await helper.success(res, "Profile update successfully", response);
    } catch (error) {
      throw error;
    }
  },
  otherUserProfile: async (req, res) => {
    try {
      let response = await Models.users.findOne({
        where: {
          id: req.body.id,
        },
        include: [
          {
            model: Models.userFollow,
            required: false,
          },
          {
            model: Models.post,
            required: false,
          },
          {
            model: Models.favouriteEvent,
            required: false,
          },
        ],
      });
      return await helper.success(res, "Other user profile", response);
    } catch (error) {
      throw error;
    }
  },
  cmcUser: async (req, res) => {
    try {
      //1 for Privacy Policy 2 for Terms and condition 3 for about Us 4 for Context Us 5 FAQ
      let parentKey="CMC"
      let childKey = "cmcUser";
      let response;
      let data = await getFromRedis(parentKey, childKey);
      if (data) {
        response = JSON.parse(data);
      } else {
        response = await Models.user_pages.findAll();
        await setInRedis(parentKey, childKey, JSON.stringify(response));
      }
      return await helper.success(res, "User CMC detail", response);
    } catch (error) {
      throw error;
    }
  },
  logOut: async (req, res) => {
    try {
      if (
        req.body &&
        req.body.device_token &&
        req.body.device_token.length > 0 &&
        req.body.device_type
      ) {
        await Models.userSession.delete({
          where: {
            device_token: req.body.device_token,
            device_type: req.body.device_type,
          },
        });
      let id = req.user.id;
      let parentKey = `userId:${id.toString()}`;
      let result = `userId:${id.toString()}`;
      await delInRedis(parentKey, result);
      }
      return await helper.success(res, "User logout successfully");
    } catch (error) {
      throw error;
    }
  },
  viewClubDetail: async (req, res) => {
    try {
      var response;
      let id = req.body.clubId;
      let parentKey = `clubId:${id.toString()}`;
      let result = `clubId:${id.toString()}`;
      let data=await getFromRedis(parentKey,childKey)
      if(data){
        response=JSON.parse(data)
      }else{
         response = await Models.club.findOne({
          where: { id: req.body.clubId },
          attributes: [
            [
              Sequelize.literal(
                "(SELECT COUNT(*) FROM post WHERE clubId = club.id)"
              ),
              "postCount",
            ],
          ],
        });
        await setInRedis(parentKey, result,JSON.stringify(response));
      }
      return await helper.success(res, "Club detail ", response);
    } catch (error) {
      throw error;
    }
  },
  createPost: async (req, res) => {
    try {
      const validationSchema = Joi.object().required().keys({
        name_of_the_club: Joi.string().required(),
        clubId: Joi.string().required(),
        caption: Joi.string().required(),
        location: Joi.string().optional(),
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional(),
        tagePeoplesId: Joi.string().optional(),
      });
      let payload = helper.verifyJoiSchema(req?.body, validationSchema);
      let objToSave = {
        name_of_the_club: payload.name_of_the_club,
        clubId: payload.clubId,
        caption: payload.caption,
        location: payload.location,
        latitude: payload.latitude,
        longitude: payload.longitude,
        user_id: req.user.id,
      };
      if (req.body.media_type == 1 && req.files && req.files.image) {
        const imageName = helper.imageUpload(req.files.image, "uploads");
        objToSave.media = imageName;
      }
      if (req.body.media_type == 2 && req.files && req.files.image) {
        const videoName = helper.imageUpload(req.files.image, "uploads");
        await new Promise((resolve, reject) => {
          ffmpeg(`${process.cwd()}/public/uploads/${videoName}`)
            .screenshots({
              timestamps: ["05%"],
              filename: `${videoName}thumbnail.jpg`,
              folder: `${process.cwd()}/public/uploads/`,
              size: "320x240",
            })
            .on("end", () => {
              resolve();
            })
            .on("error", (err) => {
              reject(err);
            });
        });
        var thumbnail = `${videoName}thumbnail.jpg`;
        objToSave.media = videoName;
        objToSave.thumbnail = thumbnail;
      }
      let data = await Models.post.create(objToSave);
      // let tagePeoplesId = [{ userId: "1" }, { userId: "2" }, { userId: "3" }];
      tagePeoplesId.forEach((item) => {
        item.postId = data.id; // Add postId property with value "11" to each object
      });
      await Models.postTagPeople.bulkCreate(tagePeoplesId);
      let response = await Models.post.findOne({
        where: {
          id: data.id,
        },
        include: [
          {
            model: Models.postTagPeople,
            required: false,
            include: [
              {
                model: Models.users,
                required: false,
              },
            ],
          },
        ],
      });
      return await helper.success(res, "Post create successfully", response);
    } catch (error) {
      throw error;
    }
  },
  bookEvent: async (req, res) => {
    try {
      const validationSchema = Joi.object().required().keys({
        eventId: Joi.string().required(),
        ticketType: Joi.string().required(),
        noOfTickets: Joi.string().optional(),
        userId: Joi.number().optional(),
      });
      let payload = helper.verifyJoiSchema(req?.body, validationSchema);
      let objToSave = {
        eventId: payload.eventId,
        ticketType: payload.ticketType,
        noOfTickets: payload.noOfTickets,
        userId: req.user.id,
      };
      await Models.bookEvent.create(objToSave);
      return await helper.success(
        res,
        "Your booking create successfully",
        response
      );
    } catch (error) {
      throw error;
    }
  },
  myAllBooking: async (req, res) => {
    try {
      let id = req.user.id;
      let parentKey = `myBookings:${id.toString()}`;
      let childKey = `myBookings:${id.toString()}`;
      let response;
      let redisResponse = await getFromRedis(parentKey, childKey);
      if (redisResponse) {
        response = JSON.parse(redisResponse);
        await delInRedis(parentKey,childKey)
      } else {
        response = await Models.bookEvent.findAll({
          where: { userId: req.user.id },
          include: [
            {
              model: Models.events,
              required: false,
              include: {
                model: Models.eventImages,
                required: false,
              },
            },
          ],
        });
        await setInRedis(parentKey,childKey,JSON.stringify(response));
      }
      return await helper.success(res, "My All booking", response);
    } catch (error) {
      throw error;
    }
  },
  createRating: async (req, res) => {
    try {
      const validationSchema = Joi.object()
        .required()
        .keys({
          clubId: Joi.string().required(),
          rating: Joi.string().required().valid(1, 2, 3, 4, 5),
          message: Joi.string().optional(),
        });
      let payload = helper.verifyJoiSchema(req?.body, validationSchema);
      let objToSave = {
        clubId: payload.clubId,
        userId: req.user.id,
        rating: payload.rating,
        message: payload.message,
      };
      await Models.reviewsRating.create(objToSave);
      return await helper.success(res, "Rating add successfully", response);
    } catch (error) {
      throw error;
    }
  },
  likePost: async (req, res) => {
    try {
      const validationSchema = Joi.object().required().keys({
        postId: Joi.string().required(),
        userId: Joi.string().optional(),
      });
      let payload = helper.verifyJoiSchema(req?.body, validationSchema);
      let objToSave = {
        postId: payload.postId,
        userId: req.user.id,
      };
      await Models.postLike.create(objToSave);
      return helper.success(res, "Post like successfully");
    } catch (error) {
      throw error;
    }
  },
  commentOnPost: async (req, res) => {
    try {
      const validationSchema = Joi.object().required().keys({
        postId: Joi.string().required(),
        userId: Joi.string().optional(),
        comment: Joi.string().required(),
      });
      let payload = helper.verifyJoiSchema(req?.body, validationSchema);
      let objToSave = {
        postId: payload.postId,
        userId: req.user.id,
        comment: payload.comment,
      };
      await Models.postComment.create(objToSave);
      return helper.success(res, "Post comment added successfully");
    } catch (error) {
      throw error;
    }
  },
  allPostNotCreatedByMe: async (req, res) => {
    try {
      let id = req.user.id;
      let parentKey = `allPostNotCreatedByMe:${id.toString()}`;
      let childKey = `allPostNotCreatedByMe:${id.toString()}`;
      let response;
      let redisResponse = getFromRedis(parentKey, childKey);
      if (redisResponse) {
        response = JSON.parse(redisResponse);
        await delInRedis(parentKey,childKey)
      } else {
        response = await Models.post.findAll({
          where: {
            user_id: {
              [Sequelize.Op.not]: req.user.id, // Exclude posts created by req.user.id
            },
          },
          attributes: [
            "id",
            "user_id",
            "media",
            "media_type",
            "name_of_the_club",
            "caption",
            "description",
            "location",
            "latitude",
            "longitude"[
              (Sequelize.literal(
                "(SELECT COUNT(*) FROM postLike WHERE postId = post.id)"
              ),
              "likeCount")
            ],
            [
              Sequelize.literal(
                "(SELECT COUNT(*) FROM postComment WHERE postId = post.id)"
              ),
              "commentCount",
            ],
            [
              Sequelize.literal(`ifnull((SELECT count(id)
            FROM postLike WHERE  userId =${req.user.id}  AND post.id= postId limit 1 ),0)`),
              "is_favourite",
            ],
          ],
          include: [
            {
              model: Models.users,
              required: false,
            },
          ],
        });
        await setInRedis(parentKey,childKey,JSON.stringify(response));
       }
      return helper.success(
        res,
        "All user created post with count of likes and comments data successfully",
        response
      );
    } catch (error) {
      throw error;
    }
  },
  allPostCreatedByMe: async (req, res) => {
    try {
      let response;
      let id=req.user.id
      let parentKey=`allPostCreatedByMe:${id.toString()}`
      let childKey=`allPostCreatedByMe:${id.toString()}`
      let result=getFromRedis(parentKey,childKey)
      if(result){
        response=JSON.parse(result)
      }else{
        response = await Models.post.findAll({
          where: {
            user_id: req.user.id,
          },
          attributes: [
            "id",
            "user_id",
            "media",
            "media_type",
            "name_of_the_club",
            "caption",
            "description",
            "location",
            "latitude",
            "longitude"[
              (Sequelize.literal(
                "(SELECT COUNT(*) FROM postLike WHERE postId = post.id)"
              ),
              "likeCount")
            ],
            [
              Sequelize.literal(
                "(SELECT COUNT(*) FROM postComment WHERE postId = post.id)"
              ),
              "commentCount",
            ],
          ],
          include: [
            {
              model: Models.users,
              required: false,
            },
          ],
        });
        await setInRedis(parentKey,childKey,JSON.stringify(response))
      }
      return helper.success(
        res,
        "All post created by me and count of likes and comments data successfully",
        response
      );
    } catch (error) {
      throw error;
    }
  },
  likePostUserList: async (req, res) => {
    try {
      let response = await Models.postLike.findAll({
        where: {
          postId: req.body.postId,
        },
        include: [
          {
            model: Models.users,
            required: false,
          },
        ],
      });
      return helper.success(res, "List of user whome like the post", response);
    } catch (error) {
      throw error;
    }
  },
  commentPostUseList: async (req, res) => {
    try {
      let response = await Models.postComment.findAll({
        where: {
          postId: req.body.postId,
        },
        include: [
          {
            model: Models.users,
            required: false,
          },
        ],
      });
      return helper.success(
        res,
        "List of user whome comment on the post",
        response
      );
    } catch (error) {
      throw error;
    }
  },
  friendRequestSend: async (req, res) => {
    try {
      const validationSchema = Joi.object().required().keys({
        followingId: Joi.string().required(),
      });
      let payload = helper.verifyJoiSchema(req?.body, validationSchema);
      let objToSave = {
        follwer: req.user.id,
        followingId: payload.followingId,
      };
      let userFollowSave = await Models.userFollow.create(objToSave);
      let objToSave1 = {
        senderId: req.user.id,
        receiverId: payload.followingId,
        requestType: 1,
        userFollowId: userFollowSave.id,
      };
      await Models.notification.create(objToSave1);
    
      return helper.success(res, "Your request has been send successfully");
    } catch (error) {
      throw error;
    }
  },
  acceptRejectRequest: async (req, res) => {
    try {
      if (req.body && req.body.isAccept == 1) {
        //then change isAccept status in user follow model
        await Models.userFollow.update(
          { isAccept: req.body.isAccept },
          { id: req.body.userFollowId }
        );
      } else if (req.body && req.body.isAccept == 2) {
        // delete the isAccept status set 2 for rejection
        await Models.userFollow.update(
          { isAccept: req.body.isAccept },
          { id: req.body.userFollowId }
        );
      }
      return helper.success(res, "Send successfully");
    } catch (error) {
      throw error;
    }
  },
  notificationList: async (req, res) => {
    try {
      let response;
      let id=req.user.id;
      let parentKey=`notificationList:${id.toString()}`;
      let childKey=`notificationList:${id.toString()}`;
      let result=await getFromRedis(parentKey,childKey)
      if(result){
        response=JSON.parse(result)
      }else{
        response = await Models.notification.findAll({
          where: {
            receiverId: req.user.id,
            requestType: 0,
          },
        });
        await setInRedis(parentKey,childKey,JSON.stringify(response))
      }
      return helper.success(
        res,
        "Notification list fetch successfully",
        response
      );
    } catch (error) {
      throw error;
    }
  },
  favouriteEvent: async (req, res) => {
    try {
      let objToSave = {
        userId: req.user.id,
        eventId: req.body.eventId,
      };
      await Models.favouriteEvent.create(objToSave);
      return helper.success(res, "Event add favorite successfully");
    } catch (error) {
      throw error;
    }
  },
  favouriteEventList: async (req, res) => {
    try {
      let response = await Models.favouriteEvent.findAll({
        where: {
          userId: req.user.id,
        },
        include: [
          {
            model: Models.events,
            required: false,
          },
        ],
      });
      let id=req.user.id;
      let parentKey=`favouriteEvent:${id.toString()}`;
      let childKey=`favouriteEvent:${id.toString()}`;
      let timestamps=150//15 second
      let result=await getFromRedis(parentKey,childKey)
      if(result){
        response=JSON.parse(result)
      }else{
        await setInRedis(parentKey,childKey,JSON.stringify(response),timestamps)
      }
      return helper.success(
        res,
        "Favourite events list fetch successfully",
        response
      );
    } catch (error) {
      throw error;
    }
  },
  contactUs: async (req, res) => {
    try {
      let objToSave = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        message: req.body.message,
      };
      await Models.contact_us.create(objToSave);
      return helper.success(res, "Message send successfully");
    } catch (error) {
      throw error;
    }
  },
  listOfAllClub: async (req, res) => {
    try {
      let id=req.user.id;
      let parentKey=`listOfAllClub:${id.toString()}`
      let childKey=`listOfAllClub:${id.toString()}`
      let result=await getFromRedis(parentKey,childKey)
      if(result){
        result=JSON.parse(result)
      }else{
        var response = await Models.club.findAll();
        await setInRedis(parentKey,childKey,JSON.stringify(response),300)
      }
      return helper.success(res, "List of all club", response);
    } catch (error) {
      throw error;
    }
  },
  FAQ: async (req, res) => {
    try {
      let response;
      let parentKey=`FAQ`
      let childKey=`FAQS`
      let data=await getFromRedis(parentKey,childKey)
      if(data){
        data=JSON.parse(data)
      }else{
        response=await Models.faq.findAll()
        await setInRedis(parentKey,childKey,JSON.stringify(response))
      }
      return helper.success(res, "List of all faq.", response);
    } catch (error) {
      throw error;
    }
  },
  //Test cases
  userPage: async (req, res) => {
    try {
      let objToSave1 = {
        type: 1,
        slug: "privacy-policy",
        title: "Privacy Policy",
        description:
          "Privacy Policy Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      };
      let objToSave2 = {
        type: 2,
        slug: "term-conditions",
        title: "Terms & Conditions",
        description:
          "Terms &amp; Conditions Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      };
      let objToSave3 = {
        type: 3,
        slug: "contact-us",
        title: "Contact Us",
        description:
          "Contact Us Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      };
      let objToSave4 = {
        type: 4,
        slug: "about-us",
        title: "About Us",
        description:
          "About Us Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      };
      let objToSave5 = {
        type: 5,
        slug: "faq",
        title: "FAQ",
        description:
          "FAQ Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
      };
      await Models.user_pages.create(objToSave1);
      await Models.user_pages.create(objToSave2);
      await Models.user_pages.create(objToSave3);
      await Models.user_pages.create(objToSave4);
      await Models.user_pages.create(objToSave5);

      await Models.pages.create(objToSave1);
      await Models.pages.create(objToSave2);
      await Models.pages.create(objToSave3);
      await Models.pages.create(objToSave4);
      await Models.pages.create(objToSave5);
    } catch (error) {
      throw error;
    }
  },
  addFAQ: async (req, res) => {
    try {
      let objToSave = {
        question: "This is trial",
        answer: "Trail answer",
      };
      let objToSave1 = {
        question: "This is testing",
        answer: "Faq answer",
      };
      let objToSave2 = {
        question: "This is testing",
        answer: "Faq answer",
      };
      let objToSave3 = {
        question: "This is testing",
        answer: "Faq answer",
      };
      await Models.faq.create(objToSave);
      await Models.faq.create(objToSave1);
      await Models.faq.create(objToSave2);
      await Models.faq.create(objToSave3);
      return true;
    } catch (error) {
      throw error;
    }
  },
  messageQueueTest:async(req,res)=>{
    try {   
      let users=await Models.events.findAll()
      users.forEach((user,index)=>{
        emailQueue.add(user).then(()=>{
          if(index+1==users.length){
            res.json({
              message:"All send detail save in queue"   
            })
          }
        })
      })
    } catch (error) {
      throw error
    }
  }
};
