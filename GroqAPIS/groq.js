import Groq from "groq-sdk";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
export default async function generateGroqCompletion(
  prompt = "Hello",
  model = "llama3-groq-70b-8192-tool-use-preview",
  systemInstructions = `
-Always structure the answer and style it on html, good colors ,text colors, colors depending on the case, good fonts , and large font size, and choose dark mode (but do not use a lot of black backgrounds) style or light depending on the case, the mode must be seen on backgrounds and styles , the content must be vertical so do not write many block elements, return that html as output;
-pay attention the UI mode must be opposite of text mode if not : so the text will not be seen;
-the html must be a div that centers its content, put text in center only when it is good, else if only for sub-titles do not;
-the html must behave as a simple website , the content is vertical not horizontal;
-if the generated html includes images: do not set "src" attribute, only add the "alt" attribute (each image set for it an appropriate "alt" value, "alt" must be tokens that can we use as a query on image providers serching) ,and set the attribute : searchImage="true" , and on that case of adding images : add a script tag on the generated html , with src attribute : src="searchImage.js", then add another script tag that calls the function : searchImage();
- do not add images except if important, if added , use img tags for them;`
) {
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemInstructions,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model,
    temperature: 0.5,
    max_tokens: 7000,
    top_p: 0.65,
    stream: false,
    stop: null,
  });
  const generatedContent = response.choices[0]?.message?.content || "";
  console.log(generatedContent);
  return generatedContent;
}
