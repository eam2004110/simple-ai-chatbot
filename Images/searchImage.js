export default async function searchImage(
  name = "pixabay",
  token,
  pagesNum,
  pageNum = 1
) {
  switch (name) {
    case "pixabay":
      return (async () => {
        pageNum = !(
          pageNum &&
          typeof pageNum == "number" &&
          !Number.isNaN(pageNum)
        )
          ? pagesNum && typeof pagesNum == "number" && !Number.isNaN(pagesNum)
            ? Math.floor(Math.random() * (pagesNum + 1))
            : 1
          : pageNum;
        const API = () => {
          const APIS = process.env.SCRAPERAPI_APIS.split("|");
          return APIS[Math.floor(Math.random() * APIS.length)];
        };
        const pixabayURL =
          "https://pixabay.com/images/search/" + token + "/?pagi=" + pageNum;
        //render contain nodejs app that will fetch the url to the scraperapi and returns the html
        let resp = await fetch(
          `http://api.scraperapi.com/?api_key=${API()}&url=${pixabayURL}&country_code=eu`
        );
        let data = await resp.text();
        if (
          !(
            (pageNum && typeof pageNum == "number" && !Number.isNaN(pageNum)) ||
            (pagesNum && typeof pagesNum == "number" && !Number.isNaN(pagesNum))
          )
        ) {
          let parser = new DOMParser();
          let doc = parser.parseFromString(data, "text/html");
          pagesNum = Number(
            doc.querySelector("input[class^='pageInput'][type='number']")
              .parentElement.childNodes[2].data
          );
          doc = parser = null;
        }
        resp = null;
        const urls = [""];
        data = data.split("");
        for (let i = 0; i < data.length; i++) {
          if (
            "https://cdn.pixabay.com/photo/" == data.slice(i, i + 30).join("")
          ) {
            urls.push("https://cdn.pixabay.com/photo/");
            i += 29;
          } else if (
            urls[urls.length - 1].startsWith(
              "https://cdn.pixabay.com/photo/"
            ) &&
            !urls[urls.length - 1].endsWith(".jpg") &&
            data.slice(i, i + 4).join("") !== ".jpg"
          ) {
            if (data[i] !== ".") {
              urls[urls.length - 1] += data[i];
            } else {
              urls.pop();
            }
          } else if (
            urls[urls.length - 1].startsWith(
              "https://cdn.pixabay.com/photo/"
            ) &&
            !urls[urls.length - 1].endsWith(".jpg") &&
            data.slice(i, i + 4).join("") == ".jpg"
          ) {
            urls[urls.length - 1] += ".jpg";
            i += 3;
          }
        }
        return { srcs: urls, pagesNum, pageNum };
      })();
  }
}
