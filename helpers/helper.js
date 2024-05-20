const bcrypt = require('bcrypt');
const CryptoJS = require('crypto-js');
const uuid = require('uuid').v4;
var path = require('path');
const FCM = require('fcm-node');
const fileExtension = require('file-extension');
const sharp = require('sharp') //for image thumbnail
// const Thumbler = require('thumbler');//for video thumbnail
const util = require('util')
const fs = require('fs-extra')
const models = require('../models');
const sequelize = require('sequelize');
const nodemailer = require('nodemailer');

const jwt=require("jsonwebtoken")
const privateKey = "config.APP_URLS.PRIVATE_KEY_ADMIN";

module.exports = {

    checkValidation: async (v) => {
        var errorsResponse
        await v.check().then(function (matched) {
            if (!matched) {
                var valdErrors=v.errors;
                var respErrors=[];
                Object.keys(valdErrors).forEach(function(key) {
                    if(valdErrors && valdErrors[key] && valdErrors[key].message){
                        respErrors.push(valdErrors[key].message);
                    }
                });   
                errorsResponse=respErrors.join(', ');
                // return helper.error(res, errorsResponse)
            }
        });
        return errorsResponse;
    },

    //Encrypting text
    encrypt: async function(text) {
        let encryptdEmail = CryptoJS.AES.encrypt(text, global.securityKey).toString();
        // console.log(encryptdEmail,'========================encryptdEmail')
        return encryptdEmail;
    },
 
    //Decrypting text
    decrypt:async function(text) {
        let bytes  = CryptoJS.AES.decrypt(text, global.securityKey);
        let decryptedText = bytes.toString(CryptoJS.enc.Utf8);
        return decryptedText;
    },

    success: function (res, message = '', body = {}) {
        return res.status(200).json({
            'success': true,
            'code': 200,
            'message': message,
            'body': body
        });
    },

    error: function (res, err, req) {
        console.log(err, '===========================>error in helper');
        let code = (typeof err === 'object') ? (err.code) ? err.code : 403 : 403;
        let message = (typeof err === 'object') ? (err.message ? err.message : '') : err;
        if (req) {
            req.flash('flashMessage', {
                color: 'error',
                message
            });
            const originalUrl = req.originalUrl.split('/')[1];
            return res.redirect(`/${originalUrl}`);
        }

        return res.status(code).json({
            'success': false,
            'message': message,
            'code': code,
            'body': {}
        });
    },

    failed: function (res, message = '') {
        message = (typeof message === 'object') ? (message.message ? message.message : '') : message;
        return res.status(400).json({
            'success': false,
            'code': 400,
            'message': message,
            'body': {}
        });
    },

    send_push_notification: async function (
        device_type,
        device_token,
        notification_type,
        message,
        messageData) {
        let dataForSend = {
            title: 'app',
            body: message,
            device_token:device_token,
            device_type: device_type,
            type: notification_type,
            messageData,
        }

        if (device_type == 2 || device_type == 1) {
            if (device_token != '' && device_token != null) {
                let message = {
                    to: device_token,
                    data: dataForSend,
                    notification: dataForSend
                };
                var serverKey = "AAAABxkq0Yw:APA91bFWSO0ng3h5cW6MKV6W0A4otTYCVOBPZZQHbtKqOFyWNTKFwvXt5IhJ2PDPIFCtDRFVxSmHU69fMpkWqxFl8BJNVjIJmVsmrt6bmCcE_PGRxK1WM-lTuIiDaMsXwGtgau3nxqSJ"; //put 
                var fcm = new FCM(serverKey);

                fcm.send(message, function (err, response) {
                    if (err) {
                        console.log("Something has gone wrong!", err);
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                });

                return fcm;
            }
        }
    },

    send_push_notification_testMODEL: async function (
        device_type,
        device_token,
        notification_type,
        message,
        messageData) {
        let dataForSend = {
            title: 'app',
            message: message,
            device_token:device_token,
            device_type: device_type,
            type: notification_type,
            messageData,
        }
      
        if (device_type == 1) {
       
            // const apn = require('apn');
            // const options = {
            //     token: {
            //         key: __dirname + "/AuthKey_Q3NW9UXH2J.p8",
            //         keyId: "Q3NW9UXH2J",
            //         teamId: "4XVQBWH9QF"
            //     },
            //     production: false
            // };
            // const apnProvider = new apn.Provider(options);
            
            // if (dataForSend && dataForSend.device_token && dataForSend.device_token != '')
          
            if (dataForSend && dataForSend.device_token) {

                var myDevice = dataForSend.device_token;
                // var note = new apn.Notification();
                // note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
                // note.badge = 1;
                // note.sound = "ping.aiff";
                // note.alert = dataForSend.message;
                // note.payload = { 'data': dataForSend };
                // note.topic = "com.live.TCHADXPLORE";
                // apnProvider.send(note, myDevice).then((result) => {
                // }).catch((err) => {
                //     console.error("error while sending user notification", err);
                // });
            }
        }

        if (device_type == 2) {
            if (device_token != '' && device_token != null) {
                let message = {
                    to: device_token,
                    data: dataForSend,
                    notification: dataForSend
                };
                var serverKey = "AAAABxkq0Yw:APA91bFWSO0ng3h5cW6MKV6W0A4otTYCVOBPZZQHbtKqOFyWNTKFwvXt5IhJ2PDPIFCtDRFVxSmHU69fMpkWqxFl8BJNVjIJmVsmrt6bmCcE_PGRxK1WM-lTuIiDaMsXwGtgau3nxqSJ"; //put 
                var fcm = new FCM(serverKey);

                fcm.send(message, function (err, response) {
                    if (err) {
                        console.log("Something has gone wrong!", err);
                    } else {
                        console.log("Successfully sent with response: ", response);
                    }
                });

                return fcm;
            }
        }
    },
    dataValidator: (validationSchema, data) => {
        try {
          const validation = validationSchema.validate(data);
          if (validation.error) {
            let message = validation.error.details[0].message;
            message = message.split(" ");
            message[0] = message[0].split('"')[1];
            let erroeMessage = "";
            message.map((w) => (erroeMessage += ` ${w}`));
            throw { message: erroeMessage.trim(), statusCode: 400 };
          }
          return true;
        } catch (err) {
          throw err;
        }
      },
    verifyJoiSchema: async(data, schema) => {
		console.log("joi me",data)
		const validSchema = await schema.validate(data);
		if ((validSchema) && (validSchema.error)) {
			console.log("balid",validSchema)
			throw validSchema.value;
		} else {
			return validSchema.value;
		}
	},
    JWTManager: {
        createToken: (data = {}) => {
        try {
            if (!data?.id) throw "id required for generate Token";
            data.iat = moment().add(process?.env?.JWT_SECRET, "days").valueOf();
            const token = jwt.sign(data, privateKey, {
            expiresIn: "24h",
            });
            return token;
        } catch (err) {
            throw err;
        }
        },
    },
    imageUpload: (file, folder = 'user') => {
        if (file.name == '') return;
        let file_name_string = file.name;
        var file_name_array = file_name_string.split(".");
        var file_extension = file_name_array[file_name_array.length - 1];
        var letters = "ABCDE1234567890FGHJK1234567890MNPQRSTUXY";
        var result = "";

        result = uuid();
        let name = result + '.' + file_extension;
        file.mv('public/' + folder + '/' + name, function (err) {
        if (err) throw err;
        });
        return '/' + folder + '/' + name;
    },
}