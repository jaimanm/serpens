const fs = require("fs");

// Parse Roman Numerals
function parseRomanNumerals(str) {
  const romanNumerals = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let total = 0;
  let current,
    previous = 0;

  // Check if the string starts with a negative sign
  let isNegative = false;
  if (str.startsWith("-")) {
    isNegative = true;
    str = str.substring(1); // Remove the negative sign from the string
  }

  for (const char of str.split("").reverse()) {
    current = romanNumerals[char];
    if (current >= previous) {
      total += current;
    } else {
      total -= current;
    }
    previous = current;
  }

  // Apply the negative sign if necessary
  if (isNegative) {
    total *= -1;
  }

  return total;
}

// tokenizer
const tokenizer = (input) => {
  let tokens = [];
  let current = 0;
  let line = 1;
  let column = 1;

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
      if (currentChar === "\n") {
        line++;
        column = 1;
      } else {
        column++;
      }
      current++; // Go to the next character
      continue; // Skip everything and go to the next iteration
    }

    // We need semicolons. They tell us that we are at the end of a statement.
    // We check for semicolons now and add them as separate tokens.
    if (currentChar === ";") {
      // If the current character is a semicolon, we create a `token`
      let token = {
        type: "semi",
        value: ";",
        line,
        column,
      };

      // then add it to the `tokens` array
      tokens.push(token);
      current++; // Go to the next character
      column++;
      continue; // Skip everything and go to the next iteration
    }

    // Check for strings
    if (currentChar === '"') {
      let value = "";

      // Skip the opening quote
      current++;
      column++;

      while (current < input.length && input[current] !== '"') {
        value += input[current];
        current++;
        column++;
      }

      // Check for closing quote
      if (current === input.length) {
        throw new Error(`Unfinished string at line ${line} column ${column}`);
      }

      // Skip the closing quote
      current++;
      column++;

      tokens.push({
        type: "string",
        value,
        line,
        column,
      });

      continue;
    }

    // Check for parentheses
    if (currentChar === "(" || currentChar === ")") {
      tokens.push({
        type: "paren",
        value: currentChar,
        line,
        column,
      });
      current++;
      column++;
      continue;
    }

    // Check for curly braces
    if (currentChar === "{" || currentChar === "}") {
      tokens.push({
        type: "brace",
        value: currentChar,
        line,
        column,
      });
      current++;
      column++;
      continue;
    }

    // Check if the character is a negative sign
    if (currentChar === "-") {
      let nextChar = input[current + 1];
      // Check if the letters is roman numerals
      const ROMAN_NUMERAL =
        /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
      if (ROMAN_NUMERAL.test(nextChar)) {
        let romanNumeral = "-";
        // Check if the next characters are roman numerals
        while (ROMAN_NUMERAL.test(input[++current])) {
          romanNumeral += input[current]; // Add the character to `romanNumeral`
        }
        // Create a token with type number
        let token = {
          type: "number",
          value: parseRomanNumerals(romanNumeral), // `romanNumeral` is a string, so we parse it as a roman numeral
          line,
          column,
        };
        tokens.push(token); // Add the `token` to `tokens` array
        column += romanNumeral.length;
        continue;
      }
    }

    // Check if the character is a letter or an underline
    const LETTER_UNDERLINE = /[a-zA-Z_]/; // Regex to check if it is a letter or an underline
    if (LETTER_UNDERLINE.test(currentChar)) {
      // If the current character is a letter or an underline we add it to a `letters` variable
      let letters = currentChar;

      // Check if the next character is also a letter or an underline
      while (LETTER_UNDERLINE.test(input[++current])) {
        // We add it to the `letters` variable if it is
        letters += input[current];
      }

      // At this point, we have a value for our `letters` so we check for their types.
      //
      // We first check if the `letters` is a Roman numeral and we assign the `token` a type `number`
      const ROMAN_NUMERAL =
        /^(M{0,3})(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
      if (ROMAN_NUMERAL.test(letters)) {
        // Add a `token` to the `tokens` array
        tokens.push({
          type: "number",
          value: parseRomanNumerals(letters),
          line,
          column,
        });

        column += letters.length; // Update the column variable
        continue; // We are done. Start the loop all over again
      }

      // At this point, we have a value for our `letters` so we check for thier types.
      //
      // We first check if the `letters` is `dico` or `constituo` and we assign the `token` a type `keyword`
      if (
        letters === "dico" ||
        letters === "constituo" ||
        letters === "pono" ||
        letters === "dum" ||
        letters === "si"
      ) {
        // Add a `token` to the `tokens` array
        tokens.push({
          type: "keyword",
          value: letters,
          line,
          column,
        });

        column += letters.length;
        continue; // We are done. Start the loop all over again
      }

      // If the letter is `nullus`, assign the `token` a type `null`
      if (letters === "nullus") {
        tokens.push({
          type: "null",
          value: letters,
          line,
          column,
        });
        column += letters.length;
        continue;
      }

      // If the letter is `esse`, assign the `token` a type `ident`
      if (letters === "esse") {
        tokens.push({
          type: "ident",
          value: letters,
          line,
          column,
        });
        column += letters.length;
        continue;
      }

      // If the letter is `true` or `false`, assign the `token` a type `boolean`
      if (letters === "verum" || letters === "falsum") {
        tokens.push({
          type: "boolean",
          value: letters,
          line,
          column,
        });
        column += letters.length;
        continue;
      }

      // Check for operators
      const OPERATORS = [
        // NOTE: does not support >= or <=
        "sit", // is
        "nonest", // is not
        "maior", // greater
        "minor", // less
        "additum", // plus
        "detractum", // minus
        "multiplicatum", // multiplied by
        "divisum", // divided by
      ];
      if (OPERATORS.includes(letters)) {
        let operator = letters;

        tokens.push({
          type: "operator",
          value: operator,
          line,
          column,
        });
        current++;
        column += letters.length;
        continue;
      }

      // If we don't know the `letters`, it is the variable name.
      // Assign the `token` a type `name`
      tokens.push({
        type: "name",
        value: letters,
        line,
        column,
      });
      column += letters.length;
      continue; // Start the loop again
    }

    // If the character reaches this point, then its not valid so we throw a TypeError
    // with the character and location else we will be stuck in an infinite loop
    throw new TypeError(
      "Unknown Character: " +
        currentChar +
        " at line " +
        line +
        " column " +
        column
    );
  }

  // Check for unfinished strings, parentheses, or curly braces
  let stack = [];
  let stringStack = [];
  let braceStack = [];
  tokens.forEach((token) => {
    if (token.type === "paren") {
      if (token.value === "(") {
        stack.push(token);
      } else if (token.value === ")") {
        if (stack.length === 0) {
          throw new Error(
            `Unmatched closing parenthesis at line ${token.line} column ${token.column}`
          );
        }
        stack.pop();
      }
    }
    if (token.type === "string") {
      if (stringStack.length === 0) {
        stringStack.push(token);
      } else {
        stringStack.pop();
      }
    }
    if (token.type === "brace") {
      if (token.value === "{") {
        braceStack.push(token);
      } else if (token.value === "}") {
        if (braceStack.length === 0) {
          throw new Error(
            `Unmatched closing curly brace at line ${token.line} column ${token.column}`
          );
        }
        braceStack.pop();
      }
    }
  });

  if (stack.length > 0) {
    let token = stack.pop();
    throw new Error(
      `Unmatched opening parenthesis at line ${token.line} column ${token.column}`
    );
  }

  if (stringStack.length > 0) {
    let token = stringStack.pop();
    throw new Error(
      `Unfinished string at line ${token.line} column ${token.column}`
    );
  }

  if (braceStack.length > 0) {
    let token = braceStack.pop();
    throw new Error(
      `Unmatched opening curly brace at line ${token.line} column ${token.column}`
    );
  }

  // Return the `tokens` from the `tokenizer`
  return tokens;
};

// parser
const parser = (tokens) => {
  // We will declare a `current` variable to get the current `token`
  let current = 0;

  // Then our parser will have a walk function
  const walk = () => {
    // Get the current `token` with the `current` variable
    let token = tokens[current];

    if (!token) {
      throw new Error("Unexpected end of input");
    }

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
      if (token.value == "si" || token.value == "dum") {
        // Skip the 'if' token.
        token = tokens[++current];

        // The next three tokens should be the condition.
        let test = {
          type: "BinaryExpression",
          left: walk(),
          operator: tokens[current++].value,
          right: walk(),
        };
        if (!test.left || !test.right) {
          throw new Error(
            `Expected condition after ${
              token.value == "si" ? '"if"' : '"while"'
            } at line 
              ${token.line}
              column 
              ${token.column}`
          );
        }

        // The next token should be the opening curly brace.
        token = tokens[current];
        if (!token || token.type !== "brace" || token.value !== "{") {
          throw new Error(
            "Expected '{' after condition at line " +
              token.line +
              " column " +
              token.column
          );
        }

        // Skip the opening curly brace.
        token = tokens[++current];

        // The next tokens should be the body of the if statement.
        let consequent = {
          type: "BlockStatement",
          body: [],
        };
        while (token && token.type !== "brace") {
          consequent.body.push(walk());
          token = tokens[current];
        }

        // The next token should be the closing curly brace.
        if (!token || token.type !== "brace" || token.value !== "}") {
          throw new Error(
            `Expected '}' after ${
              token.value == "si" ? "if" : "while"
            } statement body at line 
              ${token.line} column 
              ${token.column}`
          );
        }

        // Skip the closing curly brace.
        token = tokens[++current];

        // Create the node.
        let astNode = {
          type: token.value == "si" ? "IfStatement" : "WhileStatement",
          test,
          consequent,
        };

        return astNode;
      } else {
        // New AST Node for  `keyword`
        let astNode = {
          type: "VariableDeclaration",
          kind: token.value, // The keyword used. `dico` or `constituo` or `pono`
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
    }

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

    if (token.type === "brace") {
      if (token.value === "{") {
        let astNode = {
          type: "BlockStatement",
          body: [],
        };

        // Skip the opening curly brace.
        token = tokens[++current];

        // The next tokens should be the body of the block statement.
        while (token && token.type !== "brace") {
          astNode.body.push(walk());
          token = tokens[current];
        }

        // The next token should be the closing curly brace.
        if (!token || token.type !== "brace" || token.value !== "}") {
          throw new Error(
            "Expected '}' after block statement body at line " +
              token.line +
              " column " +
              token.column
          );
        }

        // Skip the closing curly brace.
        token = tokens[++current];

        return astNode;
      }
    }

    if (token.type === "paren") {
      if (token.value === "(") {
        // This is a conditional
        let left = walk();
        let operator = tokens[current++].value;
        let right = walk();

        let astNode = {
          type: "BinaryExpression",
          left,
          operator,
          right,
        };

        return astNode;
      }
    }
    if (token.type === "brace") {
      // This is a block statement
      let astNode = {
        type: "BlockStatement",
        body: [],
      };

      // Skip the opening curly brace.
      token = tokens[++current];

      // The next tokens should be the body of the block statement.
      while (token && token.type !== "brace") {
        astNode.body.push(walk());
        token = tokens[current];
      }

      // The next token should be the closing curly brace.
      if (!token || token.type !== "brace" || token.value !== "}") {
        throw new Error(
          "Expected '}' after block statement body at line " +
            token.line +
            " column " +
            token.column
        );
      }

      // Skip the closing curly brace.
      token = tokens[++current];

      return astNode;
    }
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
  const traverseNode = (node, parent) => {
    // Get the node object on the visitor passed to the `traverser`
    let objects = visitor[node.type];

    // Check if the node type object is present and call the enter method
    // with the node and the parser
    if (objects && objects.enter) {
      objects.enter(node, parent);
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

      case "IfStatement":
        traverseNode(node.test, node);
        traverseNode(node.consequent, node);
        break;

      case "WhileStatement":
        traverseNode(node.test, node);
        traverseNode(node.body, node);
        break;

      case "BinaryExpression":
        traverseNode(node.left, node);
        traverseNode(node.right, node);
        break;

      case "BlockStatement":
        traverseArray(node.body, node);
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
    // We will visit the `VariableDeclaration` node type
    VariableDeclaration: {
      // On enter, we will take the node and its parent
      enter(node, parent) {
        // We will check the `kind` property of the node
        // If it is `dico`, we will change it to `var`
        // If it is `constituo`, we will change it to `const`
        if (node.kind === "dico") {
          node.kind = "var";
        } else if (node.kind === "constituo") {
          node.kind = "const";
        } else {
          node.kind = "let";
        }
      },
    },

    // We will do the same for the `VariableDeclarator` node type
    VariableDeclarator: {
      enter(node, parent) {
        // We will check the `init` property of the node
        // If it is `verum`, we will change it to `true`
        // If it is `falsum`, we will change it to `false`
        // If it is `nullus`, we will change it to `null`
        if (node.init.type === "BooleanLiteral") {
          if (node.init.value === "verum") {
            node.init.value = true;
          } else if (node.init.value === "falsum") {
            node.init.value = false;
          }
        } else if (node.init.type === "NullLiteral") {
          if (node.init.value === "nullus") {
            node.init.value = null;
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
const generator = (node) => {
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
        node.declarations.map(generator).join("\n")
      ); // let age = 18;

    case "IfStatement":
      return (
        "if (" +
        generator(node.test) +
        ") {" +
        node.consequent.map(generator).join("\n") +
        "} else {" +
        node.alternate.map(generator).join("\n") +
        "}"
      );

    case "WhileStatement":
      return (
        "while (" +
        generator(node.test) +
        ") {" +
        node.body.map(generator).join("\n") +
        "}"
      );

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
  const tokens = tokenizer(code);

  // Take the tokens and parse the into an AST
  const ast = parser(tokens);

  // Modify the ast into a new one
  const mast = transformer(ast);

  // Generate the code from the modified AST
  const output = generator(mast);

  // Return the new compiled code
  return output;
};

module.exports = {
  compiler,
  tokenizer,
  parser,
  transformer,
  generator,
  traverser,
  parseRomanNumerals,
};
