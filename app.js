import http from "http";
import url from "url";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
const nonce = crypto.randomBytes(16).toString("base64");
import searchImage from "./Images/searchImage.js";
import generateGroqCompletion from "./GroqAPIS/groq.js";
import indexHTML from "./indexHTML.js";
const publicDir = import.meta.dirname;
const PORT = process.env.PORT || 3000;
const app = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") {
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    if (
      req.url === "/" ||
      ["/icons", "/styles", "/scripts", "/myModules"].some((e) =>
        req.url.startsWith(e)
      )
    ) {
      const filePath = req.url === "/" ? indexHTML(nonce) : req.url;
      const extname = path.extname(filePath);
      let contentType = "text/html";
      switch (extname) {
        case ".js":
          contentType = "text/javascript";
          break;
        case ".css":
          contentType = "text/css";
          break;
        case ".json":
          contentType = "application/json";
          break;
        case ".png":
          contentType = "image/png";
          break;
        case ".jpg":
          contentType = "image/jpg";
          break;
        case ".ico":
          contentType = "image/x-icon";
          break;
        default:
          contentType = "text/html";
      }
      try {
        await fs.access(filePath);
        const content = await fs.readFile(filePath);
        res.writeHead(200, { "Content-Type": contentType });
        res.end(content, "utf8");
      } catch (e) {
        console.log(e);
      }
    } else if (req.url === "/generate" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk.toString()));
      req.on("end", async () => {
        const { userPrompt } = JSON.parse(body);
        let generatedContent = await generateGroqCompletion(userPrompt);
        res.writeHead(200, { "Content-Type": "text/html" });
        generatedContent = generatedContent.replaceAll(
          "<script>",
          `<script nonce="${nonce}">`
        );

        res.end(generatedContent);
      });
    } else if (req.url.startsWith("/images/?token=")) {
      const { token } = url.parse(req.url, true).query;
      const { srcs } = await searchImage("pixabay", token);
      const src = srcs[Math.floor(Math.random() * srcs.length)];
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end(src);
    } else {
      res.writeHead(404);
      res.end("Not Found , Error 404");
    }
  } catch (e) {
    console.log(e);

    res.writeHead(504);
    res.end("Internal Server Error 504");
  }
});
app.listen(PORT, () => console.log("Server is running"));
