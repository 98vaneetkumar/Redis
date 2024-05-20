const helper=require("../helpers/helper")
const retryQueueProcessor=async(job,done)=>{
    try {
      console.log("job.id",job.id)
      setTimeout(()=>{
        done()
      },1000)
    } catch (error) {
      throw error
    }
 }

module.exports=retryQueueProcessor 