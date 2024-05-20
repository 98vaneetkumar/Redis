const redis = require("redis");
const redisClient = redis.createClient();
redisClient.connect();
redisClient.on("connect", function () {
  console.log("Redis connected");
});
const Queue=require("bull")
const emailQueue=new Queue("emailQueue",{
   redis:{
    host:"127.0.0.1",
    port:6379
   }
})

const retryQueue=new Queue("retryQueue",{
  redis:{
   host:"127.0.0.1",
   port:6379
  }
})
async function getFromRedis(parentKey, childKey) {
  try {
    let redisResponse = await redisClient.hGet(parentKey, childKey);
    return redisResponse ? JSON.parse(redisResponse) : false;
  } catch (error) {
    throw error;
  }
}

async function setInRedis(parentKey, childKey, response,timestamps) {
  try {
    await redisClient.hSet(parentKey, childKey, JSON.stringify(response)); // Setting expiration time in seconds
    redisClient.expire(parentKey, timestamps?timestamps:300); //30 second
    return true;
  } catch (error) {
    throw error;
  }
}
async function delInRedis(parentKey, result) {
  try {
    await redisClient.hDel(parentKey, result);
    return true;
  } catch (error) {
    throw error;
  }
}
module.exports = { redisClient, getFromRedis, setInRedis, delInRedis,emailQueue,retryQueue };
