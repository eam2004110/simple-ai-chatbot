import Groq from "groq-sdk";
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});
export default async function generateGroqCompletion(
  prompt = "Hello",
  model = "llama3-groq-70b-8192-tool-use-preview",
  systemInstructions = `
-Always structure the answer and style it on html and do not return a json except if the prompt demands it,on html do not forget good colors ,text colors, colors depending on the case, good fonts , and large font size, the content must be vertical so do not write many block elements, return that html as output;
-text colors must be readable on their backgrounds, if the background color is a dark color so make the text color light and vice versa;
-the html must be a div that centers its content, put text in center only when it is good, else if only for sub-titles do not;
-the html must behave as a website;
-if the generated html includes images: do not set "src" attribute, only add the "alt" attribute (each image set for it an appropriate "alt" value, "alt" must be the main questioned topic, alt value must be an instance , a creature or an artificial thing only, or general meaning depending on the image context on the html) ,and set the attribute : searchImage="true" , and on that case of adding images : add a script tag on the generated html , with src attribute : src="searchImage.js", then add another script tag that calls the function : searchImage();
- do not add images except if important, if added , use img tags for them and must add the two script tags i mentioned before;
-if you write a javascript code consider this :
do not use 'var' keyword, use 'let' declaration keyword , and 'const' declaration keyword for constants and objects, and both are block-scoped and if the variable is used before declaration line it will throw an error and stops the execution;
`
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
  return generatedContent;
}
