const Joi = require("joi");
const _ = require("underscore");
let helper = require("../../helpers/helper");
const privateKey = "config.APP_URLS.PRIVATE_KEY_ADMIN";
const Models = require("../../models/index");
const ffmpeg = require("fluent-ffmpeg");

Models.events.hasMany(Models.eventImages, { foreignKey: "eventId" });    
Models.bookEvent.belongsTo(Models.users,{foreignKey:"userId"})
Models.userAnswer.belongsTo(Models.users,{foreignKey:"userId"});
Models.userAnswer.belongsTo(Models.adminQuestion,{foreignKey:"questionId"})
Models.userAnswer.belongsTo(Models.adminQuestionOption,{foreignKey:"answerId"})
module.exports = {
  questionAnswer:async(req,res)=>{
    try {
      let response=await Models.adminQuestion.findAll({
        include:[{
          model:Models.adminQuestionOption,
          required:true
        }]
      })
      return await helper.success(res, "Question List", response);
    } catch (error) {
      throw error
    }
  },
  userQuestionAnswer:async(req,res)=>{
    try {
      let answer = req.body.answer;
      answer.forEach((result) => {
          result.userId = req.user.id;
      });
      await Models.userAnswer.bulkCreate(answer);
      let response=await Models.userAnswer.findAll({
        where:{
          userId:req.user.id
        },include:[{
          model:Models.users,
          required:true
        },{
          model:Models.adminQuestion,
          required:true
        },{
          model:Models.adminQuestionOption,
          required:true
        }]
      })
      return await helper.success(res, "Answer submit successfully",response);     
    } catch (error) {
      throw error
    }
  },
  completeProfile: async (req, res) => {
    try {
      const validationSchema = Joi.object().required().keys({
        club_name: Joi.string().required(),
        enterprise_name: Joi.string().required(),
        Id_number: Joi.string().required(),
        location: Joi.string().required(),
        latitude: Joi.string().optional(),
        longitude: Joi.string().optional(),
      });
      let payload = helper.verifyJoiSchema(req?.body, validationSchema);
      let objToSave = {
        club_name: req.body.club_name,
        enterprise_name: req.body.enterprise_name,
        Id_number: req.body.Id_number,
        location: req.body.location,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
      };
      await Models.club.update(objToSave, { where: { id: req.user.id } });
      return await helper.success(res, "Detail saved successfully");
    } catch (error) {
      throw error;
    }
  },
  updateDetails: async (req, res) => {
    try {
      const validationSchema = Joi.object().required().keys({
        name: Joi.string().required(),
        email: Joi.string().required(),
        phone: Joi.string().required(),
        country_code: Joi.string().required(),
      });
      let payload = helper.verifyJoiSchema(req?.body, validationSchema);
      let objToSave = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        country_code: req.body.country_code,
      };
      await Models.club.update(objToSave, { where: { id: req.user.id } });
      return await helper.success(res, "Profile update successfully");
    } catch (error) {
      throw error;
    }
  },
  cmcClub: async (req, res) => {
    try {
      //1 for Privacy Policy 2 for Terms and condition 3 for about Us 4 for Context Us 5 FAQ
      let response = await Models.pages.findAll();
      return await helper.success(res, "User CMC detail", response);
    } catch (error) {
      throw error;
    }
  },
  createEvent: async (req, res) => {
    try {
      const validationSchema = Joi.object().keys({
        clubId: Joi.string().required(),
        type: Joi.string().required(),
        name: Joi.string().required(),
        event_date: Joi.string().required(),
        event_time: Joi.string().required(),
        ticket_type: Joi.string().required(),
        price: Joi.string().required(),
        noOfTickets: Joi.string().required(),
        rules: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        latitude: Joi.string().optional(),
        longitude: Joi.string().optional(),
      });
      let payload = helper.verifyJoiSchema(req?.body, validationSchema);
      let objToSave = {};
      if (_.has(payload, "userId") && payload.userId != "")
        objToSave.userId = req.user.id;
      if (_.has(payload, "clubId") && payload.clubId != "")
        objToSave.clubId = payload.clubId;
      if (_.has(payload, "type") && payload.type != "")
        objToSave.type = payload.type;
      if (_.has(payload, "name") && payload.name != "")
        objToSave.name = payload.name;
      if (_.has(payload, "event_date") && payload.event_date != "")
        objToSave.event_date = payload.event_date;
      if (_.has(payload, "event_time") && payload.event_time != "")
        objToSave.event_time = payload.event_time;
      if (_.has(payload, "ticket_type") && payload.ticket_type != "")
        objToSave.ticket_type = payload.ticket_type;
      if (_.has(payload, "price") && payload.price != "")
        objToSave.price = payload.price;
      if (_.has(payload, "noOfTickets") && payload.noOfTickets != "")
        objToSave.noOfTickets = payload.noOfTickets;
      if (_.has(payload, "rules") && payload.rules != "")
        objToSave.rules = payload.rules;
      if (_.has(payload, "description") && payload.description != "")
        objToSave.description = payload.description;
      if (_.has(payload, "location") && payload.location != "")
        objToSave.location = payload.location;
      if (_.has(payload, "latitude") && payload.latitude != "")
        objToSave.latitude = payload.latitude;
      if (_.has(payload, "longitude") && payload.longitude != "")
        objToSave.longitude = payload.longitude;
      let data = await Models.events.create(objToSave);
      let imageData = [];
      if (req.files && req.files.multipleimage) {
        const uploadedImages = Array.isArray(req.files.multipleimage)
          ? req.files.multipleimage
          : [req.files.multipleimage];
        let obj = {};
        for (const image of uploadedImages) {
          const imageName = helper.imageUpload(image, "uploads");
          obj = {
            eventId: data.id,
            uploadedData: imageName,
            type: 1,
          };
          imageData.push(obj);
        }
      }
      if (req.files && req.files.multipleVidio) {
        const uploadedVideo = Array.isArray(req.files.multipleVidio)
          ? req.files.multipleVidio
          : [req.files.multipleVidio];
        let obj = {};
        for (const video of uploadedVideo) {
          const videoName = helper.imageUpload(video, "uploads");
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
          obj = {
            eventId: data.id,
            uploadedData: videoName,
            thumbnail: thumbnail,
            type: 2,
          };
          imageData.push(obj);
        }
      }
      await Models.eventImages.bulkCreate(obj);
      let response = await Models.events.findOne({
        where: {
          id: data.id,
        },
        include: [
          {
            model: Models.eventImages,
            required: false,
          },
        ],
      });
      return await helper.success(res, "Event create successfully", response);
    } catch (error) {
      throw error;
    }
  },
  userListBookingEvent:async(req,res)=>{
    try {
      let response=await Models.bookEvent.findAll({where:{
        eventId:req.body.eventId
      },include:[{
        model:Models.users,
        required:true
      }],raw:true})
      return await helper.success(res, "All User list whome book the event", response);
    } catch (error) {
      throw error
    }
  },
  updateEvent: async (req, res) => {
    try {
      const validationSchema = Joi.object().keys({
        id: Joi.string().required(),
        type: Joi.string().required(),
        name: Joi.string().required(),
        eventDate: Joi.string().required(),
        eventTime: Joi.string().required(),
        ticket_type: Joi.string().required(),
        price: Joi.string().required(),
        noOfTickets: Joi.string().required(),
        rules: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        latitude: Joi.string().optional(),
        longitude: Joi.string().optional(),
      });
      let payload = helper.verifyJoiSchema(req?.body, validationSchema);
      let objToUpdate = {};
      if (_.has(payload, "userId") && payload.userId != "")
        objToUpdate.userId = req.user.id;
      if (_.has(payload, "clubId") && payload.clubId != "")
        objToUpdate.clubId = payload.clubId;
      if (_.has(payload, "type") && payload.type != "")
        objToUpdate.type = payload.type;
      if (_.has(payload, "name") && payload.name != "")
        objToUpdate.name = payload.name;
      if (_.has(payload, "event_date") && payload.event_date != "")
        objToUpdate.event_date = payload.event_date;
      if (_.has(payload, "event_time") && payload.event_time != "")
        objToUpdate.event_time = payload.event_time;
      if (_.has(payload, "ticket_type") && payload.ticket_type != "")
        objToUpdate.ticket_type = payload.ticket_type;
      if (_.has(payload, "price") && payload.price != "")
        objToUpdate.price = payload.price;
      if (_.has(payload, "noOfTickets") && payload.noOfTickets != "")
        objToUpdate.noOfTickets = payload.noOfTickets;
      if (_.has(payload, "rules") && payload.rules != "")
        objToUpdate.rules = payload.rules;
      if (_.has(payload, "description") && payload.description != "")
        objToUpdate.description = payload.description;
      if (_.has(payload, "location") && payload.location != "")
        objToUpdate.location = payload.location;
      if (_.has(payload, "latitude") && payload.latitude != "")
        objToUpdate.latitude = payload.latitude;
      if (_.has(payload, "longitude") && payload.longitude != "")
        objToUpdate.longitude = payload.longitude;
      let data = await Models.events.update(objToUpdate, {
        where: { id: req.body.eventId },
      });
      await Models.eventImages.destory({
        where: { eventId: req.body.eventId },
      });
      let imageData = [];
      if (req.files && req.files.multipleimage) {
        const uploadedImages = Array.isArray(req.files.multipleimage)
          ? req.files.multipleimage
          : [req.files.multipleimage];
        let obj = {};
        for (const image of uploadedImages) {
          const imageName = helper.imageUpload(image, "uploads");
          obj = {
            eventId: data.id,
            uploadedData: imageName,
            type: 1,
          };
          imageData.push(obj);
        }
      }
      if (req.files && req.files.multipleVidio) {
        const uploadedVideo = Array.isArray(req.files.multipleVidio)
          ? req.files.multipleVidio
          : [req.files.multipleVidio];
        let obj = {};
        for (const video of uploadedVideo) {
          const videoName = helper.imageUpload(video, "uploads");
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
          obj = {
            eventId: data.id,
            uploadedData: videoName,
            thumbnail: thumbnail,
            type: 2,
          };
          imageData.push(obj);
        }
      }
      await Models.eventImages.bulkCreate(obj);
      let response = await Models.events.findOne({
        where: {
          id: data.id,
        },
        include: [
          {
            model: Models.eventImages,
            required: false,
          },
        ],
      });
      return await helper.success(res, "Event update successfully", response);
    } catch (error) {
      throw error;
    }
  },
  deleteEvent: async (req, res) => {
    try {
      const validationSchema = Joi.object().keys({
        id: Joi.string().required(),
      });
      let payload = helper.verifyJoiSchema(req?.body, validationSchema);
      let findDetail=await Models.events.findOne({where:{id:req.body.id}});
      if(findDetail&&findDetail.userId==req.user.id){
        await Models.events.destory({ where: { id: req.body.id } });
        await Models.eventImages.destory({ where: { eventId: req.body.id } });
        return await helper.success(res, "Event delete successfully");
      }else{
        return await helper.success(res, "This event is not created by you");
      }
    } catch (error) {
      throw error;
    }
  },
  myCreatedEvent: async (req, res) => {
    try {
      let response = await Models.events.findAll({
        where: {
          userId: req.user.id,
        },
        include: [
          {
            model: Models.eventImages,
            required: true,
          },
        ],
      });
      return await helper.success(res, "My created Events", response);
    } catch (error) {
      throw error;
    }
  },
  clubAllEvent:async(req,res)=>{
    try {
      let response = await Models.events.findAll({
        where: {
          clubId: req.body.clubId,
        },
        include: [
          {
            model: Models.eventImages,
            required: true,
          },
        ],
      });
      return await helper.success(res, "Club created Events", response);
    } catch (error) {
      throw error;
    }
  },
  eventDetail:async(req,res)=>{
    try {
      let id=req.query.eventId;
      let response=await Models.events.findOne({where:{id:id}});
      return await helper.success(res, "Events detail", response);

    } catch (error) {
      throw error
    }
  }
};
