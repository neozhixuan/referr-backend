import { ObjectId } from "mongodb";

let referrals;
export default class ReferralsDAO {
  static async injectDB(conn) {
    if (referrals) {
      // If it is already filled
      return;
    }
    try {
      // Connect and get specific collection in database
      referrals = await conn
        .useDb(process.env.REFERRALS_NS)
        .collection("Referrals");
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in referralDAO: ${e}`
      );
    }
  }
  static async getReferrals({
    filters = null,
    page = 0,
    referralsPerPage = 10,
  } = {}) {
    // Get the Mongo query necessary
    let query;
    if (filters) {
      if ("organisation" in filters) {
        query = { $text: { $search: filters["organisation"] } };
      } else if ("userId" in filters) {
        query = { userId: { $eq: filters["userId"] } };
      } else if ("exact" in filters) {
        query = { organisation: { $eq: filters["organisation"] } };
      }
    }
    // Get all referrals with the specified query
    let cursor;
    try {
      console.log("Referrals: ", referrals);
      cursor = await referrals.find(query);
    } catch (e) {
      console.log("Referrals failed: ", referrals);
      console.error(`Unable to issue find command, ${e}`);
      return { referralsList: [], totalNumReferrals: 0 };
    }
    // added here
    const displayCursor = await cursor
      .limit(referralsPerPage)
      .skip(referralsPerPage * page);

    try {
      const referralsList = await displayCursor.toArray();
      const totalNumReferrals = await referrals.countDocuments(query);

      return { referralsList, totalNumReferrals };
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents, ${e}`
      );
      return { referralsList: [], totalNumReferrals: 0 };
    }
  }

  static async addReferral(
    userId,
    organisation,
    code,
    url,
    description,
    date,
    expiryDate
  ) {
    try {
      const referralDoc = {
        userId: userId,
        organisation: organisation,
        code: code,
        url: url,
        description: description,
        date: date,
        expiryDate: expiryDate,
        approvals: [],
      };
      return await referrals.insertOne(referralDoc);
    } catch (e) {
      console.error(`Unable to post referral: ${e}`);
      return { error: e };
    }
  }

  static async updateReferral(
    userId,
    organisation,
    code,
    url,
    description,
    date,
    expiryDate
  ) {
    try {
      return await referrals.updateOne(
        { userId: userId },
        {
          $set: {
            organisation: organisation,
            code: code,
            url: url,
            description: description,
            date: date,
            expiryDate: expiryDate,
          },
        }
      );
    } catch (e) {
      console.error(`Unable to update referral: ${e}`);
      return { error: e };
    }
  }

  static async likeReferral(userId, id) {
    try {
      return await referrals.updateOne(
        { _id: new ObjectId(id) },
        {
          $addToSet: {
            approvals: userId,
          },
        }
      );
    } catch (e) {
      console.error(`Unable to update referral: ${e}`);
      return { error: e };
    }
  }

  static async unlikeReferral(userId, id) {
    try {
      return await referrals.updateOne(
        { _id: new ObjectId(id) },
        {
          $pull: {
            approvals: userId,
          },
        }
      );
    } catch (e) {
      console.error(`Unable to update referral: ${e}`);
      return { error: e };
    }
  }

  static async deleteReferral(userId, _id) {
    try {
      const deleteResponse = await referrals.deleteOne({
        userId: userId,
        _id: new ObjectId(_id),
      });

      return deleteResponse;
    } catch (e) {
      console.error(`Unable to delete referral: ${e}`);
      return { error: e };
    }
  }
}
