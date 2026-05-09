import mongoose from 'mongoose';

const uri = "mongodb://sarthakshastrakar9:zG0XsAo4Q2NWcA1e@ac-17axwb0-shard-00-00.irshjam.mongodb.net:27017,ac-17axwb0-shard-00-01.irshjam.mongodb.net:27017,ac-17axwb0-shard-00-02.irshjam.mongodb.net:27017/nextstep-ai?ssl=true&replicaSet=atlas-17axwb-shard-0&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(uri)
  .then(() => {
    console.log("Successfully connected to MongoDB without SRV!");
    process.exit(0);
  })
  .catch(err => {
    console.error("Connection error:", err);
    process.exit(1);
  });
