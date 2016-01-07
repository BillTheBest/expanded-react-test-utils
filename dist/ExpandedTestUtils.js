/**
 * CSS Selector Parser
 * @author Marat Dulin <mdevils@yandex.ru>
 * @source https://github.com/mdevils/node-css-selector-parser
 * @license MIT
 */
define('CssSelectorParser',[],function() {

    var ParseContext, doubleQuotesEscapeChars, identReplacements, identReplacementsRev, identSpecialChars, isAttrMatchOperator, isHex, isIdent, isIdentStart, singleQuoteEscapeChars, strReplacementsRev;

    function CssSelectorParser() {
      this.pseudos = {};
      this.attrEqualityMods = {};
      this.ruleNestingOperators = {};
      this.substitutesEnabled = false;
    }

    CssSelectorParser.prototype.registerSelectorPseudos = function(name) {
      var _i, _len;
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        name = arguments[_i];
        this.pseudos[name] = 'selector';
      }
      return this;
    };

    CssSelectorParser.prototype.unregisterSelectorPseudos = function(name) {
      var _i, _len;
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        name = arguments[_i];
        delete this.pseudos[name];
      }
      return this;
    };

    CssSelectorParser.prototype.registerNestingOperators = function(op) {
      var _i, _len;
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        op = arguments[_i];
        this.ruleNestingOperators[op] = true;
      }
      return this;
    };

    CssSelectorParser.prototype.unregisterNestingOperators = function(op) {
      var _i, _len;
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        op = arguments[_i];
        delete this.ruleNestingOperators[op];
      }
      return this;
    };

    CssSelectorParser.prototype.registerAttrEqualityMods = function(mod) {
      var _i, _len;
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        mod = arguments[_i];
        this.attrEqualityMods[mod] = true;
      }
      return this;
    };

    CssSelectorParser.prototype.unregisterAttrEqualityMods = function(mod) {
      var _i, _len;
      for (_i = 0, _len = arguments.length; _i < _len; _i++) {
        mod = arguments[_i];
        delete this.attrEqualityMods[mod];
      }
      return this;
    };

    CssSelectorParser.prototype.enableSubstitutes = function() {
      this.substitutesEnabled = true;
      return this;
    };

    CssSelectorParser.prototype.disableSubstitutes = function() {
      this.substitutesEnabled = false;
      return this;
    };

    isIdentStart = function(c) {
      return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
    };

    isIdent = function(c) {
      return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '-' || c === '_';
    };

    isHex = function(c) {
      return (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F') || (c >= '0' && c <= '9');
    };

    isAttrMatchOperator = function(c) {
      return c === '=' || c === '^' || c === '$' || c === '*' || c === '~';
    };

    identSpecialChars = {
      '!': true,
      '"': true,
      '#': true,
      '$': true,
      '%': true,
      '&': true,
      '\'': true,
      '(': true,
      ')': true,
      '*': true,
      '+': true,
      ',': true,
      '.': true,
      '/': true,
      ';': true,
      '<': true,
      '=': true,
      '>': true,
      '?': true,
      '@': true,
      '[': true,
      '\\': true,
      ']': true,
      '^': true,
      '`': true,
      '{': true,
      '|': true,
      '}': true,
      '~': true
    };

    identReplacements = {
      'n': '\n',
      'r': '\r',
      't': '\t',
      ' ': ' ',
      'f': '\f',
      'v': '\v'
    };

    identReplacementsRev = {
      '\n': '\\n',
      '\r': '\\r',
      '\t': '\\t',
      ' ': '\\ ',
      '\f': '\\f',
      '\v': '\\v'
    };

    strReplacementsRev = {
      '\n': '\\n',
      '\r': '\\r',
      '\t': '\\t',
      '\f': '\\f',
      '\v': '\\v'
    };

    singleQuoteEscapeChars = {
      n: '\n',
      r: '\r',
      t: '\t',
      f: '\f',
      '\\': '\\',
      '\'': '\''
    };

    doubleQuotesEscapeChars = {
      n: '\n',
      r: '\r',
      t: '\t',
      f: '\f',
      '\\': '\\',
      '"': '"'
    };

    ParseContext = function(str, p, pseudos, attrEqualityMods, ruleNestingOperators, substitutesEnabled) {
      var c, getIdent, getStr, l, skipWhitespace;
      l = str.length;
      c = null;
      getStr = function(quote, escapeTable) {
        var esc, hex, result;
        result = '';
        p++;
        c = str.charAt(p);
        while (p < l) {
          if (c === quote) {
            p++;
            return result;
          } else if (c === '\\') {
            p++;
            c = str.charAt(p);
            if (c === quote) {
              result += quote;
            } else if (esc = escapeTable[c]) {
              result += esc;
            } else if (isHex(c)) {
              hex = c;
              p++;
              c = str.charAt(p);
              while (isHex(c)) {
                hex += c;
                p++;
                c = str.charAt(p);
              }
              if (c === ' ') {
                p++;
                c = str.charAt(p);
              }
              result += String.fromCharCode(parseInt(hex, 16));
              continue;
            } else {
              result += c;
            }
          } else {
            result += c;
          }
          p++;
          c = str.charAt(p);
        }
        return result;
      };
      getIdent = function() {
        var hex, r, result;
        result = '';
        c = str.charAt(p);
        while (p < l) {
          if (isIdent(c)) {
            result += c;
          } else if (c === '\\') {
            p++;
            c = str.charAt(p);
            if (identSpecialChars[c]) {
              result += c;
            } else if (r = identReplacements[c]) {
              result += r;
            } else if (isHex(c)) {
              hex = c;
              p++;
              c = str.charAt(p);
              while (isHex(c)) {
                hex += c;
                p++;
                c = str.charAt(p);
              }
              if (c === ' ') {
                p++;
                c = str.charAt(p);
              }
              result += String.fromCharCode(parseInt(hex, 16));
              continue;
            } else {
              result += c;
            }
          } else {
            return result;
          }
          p++;
          c = str.charAt(p);
        }
        return result;
      };
      skipWhitespace = function() {
        var result;
        c = str.charAt(p);
        result = false;
        while (c === ' ' || c === "\t" || c === "\n" || c === "\r" || c === "\f") {
          result = true;
          p++;
          c = str.charAt(p);
        }
        return result;
      };
      this.parse = function() {
        var res;
        res = this.parseSelector();
        if (p < l) {
          throw Error('Rule expected but "' + str.charAt(p) + '" found.');
        }
        return res;
      };
      this.parseSelector = function() {
        var res, selector;
        selector = res = this.parseSingleSelector();
        c = str.charAt(p);
        while (c === ',') {
          p++;
          skipWhitespace();
          if (res.type !== 'selectors') {
            res = {
              type: 'selectors',
              selectors: [selector]
            };
          }
          selector = this.parseSingleSelector();
          if (!selector) {
            throw Error('Rule expected after ",".');
          }
          res.selectors.push(selector);
        }
        return res;
      };
      this.parseSingleSelector = function() {
        var currentRule, op, rule, selector;
        skipWhitespace();
        selector = {
          type: 'ruleSet'
        };
        rule = this.parseRule();
        if (!rule) {
          return null;
        }
        currentRule = selector;
        while (rule) {
          rule.type = 'rule';
          currentRule.rule = rule;
          currentRule = rule;
          skipWhitespace();
          c = str.charAt(p);
          if (p >= l || c === ',' || c === ')') {
            break;
          }
          if (ruleNestingOperators[c]) {
            op = c;
            p++;
            skipWhitespace();
            rule = this.parseRule();
            if (!rule) {
              throw Error('Rule expected after "' + op + '".');
            }
            rule.nestingOperator = op;
          } else {
            rule = this.parseRule();
            if (rule) {
              rule.nestingOperator = null;
            }
          }
        }
        return selector;
      };
      this.parseRule = function() {
        var attr, attrValue, id, operator, pseudo, pseudoName, rule, value;
        rule = null;
        while (p < l) {
          c = str.charAt(p);
          if (c === '*') {
            p++;
            (rule = rule || {}).tagName = '*';
          } else if (isIdentStart(c) || c === '\\') {
            (rule = rule || {}).tagName = getIdent();
          } else if (c === '.') {
            p++;
            rule = rule || {};
            (rule.classNames = rule.classNames || []).push(getIdent());
          } else if (c === '#') {
            p++;
            c = str.charAt(p);
            id = '';
            while (isIdent(c)) {
              id += c;
              p++;
              c = str.charAt(p);
            }
            (rule = rule || {}).id = id;
          } else if (c === '[') {
            p++;
            skipWhitespace();
            attr = {
              name: getIdent()
            };
            skipWhitespace();
            if (c === ']') {
              p++;
            } else {
              operator = '';
              if (attrEqualityMods[c]) {
                operator = c;
                p++;
                c = str.charAt(p);
              }
              if (p >= l) {
                throw Error('Expected "=" but end of file reached.');
              }
              if (c !== '=') {
                throw Error('Expected "=" but "' + c + '" found.');
              }
              attr.operator = operator + '=';
              p++;
              skipWhitespace();
              attrValue = '';
              attr.valueType = 'string';
              if (c === '"') {
                attrValue = getStr('"', doubleQuotesEscapeChars);
              } else if (c === '\'') {
                attrValue = getStr('\'', singleQuoteEscapeChars);
              } else if (substitutesEnabled && c === '$') {
                p++;
                attrValue = getIdent();
                attr.valueType = 'substitute';
              } else {
                while (p < l) {
                  if (c === ']') {
                    break;
                  }
                  attrValue += c;
                  p++;
                  c = str.charAt(p);
                }
                attrValue = attrValue.trim();
              }
              skipWhitespace();
              if (p >= l) {
                throw Error('Expected "]" but end of file reached.');
              }
              if (c !== ']') {
                throw Error('Expected "]" but "' + c + '" found.');
              }
              p++;
              attr.value = attrValue;
            }
            rule = rule || {};
            (rule.attrs = rule.attrs || []).push(attr);
          } else if (c === ':') {
            p++;
            pseudoName = getIdent();
            pseudo = {
              name: pseudoName
            };
            if (c === '(') {
              p++;
              value = '';
              skipWhitespace();
              if (pseudos[pseudoName] === 'selector') {
                pseudo.valueType = 'selector';
                value = this.parseSelector();
              } else {
                pseudo.valueType = 'string';
                if (c === '"') {
                  value = getStr('"', doubleQuotesEscapeChars);
                } else if (c === '\'') {
                  value = getStr('\'', singleQuoteEscapeChars);
                } else if (substitutesEnabled && c === '$') {
                  p++;
                  value = getIdent();
                  pseudo.valueType = 'substitute';
                } else {
                  while (p < l) {
                    if (c === ')') {
                      break;
                    }
                    value += c;
                    p++;
                    c = str.charAt(p);
                  }
                  value = value.trim();
                }
                skipWhitespace();
              }
              if (p >= l) {
                throw Error('Expected ")" but end of file reached.');
              }
              if (c !== ')') {
                throw Error('Expected ")" but "' + c + '" found.');
              }
              p++;
              pseudo.value = value;
            }
            rule = rule || {};
            (rule.pseudos = rule.pseudos || []).push(pseudo);
          } else {
            break;
          }
        }
        return rule;
      };
      return this;
    };

    CssSelectorParser.prototype.parse = function(str) {
      var context;
      context = new ParseContext(str, 0, this.pseudos, this.attrEqualityMods, this.ruleNestingOperators, this.substitutesEnabled);
      return context.parse();
    };

    CssSelectorParser.prototype.escapeIdentifier = function(s) {
      var c, cc, extraCharCode, i, l, r, result;
      result = '';
      i = 0;
      l = s.length;
      while (i < l) {
        c = s.charAt(i);
        if (identSpecialChars[c]) {
          result += '\\' + c;
        } else if (r = identReplacementsRev[c]) {
          result += r;
        } else if ((cc = c.charCodeAt(0)) && (cc < 32 || cc > 126)) {
          if ((cc & 0xF800) === 0xD800) {
            extraCharCode = s.charCodeAt(i++);
            if ((cc & 0xFC00) !== 0xD800 || (extraCharCode & 0xFC00) !== 0xDC00) {
              throw Error('UCS-2(decode): illegal sequence');
            }
            cc = ((cc & 0x3FF) << 10) + (extraCharCode & 0x3FF) + 0x10000;
          }
          result += '\\' + cc.toString(16) + ' ';
        } else {
          result += c;
        }
        i++;
      }
      return result;
    };

    CssSelectorParser.prototype.escapeStr = function(s) {
      var c, i, l, r, result;
      result = '';
      i = 0;
      l = s.length;
      while (i < l) {
        c = s.charAt(i);
        if (c === '"') {
          c = '\\"';
        } else if (c === '\\') {
          c = '\\\\';
        } else if (r = strReplacementsRev[c]) {
          c = r;
        }
        result += c;
        i++;
      }
      return "\"" + result + "\"";
    };

    CssSelectorParser.prototype.render = function(path) {
      var renderEntity,
        _this = this;
      renderEntity = function(entity) {
        var currentEntity, parts, res;
        res = '';
        switch (entity.type) {
          case 'ruleSet':
            currentEntity = entity.rule;
            parts = [];
            while (currentEntity) {
              if (currentEntity.nestingOperator) {
                parts.push(currentEntity.nestingOperator);
              }
              parts.push(renderEntity(currentEntity));
              currentEntity = currentEntity.rule;
            }
            res = parts.join(' ');
            break;
          case 'selectors':
            res = entity.selectors.map(renderEntity).join(', ');
            break;
          case 'rule':
            if (entity.tagName) {
              if (entity.tagName === '*') {
                res = '*';
              } else {
                res = _this.escapeIdentifier(entity.tagName);
              }
            }
            if (entity.id) {
              res += "#" + (_this.escapeIdentifier(entity.id));
            }
            if (entity.classNames) {
              res += (entity.classNames.map(function(cn) {
                return "." + (_this.escapeIdentifier(cn));
              })).join('');
            }
            if (entity.attrs) {
              res += (entity.attrs.map(function(attr) {
                if (attr.operator) {
                  if (attr.valueType === 'substitute') {
                    return "[" + (_this.escapeIdentifier(attr.name)) + attr.operator + "$" + attr.value + "]";
                  } else {
                    return "[" + (_this.escapeIdentifier(attr.name)) + attr.operator + (_this.escapeStr(attr.value)) + "]";
                  }
                } else {
                  return "[" + (_this.escapeIdentifier(attr.name)) + "]";
                }
              })).join('');
            }
            if (entity.pseudos) {
              res += (entity.pseudos.map(function(pseudo) {
                if (pseudo.valueType) {
                  if (pseudo.valueType === 'selector') {
                    return ":" + (_this.escapeIdentifier(pseudo.name)) + "(" + (renderEntity(pseudo.value)) + ")";
                  } else if (pseudo.valueType === 'substitute') {
                    return ":" + (_this.escapeIdentifier(pseudo.name)) + "($" + pseudo.value + ")";
                  } else {
                    return ":" + (_this.escapeIdentifier(pseudo.name)) + "(" + (_this.escapeStr(pseudo.value)) + ")";
                  }
                } else {
                  return ":" + (_this.escapeIdentifier(pseudo.name));
                }
              })).join('');
            }
            break;
          default:
            throw Error('Unknown entity type: "' + entity.type(+'".'));
        }
        return res;
      };
      return renderEntity(path);
    };

    return CssSelectorParser;

});
define('SelectorMatchers',['require','lodash'],function(require) {
    'use strict';

    var _ = require('lodash');

    return {
        /**
         * Given an array, reduces the items based on the provided parsed CSS pseudo selector.
         * @param  {Object} element Element to test
         * @param  {Object} rule    Parsed pseudo CSS selector
         * @return {Array}          Reduced matches based on selector processing
         */
        doesElementMatchSelector: function(element, rule){
            var elementClassName = element.className,
                elementID = element.id,
                elementTagName = element.tagName,
                elementDisplayName = element.constructor.displayName;

            if(rule.tagName && !this.tagName(rule.tagName, elementTagName, elementDisplayName)){
                return false;
            }

            if(rule.id && !this.id(rule.id, elementID)){
                return false;
            }

            if(rule.classNames && !this.className(rule.classNames, elementClassName)){
                return false;
            }
            if(rule.pseudos && !this.pseudoMatcher(rule.pseudos, element, elementTagName)){
                return false;
            }
            if(rule.attrs && !this.attributeMatcher(rule.attrs, element)){
                return false;
            }
            return true;
        },

        /**
         * Routes pseudo selector to proper handler
         * @param  {Object} pseudoRule     Parsed CSS pseudo rule
         * @param  {Object} element        Element to check against pseudo rule
         * @param  {String} elementTagName Tag name of the element
         * @return {Bool}                  Whether element matches pseudo rule
         */
        pseudoMatcher: function(pseudoRule, element, elementTagName){
            if(pseudoRule.name === 'checked'){
                return this.checked(element, elementTagName);
            }
            if(pseudoRule.name === 'empty'){
                return this.empty(element);
            }
        },

        /**
         * Validates if the provided element matches the provided array of
         * attribute CSS selectors.
         * @param  {Array} attributeRules Array of attribute rules to check
         * @param  {Object} element       Element to check
         * @return {Bool}                 Whether element matches all attribute rules
         */
        attributeMatcher: function(attributeRules, element){
            for(var i = 0; i < attributeRules.length; i++){
                var elementProperty = element.props[attributeRules[i].name],
                    operator = attributeRules[i].operator,
                    value = attributeRules[i].value;

                //Only checking for existance, don't care about the value
                if(!operator && elementProperty === undefined){
                    return false;
                }

                var doesValueMatch = this.compareElementProperty(elementProperty, operator, value);
                if(!doesValueMatch){
                    return false;
                }
            }
            return true;
        },

        /**
         * Checks if the element matches the provided tag name (if DOM node) or
         * display name (if React component)
         * @param  {String} ruleTag     Tag name of CSS rule
         * @param  {String} tagName     Tag name of element
         * @param  {String} displayName Display name of element
         * @return {Bool}               Whether element matches tag query
         */
        tagName: function(ruleTag, tagName, displayName){
            ruleTag = ruleTag.toLowerCase();
            if(tagName && ruleTag === tagName.toLowerCase()){
                return true;
            }
            if(displayName && ruleTag === displayName.toLowerCase()){
                return true;
            }
            return false;
        },

        /**
         * Checks if the element matches the provided ID selector
         * @param  {String} ruleID    ID selector to compare against
         * @param  {String} elementID ID attribute of the element to check
         * @return {Bool}             Whether the provided element ID matches the CSS element selector
         */
        id: function(ruleID, elementID){
            return (elementID && ruleID === elementID);
        },

        /**
         * Checks if the element class names match the provided CSS selector names
         * @param  {Array}  ruleClassName    Class name of CSS selector
         * @param  {String} elementClassName Class name of element
         * @return {Bool}                    Whether element class names CSS selectors
         */
        className: function(ruleClassName, elementClassName){
            if(!elementClassName){
                return false;
            }
            for(var i = 0; i < ruleClassName.length; i++){
                if((' ' + elementClassName + ' ').indexOf(' ' + ruleClassName[i] + ' ') === -1){
                    return false;
                }
            }
            return true;
        },

        /**
         * Checks if the provided element is "empty" meaning it has no children
         * @param  {Object} element Element to test
         * @return {Bool}           True if the provided element has no children, false otherwise
         */
        empty: function(element){
            return element.childNodes.length == 0;
        },

        /**
         * Checks if the provided element is "checked". Only applies to inputs of type radio
         * and checkbox. Checks for both the checked property and defaultChecked property.
         * @param  {Object} element Element to test
         * @param  {String} tagName Tag name of the element
         * @return {Bool}           Whether element is the correct input type and is checked
         */
        checked: function(element, tagName){
            if(!tagName || tagName.toLowerCase() !== 'input'){
                return false;
            }

            var inputType = element.tagName.toLowerCase();
            if(inputType !== 'checkbox' && inputType !== 'radio'){
                return false;
            }

            return element.checked !== undefined;
        },

        /**
         * Function to parse attribute CSS queries for the various types of comparitor functions supported
         * in attribute queries and then performs the specific comparison of property and value
         * @param  {Mixed} property  Value of component prop to compare against
         * @param  {String} operator Comparison operator
         * @param  {String} value    Value to compare
         * @return {Bool}            Whether property matches value with the given operator check
         */
        compareElementProperty: function(property, operator, value){
            if(operator === '='){
                return this.compareElementPropertyEquality(property, value);
            }
            if(operator === '~='){
                return String(property).split(" ").indexOf(value) !== -1;
            }
            if(operator === '^='){
                return _.startsWith(property, value);
            }
            if(operator === '$='){
                return _.endsWith(property, value);
            }
            if(operator === '*='){
                return property && property.indexOf(value) !== -1;
            }
            return true;
        },

        /**
         * Does a equality comparison, handling for the fact that value is always a string. Supports casting
         * of values into numbers, booleans, and null.
         * @param  {Mixed}  property Element prop value to check
         * @param  {String} value    CSS selector value to compare
         * @return {Bool}            Whether property and value match
         */
        compareElementPropertyEquality: function(property, value){
            //When doing direct comparisons, do some conversions between numbers, booleans, null/undefined since
            //the value in the selector always comes through as a string
            if(_.isNumber(property)){
                return property === parseInt(value);
            }
            else if(_.isBoolean(property)){
                return property === (value === 'true' ? true : false);
            }
            else if(value === "null"){
                return property === null;
            }
            return property === value;
        }
    };
});
define('TestLocation',['require'],function(require) {
    /**
     * A location that is convenient for testing and does not require a DOM. Copy of
     * TestLocation file in react-router (modules/Location/TestLocation). Copied here
     * because it isn't included as part of the bower package.
     */
    function TestLocation(history, Router) {
        this.history = history || [];
        this.Router = Router;
        this.listeners = [];
        this.updateHistoryLength();
    }

    TestLocation.prototype = {
        needsDOM: false,
        updateHistoryLength: function () {
            this.Router.History.length = this.history.length;
        },
        notifyChange: function (type) {
            for (var i = 0, len = this.listeners.length; i < len; ++i){
                this.listeners[i].call(this, { path: this.getCurrentPath(), type: type });
            }
        },
        addChangeListener: function (listener) {
            this.listeners.push(listener);
        },
        removeChangeListener: function (listener) {
            this.listeners = this.listeners.filter(function (l) {return l !== listener;});
        },
        push: function (path) {
            this.history.push(path);
            this.updateHistoryLength();
            this.notifyChange('push');
        },
        replace: function (path) {
            this.history[this.history.length - 1] = path;
            this.notifyChange('replace');
        },
        pop: function () {
            this.history.pop();
            this.updateHistoryLength();
            this.notifyChange('pop');
        },
        getCurrentPath: function () {
            return this.history[this.history.length - 1];
        },
        toString: function () {
            return '<TestLocation>';
        }
    };
    return TestLocation;
});
/*global spyOn*/
define('ExpandedTestUtils',['require','react','lodash','react-addons-test-utils','CssSelectorParser','SelectorMatchers','TestLocation'],function(require) {
    'use strict';

    var React = require('react');
    var _ = require('lodash');
    var ReactTestUtils = require('react-addons-test-utils');
    var CssSelectorParser = require('CssSelectorParser');
    var SelectorMatchers = require('SelectorMatchers');
    var TestLocation = require('TestLocation');

    var originalCreateElement = React.createElement;

    var supportedPsuedoSelectors = [
        'empty',
        'checked',
    ];

    /* eslint-disable */
    /**
     * NOT CURRENTLY USED: I wrote this originally thinking it would be useful, but then found
     * another solution, but I didn't want to remove this code in case it becomes useful in the future
     *
     * Recursive method to take a root React node and build up an easy to traverse tree of children. Top level object will be an object
     * with an element and children array. Children will be composed of these same sub-objects.
     * @param  {ReactElement} root Root react node in tree
     * @return {Object}            React tree
     */
    function buildReactTree(root){
        if (!root) {
            return [];
        }
        var ret = {element: root, children:[]};
        if (ReactTestUtils.isDOMComponent(root)) {
            var renderedChildren = root._renderedChildren;
            var key;
            for (key in renderedChildren) {
                if (!renderedChildren.hasOwnProperty(key)) {
                    continue;
                }
                ret.children = ret.children.concat([buildReactTree(renderedChildren[key])]);
            }
        }
        else if (ReactTestUtils.isCompositeComponent(root)) {
            ret.children = ret.children.concat([buildReactTree(root._renderedComponent)]);
        }
        return ret;
    }
    /* eslint-enable */

    /**
     * Convert a CSS selector into an AST.
     * @param  {String} selector Selector to parse
     * @return {Object}          Parsed selector rule
     * @throws Exception         If selector cannot be parsed
     */
    function parseCssSelector(selector){
        var parser = new CssSelectorParser();
        parser.registerAttrEqualityMods('^', '$', '*', '~');
        var ruleSet = parser.parse(selector);
        if(ruleSet.type !== 'ruleSet'){
            throw new Error('Cannot currently parse multiple rules. You must only provide a single CSS selector.');
        }
        return ruleSet;
    }

    /**
     * Validate that rules are simple and don't include parsing we don't yet support
     * @param  {Object} rule Rule definition to parse
     * @throws {Error}       If rule contains unsupported syntax
     */
    function validateParsedCssRule(rule){
        if(rule.pseudos){
            if(rule.pseudos.length > 1){
                throw new Error("Only a single pseudo selector at a time is supported.");
            }
            rule.pseudos = rule.pseudos[0];
            if(supportedPsuedoSelectors.indexOf(rule.pseudos.name) === -1 ){
                throw new Error("The '" + rule.pseudos.name + "' pseudo selector is currently not supported.");
            }
        }
        if(rule.nestingOperator){
            throw new Error("Nesting operators are currently not supported.");
        }
    }

    /**
     * Recursive function to find all nodes that match the provided rule.
     * @param  {ReactElement} root         The root node to search within
     * @param  {Object}       rule         Parsed CSS rule to match
     * @param  {Bool}         omitRootNode Whether we should ignore the root element from rule matching. If set to true only children will be matched
     * @return {Array}                     Array of matching results
     */
    function findAllElementsWithSelector(root, rule, omitRootNode){
        var matches = ReactTestUtils.findAllInRenderedTree(root, elementRuleMatcher(root, rule, omitRootNode)),
            subRule = rule.rule;
        if(subRule){
            var subMatches = [];
            validateParsedCssRule(subRule);
            for(var i = 0; i < matches.length; i++){
                subMatches = subMatches.concat(findAllElementsWithSelector(matches[i], subRule, true));
            }
            return subMatches;
        }
        return matches;
    }

    /**
     * Generates matcher function to pass into the React TestUtils findAllInRenderedTree given the
     * rule to match
     * @param  {ReactElement} root     The root node to search within
     * @param  {Object}       rule     Parsed CSS rule to match
     * @param  {Bool}         omitRoot Whether we should ignore the root element from rule matching. If set to true only children will be matched
     * @return {Function}              Matcher function which checks against tag names and class names
     */
    function elementRuleMatcher(root, rule, omitRoot){
        return function(element){
            if(omitRoot && element === root){
                return false;
            }
            return SelectorMatchers.doesElementMatchSelector(element, rule);
        };
    }

    return {
        /**
         * Replaces a specific React component with an empty React div during the React render cycle.
         * It's useful to be able to test a component without having it's child components execute and render.
         *
         * @param {String|Object} componentName - Name of the component to replace or object of components to replace.
         *                                        If object, each key should be the name of the component to replace
         *                                        and the values are the optional options to augment.
         * @param {Object=} additionalOptions - Object of div tag attributes to pass to mocked replacement div (className, id, etc).
         * @return {Object} - The newly created Jasmine spy.
         */
        mockReactComponent: function(componentName, additionalOptions){
            if(typeof componentName === 'string'){
                var tempComponentName = {};
                tempComponentName[componentName] = additionalOptions || {};
                componentName = tempComponentName;
            }

            var componentList = _.keys(componentName);

            return spyOn(React, 'createElement').and.callFake(function(){
                var args = Array.prototype.slice.call(arguments),
                    type = args[0];
                //If createElement is called with the component requested, replace it with
                //an empty div and overwrite it's options with what was provided or an empty object
                var displayName;
                if(type){
                    displayName = type.displayName || type.name;
                }
                if(displayName && componentList.indexOf(displayName) > -1){
                    args[0] = 'div';
                    //Merge options if present. Allow calls to add/overwrite values
                    args[1] = args[1] ?
                        _.assign(args[1], componentName[displayName]) :
                        componentName[displayName];
                }
                return originalCreateElement.apply(React, args);
            });
        },

        /**
         * Returns a rendered React component that requires the react-router.
         * @param  {Object} Router         Instance of react-router Router class.
         * @param  {Object} reactComponent React component instance to render
         * @param  {Object} props          Properties to add to rendered component
         * @param  {String} path           Path necessary to render. If component uses a <Router.Link> component, it's 'to'
         *                                 attribute must exist as a path, so pass in the same name here.
         * @return {Object}                Rendered instance of the reactComponent
         */
        getRouterComponent: function(Router, reactComponent, props, path) {
            var component;
            var div = document.createElement('div');
            var routes = React.createElement(Router.Route, {name: path, handler: reactComponent});
            var loc = new TestLocation(['/' + path], Router);
            props = props || {};

            Router.run(routes, loc, function (Handler) {
                var mainComponent = React.render(React.createElement(Handler, React.__spread({}, props)), div);
                component = ReactTestUtils.findRenderedComponentWithType(mainComponent, reactComponent);
            });

            return component;
        },

        /**
         * Finds a list of React elements that match the given CSS selector. CSS selector is expected to on contain a
         * single simple rule which uses only class names and element types. Examples:
         *
         *      div.main-content
         *      .section-title.home
         *      ul.item-list li.last span
         *
         * @param  {ReactElement} root     Root node to search within
         * @param  {String}       selector Simple CSS selector to query
         * @return {Array}                 List of results
         */
        scryRenderedDOMComponentsWithSelector: function(root, selector){
            if(typeof selector !== 'string'){
                throw new Error("You must provide a string selector to scryRenderedDOMComponentsWithSelector.");
            }
            var parsedRule = parseCssSelector(selector);
            var rule = parsedRule.rule;
            validateParsedCssRule(rule);

            //Some selectors end up causing multiple of the same elements to get selected so
            //run a unique on the results to make sure we don't get duplicates.
            return _.uniq(findAllElementsWithSelector(root, rule));
        },

        /**
         * Similar to scryRenderedDOMComponentsWithSelector but expects to only find a single
         * result. Will throw an exception if 0 or 2+ elements are found.
         * @param  {ReactElement} root     Root node to search within
         * @param  {String}       selector Simple CSS selector to query
         * @return {ReactElement}          Single found element
         * @throws Exception               If no items were found or more than 1 were found
         */
        findRenderedDOMComponentWithSelector: function(root, selector){
            if(typeof selector !== 'string'){
                throw new Error("You must provide a string selector to scryRenderedDOMComponentsWithSelector.");
            }

            var matches = this.scryRenderedDOMComponentsWithSelector(root, selector);
            if(matches.length !== 1){
                throw new Error("Did not find exactly one match (found: " + matches.length + ") for selector: " + selector);
            }
            return matches[0];
        },

        /**
         * Determines if the number of elements found with the provided class name in the tree is equal to the
         * expected size provided.
         * @param  {ReactElement} root      Rendered React element to check
         * @param  {String}       className Classname to look for
         * @param  {number}       [count=1] Number of times it should appear, defaults to 1 if not provided
         * @return {Bool}                   True if component with class name was found the correct number of times
         * @throws Exception                If element was not found the expected number of times
         */
        findComponentCountWithClassname: function(root, className, count){
            if(!count && count !== 0){
                count = 1;
            }
            var matches = ReactTestUtils.scryRenderedDOMComponentsWithClass(root, className);
            if(matches.length === count){
                return true;
            }
            throw new Error('Expected to find ' + count + ' elements with class "' + className + '", but instead found ' + matches.length);
        },

        /**
         * Determines if the number of elements found with the provided tag name in the tree is equal to the
         * expected size provided.
         * @param  {ReactElement} root      Rendered React element to check
         * @param  {String}       tagName   DOM tag name to look for
         * @param  {number}       [count=1] Number of times it should appear, defaults to 1 if not provided
         * @return {Bool}                   True if component with class name was found the correct number of times
         * @throws Exception                If element was not found the expected number of times
         */
        findComponentCountWithTag: function(root, tagName, count){
            if(!count && count !== 0){
                count = 1;
            }
            var matches = ReactTestUtils.scryRenderedDOMComponentsWithTag(root, tagName);
            if(matches.length === count){
                return true;
            }
            throw new Error('Expected to find ' + count + ' elements with tag "' + tagName + '", but instead found ' + matches.length);
        },

        /**
         * Determines if the number of elements found with the provided selector is equal to the
         * expected size provided.
         * @param  {ReactElement} root      Rendered React element to check
         * @param  {String}       selector  Simple CSS selector to find
         * @param  {number}       [count=1] Number of times it should appear, defaults to 1 if not provided
         * @return {Bool}                   True if components matching selector were found the expected number of times
         * @throws Exception                If element was not found the expected number of times
         */
        findComponentCountWithSelector: function(root, selector, count){
            if(!count && count !== 0){
                count = 1;
            }
            var matches = this.scryRenderedDOMComponentsWithSelector(root, selector);
            if(matches.length === count){
                return true;
            }
            throw new Error('Expected to find ' + count + ' elements with selector "' + selector + '", but instead found ' + matches.length);
        }
    };
});

