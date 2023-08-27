class APIFeatures {
  constructor(queryString) {
    this.query = {};
    this.queryString = queryString;
  }

  filter() {
    // 1A) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    this.query = {
      where: {
        ...queryObj,
      },
    };

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortFields = this.queryString.sort.split(",");
      sortFields = sortFields.map((f) =>
        f.startsWith("-") ? [f.slice(1), "DESC"] : [f, "ASC"]
      );
      this.query.order = sortFields;
    } else {
      this.query.order = [["createdAt", "DESC"]];
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",");
      this.query.attributes = fields;
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    let limit = this.queryString.limit * 1 || 10;
    const offset = (page - 1) * limit;
    if (limit > 10 || limit < 1) {
      limit = 10;
    }
    this.query.offset = offset;
    this.query.limit = limit;
    return this;
  }
}

module.exports = APIFeatures;
