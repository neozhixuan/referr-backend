import { MongoClient } from "mongodb";

// Function to send a dummy request to the cluster
async function keepAlive() {
  const client = new MongoClient(process.env.REFERRALS_DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    console.log("Connected to MongoDB cluster");

    // Perform a dummy operation, like listing databases
    const adminDb = client.db().admin();
    const databases = await adminDb.listDatabases();
    console.log("Databases:", databases);

    console.log("Request sent successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB cluster:", error);
  } finally {
    // Close the connection
    await client.close();
    console.log("Connection closed");
  }
}

export default keepAlive();
