import http from "http";
import url from "url";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
const nonce = crypto.randomBytes(16).toString("base64");
import searchImage from "./Images/searchImage.js";
import generateGroqCompletion from "./GroqAPIS/groq.js";
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
    if (req.url === "/" || req.url === "/icons/submit.png") {
      res.setHeader(
        "Content-Security-Policy",
        `default-src 'self'; style-src 'self' 'unsafe-inline' *; script-src 'self' 'nonce-${nonce}'; media-src *; img-src *; connect-src *`
      );
      const filePath = path.join(
        publicDir,
        req.url === "/" ? "index.html" : req.url
      );
      if (req.url === "/") {
        const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Simple AI Chatbot Generator</title>
  </head>
  <body id="bd">
    <main id="generations">
    </main>
    <div id="promptArea">
      <textarea id="userPrompt"></textarea><button id="submit"></button>
    </div>
  </body>
  <style nonce="${nonce}">
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      outline: none;
      border: none;
    }
    #bd {
      width: 100vw;
      height: 100vh;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: rgb(19, 53, 54);
    }
    #generations {
      padding: 10px 5px 55px 5px;
      width: calc(100% - 30px);
      border-inline: 3px solid rgb(51, 51, 51);
      justify-self: center;
      overflow-x: hidden;
      overflow-y: auto;
      background-color: rgb(24, 24, 24);
      scrollbar-width: 4px;
      scrollbar-color: aqua;
      display: grid;
      align-content: flex-start;
      gap: 5px;
      section {
        border-radius: 10px;
        min-height: 50px;
        font-size: large;
        font-weight: 500;
        text-indent: 10px;
        padding: 10px;
        overflow:auto;
      }
      .user {
        background-color: rgb(77, 156, 136);
        width: calc(100% - 30px);
        justify-self: flex-end;
      }
      .ai {
        background-color: rgb(0, 51, 38);
        width: 100%;
        justify-self: flex-start;
        img{
          object-fit:contain;
          width:100%;
        }
        pre{
          text-wrap-mode:wrap;
        }
      }
    }
    #promptArea {
      display: flex;
      align-items: center;
      justify-content: space-evenly;
      background-color: rgb(57, 87, 77);
      position: fixed;
      bottom: 0;
      right: 0;
      left: 0;
      #userPrompt {
        resize: none;
        border-radius: 20px;
        border: 1px solid rgb(61, 61, 61);
        width: calc(100% - 60px);
        height: calc(100% - 10px);
        text-indent: 10px;
        caret-color: azure;
        background-color: rgb(22, 22, 22);
        color: white;
        font-weight: bold;
        font-size: large;
      }
      #submit {
        width: 50px;
        height: 50px;
        background-color: transparent;
        background-image: url("icons/submit.png");
        background-position: center;
        background-size: contain;
        background-blend-mode: multiply;
        border-radius: 100%;
        cursor: pointer;
      }
      #submit:hover {
        background-color: rgba(255, 255, 255, 0.2);
      }
    }
  </style>
  <script nonce="${nonce}">
    const generations = document.getElementById("generations");
    const userPrompt = document.getElementById("userPrompt");
    const submit = document.getElementById("submit");
    submit.onclick = async () => {
      console.log(userPrompt.value.trim(), userPrompt.value.trim().length);

      if (userPrompt.value.trim() && userPrompt.value.trim().length) {
        try {
          const generation = await generate(userPrompt.value);
        } catch (e) {
          console.log(e);
        }
      }
    };
    function addChat(content, type) {
      const section=document.createElement("section");
      section.className=type;
      section.innerHTML=content;
      generations.insertAdjacentElement("beforeend", section);
      if (type === "user") {userPrompt.value = "";}else{return section;}
    }
    async function generate(userPrompt) {
      addChat(userPrompt, "user");
      const resp = await fetch("/generate", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ userPrompt }),
      });
      const generatedResponse = await resp.text();
      const section=addChat(generatedResponse||"", "ai");
      const images = Array.from(section.querySelectorAll("img[alt]"));
      if (images.length > 0) {
        images.forEach(async (img) => {
          img.parentElement.style.display="flex";
          img.parentElement.style.flexDirection="column";
          img.parentElement.style.alignItems="center";
          img.parentElement.style.justifyContent="center";
          img.parentElement.style.gap="3px";
          const resp = await fetch("/images/?token=" + img.alt);
          img.src= await resp.text();
        });
      }
    }
  </script>
</html>
`;
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(html);
      } else {
        const content = await fs.readFile(filePath);
        res.writeHead(200, {
          "Content-Type": !filePath.includes("favicon")
            ? "image/png"
            : "image/x-icon",
        });

        res.end(content, "utf8");
      }
    } else if (req.url === "/generate" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => (body += chunk.toString()));
      req.on("end", async () => {
        const { userPrompt } = JSON.parse(body);
        let generatedContent = await generateGroqCompletion(userPrompt);
        res.writeHead(200, { "Content-Type": "text/html" });
        generatedContent = generatedContent.replaceAll(
          "<script",
          `<script nonce="${nonce}"`
        );
        generatedContent = generatedContent.replaceAll(
          "<style",
          `<style nonce="${nonce}"`
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
