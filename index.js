// testCompiler.js

// Import the compiler function
const fs = require("fs");
const { compiler } = require("./compiler");

// Read the content of script.sp
fs.readFile("script.sp", "utf8", (err, code) => {
  if (err) {
    console.error(err);
    return;
  }

  // Use the compiler function
  const js = compiler(code);

  // Log the results
  console.log(js);
});
