import contentRange from "content-range";

function getInfo(data, headers) {
  let range = headers["content-range"];

  if (!range) {
    return null;
  }

  let parsedRange = contentRange.parse(range);

  // total number of results
  let resultsTotal = parsedRange.length;
  // total number of filtered results
  let filteredTotal = resultsTotal;
  // current page
  let currentPage = 1; //Math.ceil(parsedRange.length);
  // total pages
  let pagesTotal = Math.ceil(resultsTotal / 30);

  // the page size
  let pageSize = data.length;

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
        const paginationDescriptor = getInfo(res.data, res.headers);
        res.data.pagination = paginationDescriptor;
        return res;
      })
  };
}