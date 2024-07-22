const CrUX = {};

const queryCruxApi = async (queryOptions, retryCounter = 1) => {
  CrUX.API_KEY = process.env.API_KEY || "no-key";
  CrUX.METHOD =
    queryOptions.method === "history" ? "queryHistoryRecord" : "queryRecord";
  try {
    const res = await fetch(
      `https://chromeuxreport.googleapis.com/v1/records:${CrUX.METHOD}?key=${CrUX.API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify(queryOptions.body),
      }
    );
    if (res.status >= 500)
      throw new Error(`Invalid CrUX API status: ${res.status}`);

    const json = await res.json();
    const { error } = json;
    if (json && json.error) {
      const { error } = json;
      if (error.code === 404) return null;
      if (error.code === 429)
        return retryAfterTimeout(retryCounter, () =>
          queryCruxApi(queryOptions, retryCounter + 1)
        );
      throw new Error(JSON.stringify(error));
    }

    return json;
  } catch (error) {
    res.status(error.code).send(error.message);
  }
};

const crux = async (req, res) => {
  const { method, ...query } = req.body;
  console.log("req body => ", { method, query });
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
