const mongo = require('mongoose');
const dns = require("dns");
dns.setServers(["8.8.8.8"]);
const connectDB = async()=>{
    try{
        await mongo.connect(process.env.MONGO_URI);
        console.log('mongo connected');
    }catch(e){
        console.log(e.message);
    }
}
module.exports = connectDB;