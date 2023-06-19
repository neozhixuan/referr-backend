let organisations;

export default class orgService {
  static async injectDB(conn) {
    if (organisations) {
      // If it is already filled
      return;
    }
    try {
      // Connect and get specific collection in database
      organisations = await conn
        .useDb(process.env.REFERRALS_NS)
        .collection("Organisations");
    } catch (e) {
      console.error(
        `Unable to establish a collection handle in referralDAO: ${e}`
      );
    }
  }

  static async getOrganisations({
    // filters = null,
    page = 0,
    organisationsPerPage = 10,
  } = {}) {
    let query;
    // if (filters) {
    //   if ("name" in filters) {
    //     query = { name: filters["name"] };
    //   }
    // }
    // Get all referrals with the specified query
    // let cursor;
    // try {
    //   cursor = await organisations.find(query);
    // } catch (e) {
    //   console.error(`Unable to issue find command, ${e}`);
    //   return { organisationsList: [], totalNumOrganisations: 0 };
    // }

    const displayCursor = organisations
      .find(query)
      .limit(organisationsPerPage)
      .skip(organisationsPerPage * page);

    try {
      const organisationsList = await displayCursor.toArray();
      const totalNumOrganisations = await organisations.countDocuments(query);
      return { organisationsList, totalNumOrganisations };
    } catch (e) {
      console.error(
        `Unable to convert cursor to array or problem counting documents in org, ${e}`
      );
      return { organisationsList: [], totalNumOrganisations: 0 };
    }
  }

  static async apiGetOrganisations(req, res, next) {
    const organisationsPerPage = req.query.organisationsPerPage // The 10 is the radix input (convert string to int)
      ? parseInt(req.query.referralsPerPage, 10)
      : 10;
    const page = req.query.page ? parseInt(req.query.page, 10) : 0;

    // let filters = {};
    // if (req.query.organisation) {
    //   filters.organisation = req.query.organisation;
    // }

    const { organisationsList, totalNumOrganisations } =
      await orgService.getOrganisations({
        // filters,
        page,
        organisationsPerPage,
      });

    let response = {
      organisations: organisationsList,
      page: page,
      //   filters: filters,
      entries_per_page: organisationsPerPage,
      total_results: totalNumOrganisations,
    };

    res.json(response);
  }

  static async apiPostOrganisations(req, res, next) {
    try {
      const name = req.body.orgName;
      const imgUrl = req.body.imgUrl;
      const userId = req.body.userId;
      const date = req.body.date;
      const orgDoc = {
        name: name,
        imgUrl: imgUrl,
        userId: userId,
        date: date,
      };
      return await organisations.insertOne(orgDoc);
    } catch (e) {
      console.error(`Unable to post organisation: ${e}`);
      res.status(500).json({ error: e.message });
    }
  }
}
