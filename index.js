const fs = require("fs");

// tokenizer
const tokenizer = (input) => {
  let tokens = [];
  let current = 0;

  // Add the semicolon to the end of the input if one was not provided
  // Then add whitespace to the end of the input to indicate the end of the code
  if (input[input.length - 1] === ";") {
    input += " ";
  } else {
    input = input + "; ";
  }

  while (current < input.length - 1) {
    // We get the current character first
    const currentChar = input[current];

    // Now, we test for the types of each character.
    // We check for Whitespaces first
    // Regex to check for whitespace
    const WHITESPACE = /\s+/;
    if (WHITESPACE.test(currentChar)) {
      // If the current character is a whitespace, we skip over it.
      current++; // Go to the next character
      continue; // Skip everything and go to the next iteration
    }

    // We need semicolons They tell us that we are at the end.
    // We check for semicolons now and also if the semicolon is at the last but one position
    // We only need the semicolons at the end. Any other position means there
    // An error
    if (currentChar === ";" && currentChar === input[input.length - 2]) {
      // If the current character is a semicolon, we create a `token`
      let token = {
        type: "semi",
        value: ";",
      };

      // then add it to the `tokens` array
      tokens.push(token);
      current++; // Go to the next character
      continue; // Skip everything and go to the next iteration
    }

    // Now we will check for Numbers
    const NUMBER = /^[0-9]+$/; // Regex to check if character is a number
    // If we use the same method above for the semicolons,
    // We create a number `token` and add it to `tokens`, we end up with a token for
    // each single number character instead of the number as a whole.
    // For example, if we have a number value of `123`, then our tokens will be
    //
    // [
    //   { type: 'number', value: 1 },
    //   { type: 'number', value: 2 },
    //   { type: 'number', value: 3 },
    // ]
    //
    // Instead of
    //
    // [
    //   { type: 'number', value: 123 },
    // ]
    // which we don't want.
    // So we create a `number` variable and check if the next character is a number.
    // If the next character is a number, we add it to the `number` variable
    // Then add the `number` variable's value as the value in our `token`
    // The add the `token` to our `tokens` array
    if (NUMBER.test(currentChar)) {
      let number = "";

      // Check if the next character is a number
      while (NUMBER.test(input[current++])) {
        number += input[current - 1]; // Add the character to `number`
      }

      // Create a token with type number
      let token = {
        type: "number",
        value: parseInt(number), // `number` is a string to we convert it to an integer
      };

      tokens.push(token); // Add the `token` to `tokens` array
      continue;
    }

    // Check if character is a string
    if (currentChar === '"') {
      // If the current character is a quote, that means we have a string
      // Initialize an empty strings variable
      let strings = "";

      // Check if the next character is not a quote
      while (input[++current] !== '"') {
        // If it is not a quote, it means we still have a string
        strings += input[current]; // Add it to the `strings` variable
      }

      // Create a token with property type string and a value with the `strings` value
      let token = {
        type: "string",
        value: strings,
      };

      tokens.push(token); // Add the `token` to the `tokens` array
      current++;
      continue;
    }

    // Check if the character is a letter
    const LETTER = /[a-zA-Z]/; // Regex to check if it is a letter
    if (LETTER.test(currentChar)) {
      // If the current character is a letter we add it to a `letters` variable
      let letters = currentChar;

      // Check if the next character is also a letter
      while (LETTER.test(input[++current])) {
        // We add it to the `letters` variable if it is
        letters += input[current];
      }

      // At this point, we have a value for our `letters` so we check for thier types.
      //
      // We first check if the `letters` is `set` or `define` and we assign the `token` a type `keyword`
      if (letters === "set" || letters === "define") {
        // Add a `token` to the `tokens` array
        tokens.push({
          type: "keyword",
          value: letters,
        });

        continue; // We are done. Start the loop all over again
      }

      // If the letter is `null`, assign the `token` a type `null`
      if (letters === "null") {
        tokens.push({
          type: "null",
          value: letters,
        });
        continue;
      }

      // If the letter is `null`, assign the `token` a type `ident`
      if (letters === "as") {
        tokens.push({
          type: "ident",
          value: letters,
        });
        continue;
      }

      // If the letter is `true` or `false`, assign the `token` a type `boolean`
      if (letters === "true" || letters === "false") {
        tokens.push({
          type: "boolean",
          value: letters,
        });
        continue;
      }

      // If we don't know the `letters`, it is the variable name.
      // Assign the `token` a type `name`
      tokens.push({
        type: "name",
        value: letters,
      });

      continue; // Start the loop again
    }

    // If the character reaches this point, then its not valid so we throw a TypeError
    // with the character and location else we will be stuck in an infinite loop
    throw new TypeError("Unknown Character: " + currentChar + " " + current);
  }

  // Return the `tokens` from the `tokenizer`
  return tokens;
};

// Testing the tokenizer
const tokens = tokenizer("set age as 18;");
// Expected output
// [
//   { type: 'keyword', value: 'set' },
//   { type: 'name', value: 'age' },
//   { type: 'ident', value: 'as' },
//   { type: 'number', value: 18 },
//   { type: 'semi', value: ';' }
// ]
const tokens1 = tokenizer("set isEmployed as false");
// Expected output
// [
//   { type: 'keyword', value: 'set' },
//   { type: 'name', value: 'isEmployed' },
//   { type: 'ident', value: 'as' },
//   { type: 'boolean', value: 'false' },
//   { type: 'semi', value: ';' }
// ]

// parser
const parser = (tokens) => {
  // We will declare a `current` variable to get the current `token`
  let current = 0;

  // Then our parser will have a walk function
  const walk = () => {
    // Get the current `token` with the `current` variable
    let token = tokens[current];

    // From here, we will check for the `type` of each token and return a node.
    if (token.type === "number") {
      // Our token is a `number`,
      // We increase the current counter
      current++;
      // We create a type `NumberLiteral` and the value as the token's `value`
      let astNode = {
        type: "NumberLiteral",
        value: token.value,
      };

      // We return the node
      return astNode;
    }

    // We will take the same steps for the `boolean`, `null` and `string` token types
    // Check the value, Increment the counter, return a new node
    // Check for a string token
    if (token.type === "string") {
      current++;
      let astNode = {
        type: "StringLiteral",
        value: token.value,
      };
      return astNode;
    }

    // Check for boolean token
    if (token.type === "boolean") {
      current++;
      let astNode = {
        type: "BooleanLiteral",
        value: token.value,
      };
      return astNode;
    }

    // Check for null token
    if (token.type === "null") {
      current++;
      let astNode = {
        type: "NullLiteral",
        value: token.value,
      };
      return astNode;
    }

    // We now check for the `keyword` token type
    // The presence of a `keyword` token type indicates that we are declaring a variable,
    // So the AST node won't be the same as that of `number` or `string`.
    // The node will have a `type` property of `VariableDeclaration`, `kind` property of the keyword
    // and a `declarations` property which is an array for all the declarations
    if (token.type === "keyword") {
      // New AST Node for  `keyword`
      let astNode = {
        type: "VariableDeclaration",
        kind: token.value, // The keyword used. `set` or `define`
        declarations: [], // all the variable declarations.
      };

      // At this stage, we don't need the `keyword` token again. It's value has been used at the astNode.
      // So we increase the current and get the next token
      // Obviously the next one will be the `name` token and we will call the `walk` function again
      // which will have a token type of `name` now and the returned results will be pushed into
      // the declarations array

      token = tokens[++current]; // Increase the `current` token counter and get the next token.

      // Check if there is a token and the next token is not a semicolon
      while (token && token.type !== "semi") {
        // if the token is not a semicolon, we add the result of `walk` again into
        // the AST Node `declarations` array
        astNode.declarations.push(walk());

        // We then go to the next token
        token = tokens[current];
      }

      // From here, we don't need the semicolon again, so we remove it from the
      // `tokens` array
      tokens = tokens.filter((token) => token.type !== "semi");

      // Then we return the AST Node
      return astNode;
    }

    // The last is the `name` token type
    // The `name` token type will have a node of type `VariableDeclarator` and an
    // `id` which will also be a another node with type `Identifier` and an
    // `init` with the type of the value.
    // If the token type is a name, we will increse `current` by two to skip the next value after
    // `name` which is `ident` and we don't need it.
    if (token.type === "name") {
      current += 2; // Increase by 2 to skip `ident`

      // Declare a new AST Node and recursively call the `walk` function again
      // Which the result will be placed in the `init` property
      let astNode = {
        type: "VariableDeclarator",
        id: {
          type: "Identifier",
          name: token.value,
        },
        init: walk(), // Call `walk` to return another AST Node and the result is assigned to `init`
      };

      // Return the AST Node
      return astNode;
    }

    // We throw an error again for an unknown type
    throw new Error(token.type);
  };

  // We will now declare our AST. We have been building the nodes,
  // so we have to join the AST as one.
  // The type of the AST will be `Program` which will indicate the start of the code
  // And a `body` property which will be an array that will contain all the other AST we have generated.
  let ast = {
    type: "Program",
    body: [],
  };

  // We then check if there are token's in the `tokens` array and add thier Node to the main AST
  while (current < tokens.length) {
    ast.body.push(walk());
  }

  // Final return of the parse function.
  return ast;
};

// traverser
const traverser = (ast, visitor) => {
  // `traverseArray` function will allow us to iterate over an array of nodes and
  // call the `traverseNode` function
  const traverseArray = (array, parent) => {
    array.forEach((child) => {
      traverseNode(child, parent);
    });
  };

  // In the `traverseNode`, will get the  node `type` object and call the `enter`
  // method if the object is present
  // Then recursively call the `traverseNode` again on every child node
  const traverseNode = (node, parser) => {
    // Get the node object on the visitor passed to the `traverser`
    let objects = visitor[node.type];

    // Check if the node type object is present and call the enter method
    // with the node and the parent
    if (objects && objects.enter) {
      methods.enter(node, parent);
    }

    // At this point, we will call the `traverseNode` and `traverseArray` methods recursively
    // based on each of the given node types
    switch (node.type) {
      // We'll start with our top level `Program` and call the `traverseArray`
      // on the `body` property to call each node in the array with  `traverseNode`
      case "Program":
        traverseArray(node.body, node);
        break;

      //We do the same to `VariableDeclaration` and traverse the `declarations`
      case "VariableDeclaration":
        traverseArray(node.declarations, node);
        break;

      // Next is the `VariableDecalarator`. We traverse the `init`
      case "VariableDeclarator":
        traverseNode(node.init, node);
        break;

      // The remaining types don't have any child nodes so we just break
      case "NumberLiteral":
      case "StringLiteral":
      case "NullLiteral":
      case "BooleanLiteral":
        break;

      // We throw an error if we don't know the `type`
      default:
        throw new TypeError(node.type);
    }
  };

  // We now start the `traverser` with a call to the `traverseNode` with the
  // `ast` and null, since the ast does not have a parent node.
  traverseNode(ast, null);
};

// transformer
const transformer = (ast) => {
  // We will start by creating the `visitor` object
  const visitor = {
    // Then we will create the `VariableDeclaration` object in the `visitor`
    VariableDeclaration: {
      // Here, we will have the `enter` method which will take the `node` and the `parent`
      // Although we won't use the parent (Simplicity)
      enter(node, parent) {
        // Check if the VariableDeclaration has a `kind` property
        // If it has, we change based on the previous one
        // `set` -> `let`
        // `define` -> `const`
        if (node.kind) {
          if (node.kind === "set") {
            node.kind = "let"; // Set it to `let`
          } else {
            node.kind = "const";
          }
        }
      },
    },
  };

  // some example visitors below
  let visitor2 = {
    // Multiply every number by 2
    NumberLiteral: {
      enter(node) {
        if (typeof node.value === "number") {
          node.value *= 2;
        }
      },
    },
  };

  let visitor3 = {
    // Uppercase every string value
    StringLiteral: {
      enter(node) {
        if (typeof node.value === "string") {
          node.value = node.value.toUpperCase();
        }
      },
    },
  };

  // We will call the `traverser` with the `ast` and the `visitor`
  traverser(ast, visitor);

  // Finally we return the AST, which has been modified now.
  return ast;
};

// generator
const generator = (ast) => {
  // Let's break things down by the `type` of the `node`.
  // Starting with the smaller nodes to the larger ones
  switch (node.type) {
    // If our node `type` is either `NumberLiteral`,`BooleanLiteral` or `NullLiteral`
    // we just return the value at that `node`.
    case "NumberLiteral":
    case "BooleanLiteral":
    case "NullLiteral":
      return node.value; // 18

    // For a `StringLiteral`, we need to return the value with quotes
    case "StringLiteral":
      return `"${node.value}"`;

    // For an `Identifier`, we return the `node`'s name
    case "Identifier":
      return node.name; // age

    // A `VariableDeclarator` has two more `node`'s so we will call the `generator`
    // recursively on the `id` and `init` which in turn will return a value.
    // `id` will be called with the `generator` with type `Identifier` which will return a name
    // `init` will be called with the `generator` with any of the Literals and will also return a value.
    // We then return the results of these values from the VariableDeclarator
    case "VariableDeclarator":
      return (
        generator(node.id) + // age
        " = " +
        generator(node.init) + // 18
        ";"
      ); // age = 18;

    // For `VariableDeclaration`,
    // We will map the `generator` on each `node` in the `declarations`
    // The `declarations` will have the `VariableDeclarator` which in turn has `id` and `init`
    // which when the generator is called on will return a value
    // In total, we will return the `kind` of node with
    // a joined string of what we had from mapping the declarations
    case "VariableDeclaration":
      return (
        node.kind + // let
        " " +
        node.declarations.map(generator).join(" ") // age = 18
      ); // let age = 18;

    // If we have a `Program` node. We will map through each node in the `body`
    // and run them through the `generator` and join them with a newline.
    case "Program":
      return node.body.map(generator).join("\n"); // let age = 18;

    //  We'll throw an error if we don't know the node
    default:
      throw new TypeError(node.type);
  }
};

// compiler
const compiler = (code) => {
  // Take the code and convert it into token
  const token = tokenizer(code);

  // Take the tokens and parse the into an AST
  const ast = parser(tokens);

  // Modify the ast into a new one
  const mast = transformer(ast);

  // Generate the code from the modified AST
  const output = generator(mast);

  // Return the new compiled code
  return output;
};

let code = "set age as 18;";
let _code = 'define name as "Duncan"';
let __code = `
set age as 18;\n
define name as "duncan";
`;
const js = compiler(code);
const _js = compiler(_code);
const __js = compiler(__code);

console.log(js); // let age = 18;
console.log(_js); // const name = "Duncan";
console.log(__js); // let age = 18; const name = "duncan";
