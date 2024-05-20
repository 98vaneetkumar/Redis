const Redis=require("../redis/redis")
const path=require("path")

Redis.emailQueue.process(path.join(__dirname,"notificationQueueProcessor.js"));

Redis.emailQueue.on("completed",(job)=>{
    console.log(`Completed #${job.id} Job`)
})

Redis.emailQueue.on("failed",async(job,err)=>{
    console.log(`Failed #${job.id} Job with error ${err.message}. Adding to retry queue.`);
    await Redis.retryQueue.add(job.data);

})


//When the due to any failer create retryQueue

Redis.retryQueue.process(path.join(__dirname, "retryQueueProcessor.js"));

Redis.retryQueue.on("completed", (job) => {
    console.log(`Retry Completed #${job.id} Job`);
    updateEmailStatus(job.id, 'success');
});

Redis.retryQueue.on("failed", (job, err) => {
    console.log(`Retry Failed #${job.id} Job with error ${err.message}`);
});