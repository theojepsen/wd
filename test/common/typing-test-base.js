var CoffeeScript, Express, altKey, altKeyTracking, async, clearAndCheck, click, enterKey, executeCoffee, inputAndCheck, keysAndCheck, nullKey, preventDefault, returnKey, should, test, typeAndCheck, unbind, valueShouldEqual, wd;

CoffeeScript = require('coffee-script');

should = require('should');

async = require('async');

Express = require('./express').Express;

wd = require('./wd-with-cov');

altKey = wd.SPECIAL_KEYS.Alt;

nullKey = wd.SPECIAL_KEYS.NULL;

returnKey = wd.SPECIAL_KEYS.Return;

enterKey = wd.SPECIAL_KEYS.Enter;

executeCoffee = function(browser, script, done) {
  var scriptAsJs;
  scriptAsJs = CoffeeScript.compile(script, {
    bare: 'on'
  });
  return browser.execute(scriptAsJs, function(err) {
    should.not.exist(err);
    return done(null);
  });
};

valueShouldEqual = function(browser, element, expected, done) {
  return browser.getValue(element, function(err, res) {
    should.not.exist(err);
    res.should.equal(expected);
    return done(null);
  });
};

click = function(browser, _sel, done) {
  return browser.elementByCss(_sel, function(err, inputField) {
    should.not.exist(err);
    should.exist(inputField);
    return browser.clickElement(inputField, function(err) {
      should.not.exist(err);
      return done(null);
    });
  });
};

typeAndCheck = function(browser, _sel, chars, expected, done) {
  return browser.elementByCss(_sel, function(err, inputField) {
    should.not.exist(err);
    should.exist(inputField);
    return async.series([
      function(done) {
        return browser.type(inputField, chars, function(err) {
          should.not.exist(err);
          return done(null);
        });
      }, function(done) {
        return valueShouldEqual(browser, inputField, expected, done);
      }
    ], function(err) {
      should.not.exist(err);
      return done(null);
    });
  });
};

keysAndCheck = function(browser, _sel, chars, expected, done) {
  return browser.elementByCss(_sel, function(err, inputField) {
    should.not.exist(err);
    should.exist(inputField);
    return async.series([
      function(done) {
        return browser.moveTo(inputField, function(err) {
          should.not.exist(err);
          return done(null);
        });
      }, function(done) {
        return browser.keys(chars, function(err) {
          should.not.exist(err);
          return done(null);
        });
      }, function(done) {
        return valueShouldEqual(browser, inputField, expected, done);
      }
    ], function(err) {
      should.not.exist(err);
      return done(null);
    });
  });
};

inputAndCheck = function(browser, method, _sel, chars, expected, done) {
  switch (method) {
    case 'type':
      return typeAndCheck(browser, _sel, chars, expected, done);
    case 'keys':
      return keysAndCheck(browser, _sel, chars, expected, done);
  }
};

clearAndCheck = function(browser, _sel, done) {
  return browser.elementByCss(_sel, function(err, inputField) {
    should.not.exist(err);
    should.exist(inputField);
    return async.series([
      function(done) {
        return browser.clear(inputField, function(err) {
          should.not.exist(err);
          return done(null);
        });
      }, function(done) {
        return valueShouldEqual(browser, inputField, "", done);
      }
    ], function(err) {
      should.not.exist(err);
      return done(null);
    });
  });
};

preventDefault = function(browser, _sel, eventType, done) {
  var script;
  script = "$('" + _sel + "')." + eventType + " (e) ->\n  e.preventDefault()";
  return executeCoffee(browser, script, done);
};

unbind = function(browser, _sel, eventType, done) {
  var script;
  script = "$('" + _sel + "').unbind '" + eventType + "' ";
  return executeCoffee(browser, script, done);
};

altKeyTracking = function(browser, _sel, done) {
  var script;
  script = "f = $('" + _sel + "')\nf.keydown (e) ->\n  if e.altKey\n    f.val 'altKey on'\n  else\n    f.val 'altKey off'\n  e.preventDefault()";
  return executeCoffee(browser, script, done);
};

test = function(remoteWdConfig, desired) {
  var browser, browserName, express, testMethod;
  browser = null;
  browserName = desired !== null ? desired.browserName : 0;
  express = new Express();
  before(function(done) {
    express.start();
    return done(null);
  });
  after(function(done) {
    express.stop();
    return done(null);
  });
  testMethod = function(method, sel) {
    return describe("method:" + method, function() {
      return describe("sel:" + sel, function() {
        describe("1/ click", function() {
          return it("should work", function(done) {
            return click(browser, sel, done);
          });
        });
        if (!(method === 'keys' && (browserName === 'chrome'))) {
          describe("1/ typing nothing", function() {
            return it("should work", function(done) {
              return inputAndCheck(browser, method, sel, "", "", done);
            });
          });
        }
        if (method !== 'keys') {
          describe("2/ typing []", function() {
            return it("should work", function(done) {
              return inputAndCheck(browser, method, sel, [], "", done);
            });
          });
        }
        describe("3/ typing 'Hello'", function() {
          return it("should work", function(done) {
            return inputAndCheck(browser, method, sel, 'Hello', 'Hello', done);
          });
        });
        describe("4/ clear", function() {
          return it("should work", function(done) {
            return clearAndCheck(browser, sel, done);
          });
        });
        describe("5/ typing ['Hello']", function() {
          return it("should work", function(done) {
            return inputAndCheck(browser, method, sel, ['Hello'], 'Hello', done);
          });
        });
        describe("6/ clear", function() {
          return it("should work", function(done) {
            return clearAndCheck(browser, sel, done);
          });
        });
        describe("7/ typing ['Hello',' ','World','!']", function() {
          return it("should work", function(done) {
            return inputAndCheck(browser, method, sel, ['Hello', ' ', 'World', '!'], 'Hello World!', done);
          });
        });
        describe("8/ clear", function() {
          return it("should work", function(done) {
            return clearAndCheck(browser, sel, done);
          });
        });
        describe("9/ typing 'Hello\\n'", function() {
          return it("should work", function(done) {
            var expected;
            expected = (sel.match(/input/) ? 'Hello' : 'Hello\n');
            return inputAndCheck(browser, method, sel, 'Hello\n', expected, done);
          });
        });
        describe("10/ typing '\\r'", function() {
          return it("should work", function(done) {
            if (browserName === 'chrome' || (process.env.GHOSTDRIVER_TEST)) {
              // chrome chrashes when sent '\r', ghostdriver does not
              // seem to like it
              inputAndCheck(browser, method, sel, [returnKey], (sel.match(/input/) ? 'Hello' : 'Hello\n\n'), done);
            } else {
              inputAndCheck(browser, method, sel, '\r', (sel.match(/input/) ? 'Hello' : 'Hello\n\n'), done);
            }
          });
        });
        describe("11/ typing [returnKey]", function() {
          return it("should work", function(done) {
            var expected;
            expected = (sel.match(/input/) ? 'Hello' : 'Hello\n\n\n');
            return inputAndCheck(browser, method, sel, [returnKey], expected, done);
          });
        });
        describe("12/ typing [enterKey]", function() {
          return it("should work", function(done) {
            var expected;
            expected = (sel.match(/input/) ? 'Hello' : 'Hello\n\n\n\n');
            return inputAndCheck(browser, method, sel, [enterKey], expected, done);
          });
        });
        describe("13/ typing ' World!'", function() {
          return it("should work", function(done) {
            var expected;
            expected = (sel.match(/input/) ? 'Hello World!' : 'Hello\n\n\n\n World!');
            return inputAndCheck(browser, method, sel, ' World!', expected, done);
          });
        });
        describe("14/ clear", function() {
          return it("should work", function(done) {
            return clearAndCheck(browser, sel, done);
          });
        });
        describe("15/ preventing default on keydown", function() {
          return it("should work", function(done) {
            return preventDefault(browser, sel, 'keydown', done);
          });
        });
        describe("16/ typing 'Hello'", function() {
          return it("should work", function(done) {
            return inputAndCheck(browser, method, sel, 'Hello', '', done);
          });
        });
        describe("17/ unbinding keydown", function() {
          return it("should work", function(done) {
            return unbind(browser, sel, 'keydown', done);
          });
        });
        describe("18/ typing 'Hello'", function() {
          return it("should work", function(done) {
            return inputAndCheck(browser, method, sel, 'Hello', 'Hello', done);
          });
        });
        describe("19/ clear", function() {
          return it("should work", function(done) {
            return clearAndCheck(browser, sel, done);
          });
        });
        describe("20/ preventing default on keypress", function() {
          return it("should work", function(done) {
            return preventDefault(browser, sel, 'keypress', done);
          });
        });
        describe("21/ typing 'Hello'", function() {
          return it("should work", function(done) {
            return inputAndCheck(browser, method, sel, 'Hello', '', done);
          });
        });
        describe("22/ unbinding keypress", function() {
          return it("should work", function(done) {
            return unbind(browser, sel, 'keypress', done);
          });
        });
        describe("23/ typing 'Hello'", function() {
          return it("should work", function(done) {
            return inputAndCheck(browser, method, sel, 'Hello', 'Hello', done);
          });
        });
        describe("24/ clear", function() {
          return it("should work", function(done) {
            return clearAndCheck(browser, sel, done);
          });
        });
        describe("25/ preventing default on keyup", function() {
          return it("should work", function(done) {
            return preventDefault(browser, sel, 'keyup', done);
          });
        });
        describe("26/ typing 'Hello'", function() {
          return it("should work", function(done) {
            return inputAndCheck(browser, method, sel, 'Hello', 'Hello', done);
          });
        });
        describe("27/ unbinding keypress", function() {
          return it("should work", function(done) {
            return unbind(browser, sel, 'keyup', done);
          });
        });
        describe("28/ clear", function() {
          return it("should work", function(done) {
            return clearAndCheck(browser, sel, done);
          });
        });
        describe("29/ adding alt key tracking", function() {
          return it("should work", function(done) {
            return altKeyTracking(browser, sel, done);
          });
        });
        describe("30/ typing ['a']", function() {
          return it("should work", function(done) {
            return inputAndCheck(browser, method, sel, ['a'], 'altKey off', done);
          });
        });
        describe("31/ typing [altKey,nullKey,'a']", function() {
          return it("should work", function(done) {
            return inputAndCheck(browser, method, sel, [altKey, nullKey, 'a'], 'altKey off', done);
          });
        });
        describe("32/ typing [altKey,'a']", function() {
          return it("should work", function(done) {
            return inputAndCheck(browser, method, sel, [altKey, 'a'], 'altKey on', done);
          });
        });
        if (!process.env.GHOSTDRIVER_TEST) {
          describe("33/ typing ['a']", function() {
            return it("should work", function(done) {
              var expected;
              expected = (method === 'type' ? 'altKey off' : 'altKey on');
              return inputAndCheck(browser, method, sel, ['a'], expected, done);
            });
          });
        }
        describe("34/ clear", function() {
          return it("should work", function(done) {
            return clearAndCheck(browser, sel, done);
          });
        });
        describe("35/ typing [nullKey]", function() {
          return it("should work", function(done) {
            return inputAndCheck(browser, method, sel, [nullKey], '', done);
          });
        });
        describe("36/ typing ['a']", function() {
          return it("should work", function(done) {
            return inputAndCheck(browser, method, sel, ['a'], 'altKey off', done);
          });
        });
        describe("37/ clear", function() {
          return it("should work", function(done) {
            return clearAndCheck(browser, sel, done);
          });
        });
        return describe("38/ unbinding keydown", function() {
          return it("should work", function(done) {
            return unbind(browser, sel, 'keydown', done);
          });
        });
      });
    });
  };
  describe("wd.remote", function() {
    return it("should work", function(done) {
      browser = wd.remote(remoteWdConfig);
      if (!process.env.WD_COV) {
        browser.on("status", function(info) {
          return console.log("\u001b[36m%s\u001b[0m", info);
        });
        browser.on("command", function(meth, path) {
          return console.log(" > \u001b[33m%s\u001b[0m: %s", meth, path);
        });
      }
      return done(null);
    });
  });
  describe("init", function() {
    return it("should work", function(done) {
      return browser.init(desired, function(err) {
        should.not.exist(err);
        return done(err);
      });
    });
  });
  describe("get", function() {
    return it("should work", function(done) {
      return browser.get("http://127.0.0.1:8181/type-test-page.html", function(err) {
        should.not.exist(err);
        return done(null);
      });
    });
  });
  testMethod("type", "#type input");
  testMethod("keys", "#type input");
  testMethod("type", "#type textarea");
  testMethod("keys", "#type textarea");
  return describe("quit", function() {
    return it("should work", function(done) {
      return browser.quit(function(err) {
        should.not.exist(err);
        return done(err);
      });
    });
  });
};

exports.test = test;
