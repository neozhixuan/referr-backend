const app = require("./server.js");
import mongodb from "mongodb";
import dotenv from "dotenv";
import ReferralsDAO from "./dao/referralDAO.js";
import orgService from "./api/orgService.js";
import mongoose from "mongoose";
import cors from "cors";
dotenv.config();
const port = process.env.PORT || 8000;

mongoose
  .connect(process.env.REFERRALS_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "Backend", // Set the desired database name here
  })
  .then(() => console.log("MongoDB is  connected successfully"))
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async () => {
    const conn = mongoose.connection;
    await ReferralsDAO.injectDB(conn);
    await orgService.injectDB(conn);
    app.use(cors());

    // How we start the web server after connecting
    app.listen(port, () => {
      // Log the process
      console.log(`listening on port ${port}`);
    });
  });

// dotenv.config();
// // Access mongo client
// const MongoClient = mongodb.MongoClient;

// // 8000 if the current one cannot be accessed
// const port = process.env.PORT || 8000;

// MongoClient.connect(process.env.REFERRALS_DB_URI, {
//   // options: max people who can connnect
//   maxPoolSize: 50,
//   // after x time, the request times out
//   wtimeoutMS: 250,
//   // Mongodb nodejs driver rewrote the tool that parses mongodb
//   // connection strings
//   useNewUrlParser: true,
// })
//   .catch((err) => {
//     console.error(err.stack);
//     process.exit(1);
//   })
//   .then(async (client) => {
//     await ReferralsDAO.injectDB(client);
//     await orgService.injectDB(client);
//     // How we start the web server after connecting
//     app.listen(port, () => {
//       // Log the process
//       console.log(`listening on port ${port}`);
//     });
//   });
