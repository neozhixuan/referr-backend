import ReferralsDAO from "../dao/referralDAO.js";

// Basically use the requests, get info from DAO, and return a response
export default class ReferralsController {
  static async apiGetReferrals(req, res, next) {
    let retryCount = 0;
    let referralsList = [];
    let totalNumReferrals = 0;

    const maxRetries = 5;
    const retryDelay = 500; // milliseconds
    // Check if we have defined the number of referrals per page
    const referralsPerPage = req.query.referralsPerPage
      ? // The 10 is the radix input (convert string to int)
        parseInt(req.query.referralsPerPage, 10)
      : 10;
    const page = req.query.page ? parseInt(req.query.page, 10) : 0;

    let filters = {};
    if (req.query.organisation) {
      filters.organisation = req.query.organisation;
    } else if (req.query.userId) {
      filters.userId = req.query.userId;
    } else if (req.query.exact) {
      filters.exact = req.query.exact;
    }

    async function callAPI() {
      const response = await ReferralsDAO.getReferrals({
        filters,
        page,
        referralsPerPage,
      });
      referralsList = response.referralsList;
      totalNumReferrals = response.totalNumReferrals;
    }

    async function retryAPICall() {
      while (referralsList.length === 0 && retryCount < maxRetries) {
        await callAPI();

        if (referralsList.length === 0) {
          retryCount++;
          await delay(retryDelay);
        }
      }
    }

    function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    retryAPICall();

    let response = {
      referrals: referralsList,
      page: page,
      filters: filters,
      entries_per_page: referralsPerPage,
      total_results: totalNumReferrals,
    };

    res.json(response);
  }

  static async apiPostReferral(req, res, next) {
    try {
      const userId = req.body.userId;
      const organisation = req.body.organisation;
      const code = req.body.code;
      const url = req.body.url;
      const description = req.body.description;
      const date = new Date();
      const expiryDate = req.body.expiryDate;

      const ReferralResponse = await ReferralsDAO.addReferral(
        userId,
        organisation,
        code,
        url,
        description,
        date,
        expiryDate
      );
      res.json({ status: "success" });
    } catch (e) {
      console.error(`Unable to post referral: ${e}`);
      res.status(500).json({ error: e.message });
    }
  }

  static async apiUpdateReferral(req, res, next) {
    try {
      const userId = req.body.userId;
      const organisation = req.body.organisation;
      const code = req.body.code;
      const url = req.body.url;
      const description = req.body.description;
      const date = new Date();
      const expiryDate = req.body.expiryDate;

      const ReferralResponse = await ReferralsDAO.updateReferral(
        userId,
        organisation,
        code,
        url,
        description,
        date,
        expiryDate
      );
      var { error } = ReferralResponse;
      if (error) {
        res.status(400).json({ error });
      }

      if (ReferralResponse.modifiedCount === 0) {
        throw new Error(
          "unable to update review - user may not be original poster"
        );
      }

      res.json({ status: "success" });
    } catch (e) {
      console.dir(e);
      res.status(500).json({ error: e.message });
    }
  }
  static async apiDeleteReview(req, res, next) {
    try {
      const userId = req.body.userId;
      const _id = req.body._id;
      const reviewResponse = await ReferralsDAO.deleteReferral(userId, _id);
      // var { error } = reviewResponse;
      // if (error) {
      //   res.status(400).json({ error });
      // }
      res.json({ status: "success" });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  }

  static async apiLikeReferral(req, res, next) {
    try {
      const userId = req.body.userId;
      const id = req.body.id;
      const like = req.body.like;
      let ReferralResponse = await ReferralsDAO.unlikeReferral(userId, id);
      if (like) {
        ReferralResponse = await ReferralsDAO.likeReferral(userId, id);
      }
      const { error } = ReferralResponse;
      if (error) {
        return res.status(400).json({ error });
      }
      return res.json({ status: "success" });
    } catch (e) {
      console.log("internal error");
      console.dir(e); // print on server console
      return res.status(500).json({ message: "Internal error", error: e }); // not needed, only if you need in client side
    }
  }
}
