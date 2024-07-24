const CrUX = {};

const normalizeUrl = (url) => {
  const u = new URL(url);
  return u.origin + u.pathname;
};

const queryCruxApi = async (queryOptions, retryCounter = 1) => {
  CrUX.API_KEY = process.env.API_KEY || "no-key";
  CrUX.METHOD =
    queryOptions.method === "history" ? "queryHistoryRecord" : "queryRecord";

  const { urls } = queryOptions.body;
  console.log("urls =>", urls);

  const promises = urls.map((url) => {
    return new Promise(async (resolve, reject) => {
      try {
        const normalizedUrl = normalizeUrl(url);
        const res = await fetch(
          `https://chromeuxreport.googleapis.com/v1/records:${CrUX.METHOD}?key=${CrUX.API_KEY}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
              url: normalizedUrl,
              metrics: queryOptions.body.metrics,
            }),
          }
        );
        if (res.status >= 500) reject(`Invalid CrUX API status: ${res.status}`);

        const json = await res.json();
        console.log("error =>", res);
        const { error } = json;
        if (json && json.error) {
          const { error } = json;
          if (error.status === 404) return null;
          if (error.status === 429)
            return retryAfterTimeout(retryCounter, () =>
              queryCruxApi(queryOptions, retryCounter + 1)
            );
          reject(JSON.stringify(error));
        }

        resolve(json);
      } catch (error) {
        reject(error);
      }
    });
  });

  const responses = await Promise.allSettled(promises);
  return responses;
};

const crux = async (req, res) => {
  const { method, ...query } = req.body;
  const queryObject = {
    method,
    body: query,
  };

  const response = await queryCruxApi(queryObject);
  res.send(response);
};

async function retryAfterTimeout(retryCounter, request) {
  if (retryCounter <= maxRetries) {
    const timeout = Math.floor(Math.random() * maxRetryTimeout) + 1;
    await new Promise((resolve) => setTimeout(resolve, timeout));
    return request();
  } else {
    throw new Error("Max retries reached");
  }
}

module.exports = crux;
