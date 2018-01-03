import contentRange from "content-range";

function getInfo(req, res) {
  let totalCount = res.headers["x-total-count"];

  // total number of results
  let resultsTotal = totalCount;
  // total number of filtered results
  let filteredTotal = resultsTotal;
  // current page
  let currentPage = req.page; //Math.ceil(parsedRange.length);
  // total pages
  let pagesTotal = Math.ceil(resultsTotal / 30);

  // the page size
  let pageSize = res.data.length;

  // Compute all page cursors
  let allPages = [];
  for (let i = 0; i < pagesTotal; i++) {
    allPages[i] = `${i + 1}`; // We return string, so that the page will be preserved in the path query
  }

  return {
    type: "numbered",
    allPages,
    currentPage,
    resultsTotal,
    filteredTotal
  };
}

export default function numberedPagination(next) {
  return {
    read: req =>
      next.read(req).then(res => {
        const paginationDescriptor = getInfo(req, res);
        res.data.pagination = paginationDescriptor;
        return res;
      })
  };
}
