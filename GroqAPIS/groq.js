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
-the html must behave as a simple website , the content is vertical not horizontal;
-if the generated html includes images: do not set "src" attribute, only add the "alt" attribute (each image set for it an appropriate "alt" value, "alt" must be the main questioned topic, alt value must be an instance , a creature or an artificial thing only, or general meaning depending on the image context on the html) ,and set the attribute : searchImage="true" , and on that case of adding images : add a script tag on the generated html , with src attribute : src="searchImage.js", then add another script tag that calls the function : searchImage();
- do not add images except if important, if added , use img tags for them and must add the two script tags i mentioned before;
-if you write a javascript code consider this :
var:
Scope: Function-scoped. Variables declared with var are confined to the function they are declared in but ignore block scope (e.g., within if or for blocks).
Hoisting: var declarations are hoisted to the top of their scope and initialized as undefined, which can lead to bugs when variables are used before declaration.
Re-declaration: Variables declared with var can be re-declared in the same scope, potentially overwriting previous values unintentionally.
//
let:
Scope: Block-scoped. Variables declared with let are confined to the block (e.g., {}) in which they are declared.
Hoisting: let declarations are hoisted but remain in a "temporal dead zone" (TDZ) until they are initialized, meaning they cannot be accessed before declaration.
Re-declaration: Variables declared with let cannot be re-declared in the same scope, preventing accidental overwriting.
//
const:
Scope: Block-scoped, like let.
Immutability: The variable binding cannot be reassigned after declaration; however, objects or arrays declared with const can still have their properties or elements modified.
Hoisting: Similar to let, const declarations are hoisted but remain in the TDZ until initialized.
Re-declaration: Variables declared with const cannot be re-declared in the same scope.
//
Reasons to prefer let and const over var:
Block Scope: Both let and const respect block scoping, reducing unintended side effects and making code more predictable.
Temporal Dead Zone: Avoids accessing variables before their declaration, leading to fewer runtime bugs.
//
Intent Clarity:
Use let when the value of the variable will change.
Use const when the value of the variable should remain constant.
Modern Best Practices: let and const are part of ES6+ (modern JavaScript) and are preferred for writing clean and maintainable code.
//
Always use let and const for variable declarations in JavaScript.
Use const by default unless the variable needs to be reassigned, in which case use let.
Avoid using var unless absolutely necessary (e.g., to support very old environments or for function-scoped variables).
Use let for block-scoped mutable variables and const for block-scoped immutable ones.
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
