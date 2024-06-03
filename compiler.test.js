// FILE: compiler.test.js
let {
  parseRomanNumerals,
  tokenizer,
  parser,
  transformer,
  generator,
  compiler,
} = require("./compiler");

describe("parseRomanNumerals", () => {
  test("should correctly parse single digit roman numerals", () => {
    expect(parseRomanNumerals("I")).toBe(1);
    expect(parseRomanNumerals("V")).toBe(5);
    expect(parseRomanNumerals("X")).toBe(10);
  });

  test("should correctly parse multi digit roman numerals", () => {
    expect(parseRomanNumerals("XVIII")).toBe(18);
    expect(parseRomanNumerals("XLII")).toBe(42);
    expect(parseRomanNumerals("MMXXI")).toBe(2021);
  });
});

describe("tokenizer", () => {
  test("tokenizer should correctly tokenize a simple statement", () => {
    let tokens = tokenizer("dico age esse XVIII;");
    expect(tokens).toEqual([
      { type: "keyword", value: "dico", line: 1, column: 1 },
      { type: "name", value: "age", line: 1, column: 6 },
      { type: "ident", value: "esse", line: 1, column: 10 },
      { type: "number", value: 18, line: 1, column: 15 },
      { type: "semi", value: ";", line: 1, column: 20 },
    ]);
  });

  test("tokenizer should correctly tokenize a statement with a boolean", () => {
    let tokens = tokenizer("dico isEmployed esse falsum;");
    expect(tokens).toEqual([
      { type: "keyword", value: "dico", line: 1, column: 1 },
      { type: "name", value: "isEmployed", line: 1, column: 6 },
      { type: "ident", value: "esse", line: 1, column: 17 },
      { type: "boolean", value: "falsum", line: 1, column: 22 },
      { type: "semi", value: ";", line: 1, column: 28 },
    ]);
  });

  // test("should correctly tokenize an if statement", () => {
  //   let tokens = tokenizer(
  //     "si (condition sit condition) { dico age esse XV; };"
  //   );
  //   expect(tokens).toEqual([
  //     { type: "keyword", value: "si", line: 1, column: 1 },
  //     { type: "paren", value: "(", line: 1, column: 4 },
  //     { type: "name", value: "condition", line: 1, column: 5 },
  //     { type: "name", value: "sit", line: 1, column: 15 },
  //     { type: "name", value: "condition", line: 1, column: 19 },
  //     { type: "paren", value: ")", line: 1, column: 28 },
  //     { type: "brace", value: "{", line: 1, column: 30 },
  //     { type: "keyword", value: "dico", line: 1, column: 32 },
  //     { type: "name", value: "age", line: 1, column: 37 },
  //     { type: "ident", value: "esse", line: 1, column: 41 },
  //     { type: "name", value: "XV", line: 1, column: 46 },
  //     { type: "semi", value: ";", line: 1, column: 48 },
  //     { type: "brace", value: "}", line: 1, column: 50 },
  //     { type: "semi", value: ";", line: 1, column: 51 },
  //   ]);
  // });

  // test("should correctly tokenize a while statement", () => {
  //   let tokens = tokenizer(
  //     "dum (condition sit condition) { dico age esse XV; };"
  //   );
  //   expect(tokens).toEqual([
  //     { type: "keyword", value: "dum", line: 1, column: 1 },
  //     { type: "paren", value: "(", line: 1, column: 5 },
  //     { type: "name", value: "condition", line: 1, column: 6 },
  //     { type: "name", value: "sit", line: 1, column: 15 },
  //     { type: "name", value: "condition", line: 1, column: 19 },
  //     { type: "paren", value: ")", line: 1, column: 28 },
  //     { type: "brace", value: "{", line: 1, column: 30 },
  //     { type: "keyword", value: "dico", line: 1, column: 32 },
  //     { type: "name", value: "age", line: 1, column: 37 },
  //     { type: "ident", value: "esse", line: 1, column: 41 },
  //     { type: "name", value: "XV", line: 1, column: 46 },
  //     { type: "semi", value: ";", line: 1, column: 48 },
  //     { type: "brace", value: "}", line: 1, column: 50 },
  //     { type: "semi", value: ";", line: 1, column: 51 },
  //   ]);
  // });
});

describe("parser", () => {
  test("parser should correctly parse the AST for a simple statement", () => {
    let ast = parser([
      { type: "keyword", value: "dico", line: 1, column: 1 },
      { type: "name", value: "age", line: 1, column: 6 },
      { type: "ident", value: "esse", line: 1, column: 10 },
      { type: "number", value: 18, line: 1, column: 15 },
    ]);
    expect(ast).toEqual({
      type: "Program",
      body: [
        {
          type: "VariableDeclaration",
          kind: "dico",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "age" },
              init: { type: "NumberLiteral", value: 18 },
            },
          ],
        },
      ],
    });
  });

  test("parser should correctly parse the AST for a statement with a boolean", () => {
    let ast = parser([
      { type: "keyword", value: "dico", line: 1, column: 1 },
      { type: "name", value: "isEmployed", line: 1, column: 6 },
      { type: "ident", value: "esse", line: 1, column: 18 },
      { type: "boolean", value: "falsum", line: 1, column: 24 },
      { type: "semi", value: ";", line: 1, column: 30 },
    ]);
    expect(ast).toEqual({
      type: "Program",
      body: [
        {
          type: "VariableDeclaration",
          kind: "dico",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "isEmployed" },
              init: { type: "BooleanLiteral", value: "falsum" },
            },
          ],
        },
      ],
    });
  });

  // test("should correctly parse the AST for an if statement", () => {
  //   let ast = parser(
  //     tokenizer("si (condition sit condition) { dico age esse XV; };")
  //   );
  //   expect(ast).toEqual({
  //     type: "Program",
  //     body: [
  //       {
  //         type: "IfStatement",
  //         test: {
  //           type: "LogicalExpression",
  //           operator: "sit",
  //           left: { type: "Identifier", name: "condition" },
  //           right: { type: "Identifier", name: "condition" },
  //         },
  //         consequent: {
  //           type: "BlockStatement",
  //           body: [
  //             {
  //               type: "VariableDeclaration",
  //               kind: "dico",
  //               declarations: [
  //                 {
  //                   type: "VariableDeclarator",
  //                   id: { type: "Identifier", name: "age" },
  //                   init: { type: "Identifier", name: "XV" },
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //       },
  //     ],
  //   });
  // });

  // test("should correctly parse the AST for a while statement", () => {
  //   let ast = parser(
  //     tokenizer("dum (condition sit condition) { dico age esse XV; };")
  //   );
  //   expect(ast).toEqual({
  //     type: "Program",
  //     body: [
  //       {
  //         type: "WhileStatement",
  //         test: {
  //           type: "LogicalExpression",
  //           operator: "sit",
  //           left: { type: "Identifier", name: "condition" },
  //           right: { type: "Identifier", name: "condition" },
  //         },
  //         body: {
  //           type: "BlockStatement",
  //           body: [
  //             {
  //               type: "VariableDeclaration",
  //               kind: "dico",
  //               declarations: [
  //                 {
  //                   type: "VariableDeclarator",
  //                   id: { type: "Identifier", name: "age" },
  //                   init: { type: "Identifier", name: "XV" },
  //                 },
  //               ],
  //             },
  //           ],
  //         },
  //       },
  //     ],
  //   });
  // });
});

describe("transformer", () => {
  test("transformer should correctly transform the AST for a simple statement", () => {
    let mast = transformer({
      type: "Program",
      body: [
        {
          type: "VariableDeclaration",
          kind: "dico",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "age" },
              init: { type: "NumberLiteral", value: 18 },
            },
          ],
        },
      ],
    });
    expect(mast).toEqual({
      type: "Program",
      body: [
        {
          type: "VariableDeclaration",
          kind: "var",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "age" },
              init: { type: "NumberLiteral", value: 18 },
            },
          ],
        },
      ],
    });
  });

  test("transformer should correctly transform the AST for a statement with a boolean", () => {
    let mast = transformer({
      type: "Program",
      body: [
        {
          type: "VariableDeclaration",
          kind: "dico",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "isEmployed" },
              init: { type: "BooleanLiteral", value: false },
            },
          ],
        },
      ],
    });
    expect(mast).toEqual({
      type: "Program",
      body: [
        {
          type: "VariableDeclaration",
          kind: "var",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "isEmployed" },
              init: { type: "BooleanLiteral", value: false },
            },
          ],
        },
      ],
    });
  });
});

describe("generator", () => {
  test("generator should correctly generate code from the transformed AST for a simple statement", () => {
    let output = generator({
      type: "Program",
      body: [
        {
          type: "VariableDeclaration",
          kind: "var",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "age" },
              init: { type: "NumberLiteral", value: 18 },
            },
          ],
        },
      ],
    });
    expect(output).toBe("var age = 18;");
  });

  test("generator should correctly generate code from the transformed AST for a statement with a boolean", () => {
    let output = generator({
      type: "Program",
      body: [
        {
          type: "VariableDeclaration",
          kind: "var",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: "isEmployed" },
              init: { type: "BooleanLiteral", value: false },
            },
          ],
        },
      ],
    });
    expect(output).toBe("var isEmployed = false;");
  });
});

describe("compiler", () => {
  test("compiler should correctly compile the code for a simple statement", () => {
    let code = "dico age esse XVIII;";
    let js = compiler(code);
    expect(js).toBe("var age = 18;");
  });

  test("compiler should correctly compile the code for a statement with a boolean", () => {
    let code = "dico isEmployed esse falsum;";
    let js = compiler(code);
    expect(js).toBe("var isEmployed = false;");
  });

  // test("should correctly compile an if statement", () => {
  //   let output = compiler(
  //     "si (condition sit condition) { dico age esse XV; };"
  //   );
  //   expect(output).toBe("if (condition == condition) { var age = XV; };");
  // });

  // test("should correctly compile a while statement", () => {
  //   let output = compiler(
  //     "dum (condition sit condition) { dico age esse XV; };"
  //   );
  //   expect(output).toBe("while (condition == condition) { var age = XV; };");
  // });
});
