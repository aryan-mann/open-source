import * as fs from "fs";
import fetch from "node-fetch";

const response = await fetch("https://api.cdnjs.com/libraries", { method: "GET" });
const data = await response.json();
const libraries = data["results"];

let output = {};
for(let x of libraries) {
  output[x.name] = x.latest;
}

fs.writeFileSync("./src/CDNs.json", JSON.stringify(output), { encoding: "utf-8" });