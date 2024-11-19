export default async function scraperapi(url) {
  try {
    const URL_ = new URL(url).href;
    const APIS = env.SCRAPERAPI_APIS.split("|");
    const API = APIS[Math.floor(Math.random() * APIS.length)];
    const resp = await fetch(
      `http://api.scraperapi.com/?api_key=${API}&url=${URL_}&country_code=eu`
    );
    const data = await resp.text();
    return data;
  } catch (e) {
    return e;
  }
}
