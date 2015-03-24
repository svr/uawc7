/*
Math expression parser and evaluator
Greatly influenced by https://github.com/jorendorff/toy-calculator
All credits go to him
*/

'use strict';

var OPERATIONS = '()*/+-';

var isNumber = function (n) {
    return !isNaN(parseFloat(n));
};

var tokenize = function(code) {
    var results = [];

    var tokenRegExp = new RegExp('\\s*([0-9]+(:?\\.[0-9]+)?|[' + OPERATIONS + '])\\s*', 'g');
    var match;
    while ((match = tokenRegExp.exec(code)) !== null) {
        results.push(match[1]);
    }
    return results;
};

var Parser = function (code) {
    if(!(this instanceof Parser)) {
        return new Parser(code);
    }
    this.tokens = tokenize(code);
    this.position = 0;
};
Parser.prototype.peek = function() {
    return this.tokens[this.position];
};
Parser.prototype.consume = function() {
    this.position++;
};

/*
PrimaryExpr:
    Number
   ( Expr )
*/

Parser.prototype.parsePrimaryExpr = function() {
    var token = this.peek();
    if (isNumber(token)) {
        this.consume();
        return {type: "number", value: token};
    } else if(this.position === 0 && (token === "-" || token === "+")) {
        this.consume();
        return {type: token, left: {type: "number", value: '0'}, right: this.parsePrimaryExpr()};
    } else if (token === "(") {
        this.consume();
        var expr = this.parseExpr();
        if (this.peek() !== ")") {
            throw new SyntaxError("expected )");
        }
        this.consume();
        return expr;
    } else {
        throw new SyntaxError("expected a number, a variable, or parentheses");
    }
};

/*
 MulExpr :
     Expr
     Expr * Expr ...
     Expr / Expr ...
 */

Parser.prototype.parseMulExpr = function() {
    var expr = this.parsePrimaryExpr();
    var token = this.peek();
    while (token === "*" || token === "/") {
        this.consume();
        var rightHandSide = this.parsePrimaryExpr();
        expr = {type: token, left: expr, right: rightHandSide};
        token = this.peek();
    }
    return expr;
};

/*
 Expr :
     MulExpr
     MulExpr + MulExpr
     MulExpr - MulExpr
*/
Parser.prototype.parseExpr = function() {
    var expr = this.parseMulExpr();
    var token = this.peek();
    while (token === "+" || token === "-") {
        this.consume(token);
        var rightHandSide = this.parseMulExpr();
        expr = {type: token, left: expr, right: rightHandSide};
        token = this.peek();
    }
    return expr;
};

Parser.prototype.parse = function () {
    var result = this.parseExpr();
//  Make sure `parseExpr()` consumed *all* the
// input. If it didn’t, that means the next token didn’t match any syntax
// rule, which is an error.
    if (this.position !== this.tokens.length) {
        throw new SyntaxError("unexpected '" + this.peek() + "'");
    }
    return result;
};


Parser.prototype.evaluate = Parser.evaluate = function(obj) {
    switch (obj.type) {
        case "number": return parseFloat(obj.value);
        case "+": return Parser.evaluate(obj.left) + Parser.evaluate(obj.right);
        case "-": return Parser.evaluate(obj.left) - Parser.evaluate(obj.right);
        case "*": return Parser.evaluate(obj.left) * Parser.evaluate(obj.right);
        case "/": return Parser.evaluate(obj.left) / Parser.evaluate(obj.right);
    }
};

module.exports = Parser;
