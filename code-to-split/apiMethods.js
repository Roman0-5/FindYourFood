/*Datei um Methoden bezüglich der API zu schreiben, da vieles von Button abhängig ist
sind es nur mockups*/
const API_KEY = "";
const API_URL = "https://api.tomtom.com/search/2/";

async function searchLocation(params) {
  const defaultParams = {
    lat: 48.2082,
    lon: 16.3738,
    radius: 1000,
    limit: 10,
    countrySet: "AT",
    openingHours: "nextSevenDays",
  };
  const searchParams = {
    ...defaultParams,
    ...params,
  };

  if (!search) {
    throw new Error("Ein Suchbegriff (query) wird benötigt!");
  }

  const queryParams = new URLSearchParams();
  queryParams.append("key", API_KEY);

  Object.entries(searchParams).forEach(([key, value]) => {
    if (key !== "query" && key !== "key") {
      queryParams.append(key, value);
    }
  });
  try{
    const url = `${API_URL}search/${searchParams.query}.json?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
