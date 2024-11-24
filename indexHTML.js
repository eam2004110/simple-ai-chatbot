export default function indexHTML(nonce) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Simple AI Chatbot Generator</title>
  </head>
  <body id="bd">
    <script src="./myModules/randKey.js"></script>
    <script src="./myModules/WaitUntil.js"></script>
    <main id="generations"></main>
    <div id="promptArea">
      <textarea id="userPrompt"></textarea><button id="submit"></button>
    </div>
  </body>
  <style>
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
        overflow: auto;
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
        img {
          object-fit: contain;
          width: 100%;
        }
        pre {
          text-wrap-mode: wrap;
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
      let section = document.createElement("section");
      section.className = type;
      if (type === "user") {
        userPrompt.value = "";
        section.innerHTML = content;
        generations.insertAdjacentElement("beforeend", section);
        section = null;
        return ;
      }  
      try {
        section.id = randKey(40);
        let html = new DOMParser().parseFromString(content, "text/html");
        let scripts = Array.from(html.getElementsByTagName("script"))
        if(scripts.length)scripts.map(
          (s) => {
            if (scripts.length)
              try {
                const innerHTML = s.innerHTML.replace(
                  "document.querySelector(",
                  "document.querySelector(" + '"#' + section.id + " "
                );
                s.remove(
                const scri = document.createElement("script");
                scri.nonce= "${nonce}";
                scri.innerHTML = innerHTML;
                return scri;
              } catch {}
          }
        );
        let styles = Array.from(html.getElementsByTagName("style"));
        if (styles.length)
          try {
            styles.forEach((style) => {
              style.innerHTML =
                "#" + section.id + "{" + style.innerHTML + "}";
            });
          } catch {}
        section.appendChild(html);
        generations.insertAdjacentElement("beforeend", section);
        section = null;
      } catch {
        section.innerHTML = content;
        generations.insertAdjacentElement("beforeend", section);
        section = null;
      }
    }
    async function generate(userPrompt) {
      addChat(userPrompt, "user");
      const resp = await fetch("/generate", {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ userPrompt }),
      });
      const generatedResponse = await resp.text();
      const section = addChat(generatedResponse || "", "ai");
      const images = Array.from(section.querySelectorAll("img[alt]"));
      if (images.length > 0) {
        images.forEach(async (img) => {
          const resp = await fetch("/images/?token=" + img.alt);
          img.src = await resp.text();
        });
      }
    }
  </script>
</html>
`;
}
