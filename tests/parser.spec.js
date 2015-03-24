var mocha = require('mocha');
var expect = require('chai').expect;

var Parser = require('../parser');

describe('Simple parser for 4 math expressions', function () {
    var sut;

    describe('constructor', function () {
        it('should set position to 0', function () {
            sut = new Parser('2');
            expect(sut.position).to.equal(0);
        });

        it('should correctly tokenize provided string', function () {
            sut = new Parser('0.1  +222 *(3.45 / 1888888)');
            expect(sut.tokens).to.deep.equal(['0.1', '+', '222', '*', '(', '3.45', '/', '1888888', ')']);
        });

        it('should leave only digits and operations symbols', function () {
            sut = new Parser('#ABC & 9,2 / ? 2222 = - 11 _ ^ * 3');
            expect(sut.tokens).to.deep.equal(['9', '2', '/', '2222', '-', '11', '*', '3']);

        });
    });

    describe('parse', function () {
        describe('single arithmetic operations', function () {
            it('should parse "+" operation', function () {
                sut = new Parser('2 + 2');
                expect(sut.parse()).to.deep.equal({
                    "left": {
                        "type": "number",
                        "value": "2"
                    },
                    "right": {
                        "type": "number",
                        "value": "2"
                    },
                    "type": "+"
                });
            });

            it('should parse "-" operation', function () {
                sut = new Parser('2   - 2');
                expect(sut.parse()).to.deep.equal({
                    "left": {
                        "type": "number",
                        "value": "2"
                    },
                    "right": {
                        "type": "number",
                        "value": "2"
                    },
                    "type": "-"
                });
            });

            it('should parse "*" operation', function () {
                sut = new Parser('2*2');
                expect(sut.parse()).to.deep.equal({
                    "left": {
                        "type": "number",
                        "value": "2"
                    },
                    "right": {
                        "type": "number",
                        "value": "2"
                    },
                    "type": "*"
                });
            });

            it('should parse "/" operation', function () {
                sut = new Parser('  2/2   ');
                expect(sut.parse()).to.deep.equal({
                    "left": {
                        "type": "number",
                        "value": "2"
                    },
                    "right": {
                        "type": "number",
                        "value": "2"
                    },
                    "type": "/"
                });
            });


        });

        describe('nested arithmetic operations', function() {
           it('should parse single parenthesis', function() {
               sut = new Parser('(1 + 1) * 2');
               expect(sut.parse()).to.deep.equal({
                   "left": {
                       "left": {
                           "type": "number",
                           "value": "1"
                       },
                       "right": {
                           "type": "number",
                           "value": "1"
                       },
                       "type": "+"
                   },
                   "right": {
                       "type": "number",
                       "value": "2"
                   },
                   "type": "*"
               });
           });

            it('should parse double parenthesis', function() {
                sut = new Parser('(1 + (2 * 2)) / 3');
                expect(sut.parse()).to.deep.equal({
                    "left": {
                        "left": {
                            "type": "number",
                            "value": "1"
                        },
                        "right": {
                            "left": {
                                "type": "number",
                                "value": "2"
                            },
                            "right": {
                                "type": "number",
                                "value": "2"
                            },
                            "type": "*"
                        },
                        "type": "+"
                    },
                    "right": {
                        "type": "number",
                        "value": "3"
                    },
                    "type": "/"
                });
            });

            it('should throw exception for unbalanced parenthesis', function() {
                sut = new Parser('(1 + (2 * 2) / 3');
                expect(sut.parse.bind(sut)).to.throw(/expected \)/);
            });

            it('should throw exception for bad input', function() {
                sut = new Parser('1 +');
                expect(sut.parse.bind(sut)).to.throw(/expected a number, a variable, or parentheses/);
            });

            it('should throw exception non-parsable input', function() {
                sut = new Parser('1 2 3');
                expect(sut.parse.bind(sut)).to.throw(/unexpected /);
            });
        });
    });


    describe('evaluate', function() {
        describe('single arithmetic operations', function () {
            it('should process "+" operation', function () {
                sut = new Parser('2 + 2');
                expect(sut.evaluate(sut.parse())).to.equal(4);
            });

            it('should process "-" operation', function () {
                sut = new Parser('100   -1');
                expect(sut.evaluate(sut.parse())).to.equal(99);
            });

            it('should process "*" operation', function () {
                sut = new Parser('6*8');
                expect(sut.evaluate(sut.parse())).to.equal(48);
            });

            it('should process "/" operation', function () {
                sut = new Parser('  21/3  ');
                expect(sut.evaluate(sut.parse())).to.equal(7);
            });

            it('should process negative numbers', function() {
                sut = new Parser('  -1-1   ');
                expect(sut.evaluate(sut.parse())).to.equal(-2);
            });
        });

        describe('nested arithmetic operations', function() {
            it('should process parenthesis', function() {
                sut = new Parser('(1+2)*3');
                expect(sut.evaluate(sut.parse())).to.equal(9);
            });

            it('should process double parenthesis', function() {
                sut = new Parser('(10-(2*3))/2');
                expect(sut.evaluate(sut.parse())).to.equal(2);
            });

            it('should support operators priority', function() {
                sut = new Parser('1+2*3');
                expect(sut.evaluate(sut.parse())).to.equal(7);
            });
        });
    });
});