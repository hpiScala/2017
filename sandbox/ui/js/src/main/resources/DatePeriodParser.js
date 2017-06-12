var DatePeriodParser = (function(){
  var periodParser = {}; // the singleton object to be created, also: return value of this function
  var delimiter = "-";
  var periodDelimiter = "/";
  var numWords = {"two": 2, "three": 3, "four":4, "five":5, "six":6, "seven":7, "eight":8, "nine":9, "ten":10};
  var regexNumWord = new RegExp("^\\s*("+Object.keys(numWords).join("|")+")\\s*");
  var regexYear = /^\s*(\d{4})(?:(\D)?(\d{1,2})(?:\2(\d{1,2})(?:\s+(\d{2}:\d{2}:\d{2}))?)?)?\s*$/;
  var months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  var periodData = {};

  var rangeText = function(range) {
    return dateRangeText(range.from, range.to);
  };

  var dateText = function(date) {
    return date.toDateString();
  };

  var dateRangeText = function(d1, d2) {
    return [dateText(d1),  delimiter, dateText(d2)].join(" ");
  };

  var month_range = function(month) {
    if(!month) {
      month = 0;
    }
    return function(diff, base) {
      var date = new Date();
      date.setMonth(month);
      if(diff) {
        date.setFullYear(date.getFullYear() + diff);
      }
      if(base) {
        date.setFullYear(base);
      }
      return {
        from : new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0),
        to   : new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
      };
    };
  };


  var first = function() {
    return 1;
  };

  var second = function() {
    return 2;
  };

  var third = function() {
    return 3;
  };

  var fourth = function() {
    return 4;
  };

  var previous = function(arg) {
    return -arg || -1;
  };

  var next = function(arg) {
    return arg || 1;
  };

  var current = function() {
    return 0;
  };


  var quarter = function(diff, base) {
    var date = new Date();
    var year = date.getFullYear();
    var start = Math.floor(date.getMonth()/3)*3;
    var end = start + 3;
    if(diff < 0) {
      end = start;
      start = start + 3 * diff;
    } else if (diff > 0) {
      // 1st 2nd etc, NOT ''next 5 quarters'
      start = (diff - 1) * 3;
      end = diff * 3;
    }
    if(base) {
      year = base;
    }

    return {
      from : new Date(year, start, 1, 0, 0, 0, 0),
      to   : new Date(year, end, 0, 23, 59, 59, 999)
    };
  };

  var month = function(diff, base) {
    var date = new Date();
    var start = date.getMonth();
    var end = start;
    var year = date.getFullYear();

    if(diff > 0) {
      start = start + 1;
      end = start + diff;
    } else if(diff < 0 ){
      start = start + diff;
    } else {
      end = end + 1;
    }
    if(base) {
      year = base;
    }
    return {
      from : new Date(year, start, 1, 0, 0, 0, 0),
      to   : new Date(year, end, 0, 23, 59, 59, 999)
    };
  };

  var year = function(diff, base) {
    var date = new Date();
    var start = date.getFullYear();
    var end = start;

    if(diff) {
      if(diff<0) {
        start = start + diff;
        end = end - 1;
      } else {
        end = end + diff;
      }
    }

    return {
      from : new Date(start, 0, 1, 0, 0, 0, 0),
      to   : new Date(end, 11, 31, 23, 59, 59, 999)
    };
  };

  var week = function(diff, base) {
    var date = new Date();
    var offset = date.getDay(); // day of week - 0 is sunday!
    var start = date.getDate() - offset + 1; // we start on monday
    var end = start + 6;

    if(diff) {
      if(diff>0) {
        start = end + 1;
        end = end + 7 * diff;
      } else {
        end = start;
        start = start + 7 * diff;
      }
    }
    // does something like 'last 5 weeks 2012' or 'last week 2012' make sense?
    // if(base) {
    //   date.setFullYear(base);
    // }
    return {
      from : new Date(date.getFullYear(), date.getMonth(), start, 0, 0, 0, 0),
      to   : new Date(date.getFullYear(), date.getMonth(), end, 23, 59, 59, 999)
    };
  };

  var argNum = function(num) {
    if( num ) {
      if (num.search(/^\d+$/) !== -1) {
        return num;
      } else {
        var m = regexNumWord.exec(num);
        if(m) {
          return numWords[m[1]];
        }
      }
      return false;
    } else {
      return [2,3,4,5];
    }
  };

  var word = function(words, func, chop, month, checkArg) {
    if(typeof checkArg !== 'function') {
      checkArg = function(arg) { return false; };
    }
    if(chop) {
      if(typeof chop !== 'function') {
        chop = function(s) { return s.slice(0, -1); };
      }
    } else {
      chop = function(s) { return s; };
    }
    return {
      words: words,
      function: func,
      chop: chop,
      month: month,
      checkArg: checkArg
    };
  };

  // "grammar" -> "localization" here
  var specials = [ word(['first', '1st'], first),
                   word(['second', '2nd'], second),
                   word(['third', '3rd'], third),
                   word(['fourth', '4th'], fourth) ];
  var prefixes = [ word(['this', 'current'], current),
                   word(['last', 'previous'], previous, false, false, argNum)];
  var nouns = [ word(['quarters'], quarter, true),
                word(['years'], year, true),
                word(['months'], month, true),
                word(['weeks'], week, true)];
  months.forEach(function(month, index){
    nouns.push(word([month], month_range(index), false, true));
  });

  // shortcut for specials array
  var quarters = [nouns[0]];

  var startsWith = function(s, w) {
    return s.slice(0, w.length) === w;
  };

  var equals = function(s, w) {
    return s === w;
  };

  // check if input equals word;
  // takes care of 's' extensions in 'quarters' etc.
  // var checkword = function(input, word, type) {
  //   return (input === word || (type.chop && input === word.slice(0, -1)));
  // };

  var forEachWord = function(types, fun) {
    return types.reduce(function(found, type) {
      return type.words.reduce(function(found, word) {
        var rc = fun(word, type);
        return (rc === undefined ? true : rc) || found;
      }, found);
    }, false);
  };

  var forEachWordCheck = function(check) {
    return function(types, input, fun) {
      return forEachWord(types, function(word, type){
        if(check(word, input)){
          return fun(word, type);
        }
        return false;
      });
    };
  };

  var forEachWordStartsWith = forEachWordCheck(startsWith);

  var forEachWordEquals =  forEachWordCheck(equals);

  //  var forEachWordStartsWith = function(types, input, fun) {
  //   return forEachWord(types, function(word, type){
  //     if(startsWith(word, input)){
  //       return fun(word, type);
  //     }
  //     return false;
  //   });
  // };

  // var forEachWordEquals = function(types, input, fun) {
  //   return forEachWord(types, function(word, type){
  //     if(input === type.chop(word)){
  //       return fun(word, type);
  //     }
  //     return false;
  //   });
  // };

  var createSuggestions = function(suggestions, from) {
    return function(words, range) {
      var text1 = words.join(" ");
      if (text1 == "1st quarter" || text1 == "first quarter")
        return;
      if (text1  == "2nd quarter" || text1 == "second quarter")
        return;
      if (text1 == "3rd quarter" || text1 == "third quarter")
        return;
      if (text1  == "4th quarter" || text1 == "fourth quarter")
        return;

      // only use from if it starts later than our suggestion
      if(from) {
        if(from.from > range.from) return;
        // equals compares objects, so we need to compare time values
        if(from.from.getTime() === range.from.getTime() && from.to.getTime() === range.to.getTime()) return;
        range.from = from.from;
        text1 = [from.text1, delimiter, text1].join(" ");
      }
      if(range.from < range.to) {
        suggestions.push({type: "daterange",
                          subtype: "natural",
                          from: range.from,
                          to: range.to,
                          text1: text1,
                          text2: rangeText(range)});
      }
    };
  };

  var suggestDates = function(inputs, companyCode, from) {
    var suggestions = [];
    if(!from || (from && from.type === "daterange")) {
      var createSuggestion = createSuggestions(suggestions, from);
      var found;

      if(inputs.length==1) {
        // special case for 1st/2nd/3rd/4th quarter
        found = forEachWordStartsWith(specials, inputs[0], function(sword, special){
          forEachWord(quarters, function(qword, quarter){
            createSuggestion([sword, quarter.chop(qword)], quarter.function(special.function()));
          });
        });

        // <prefix> [<arg>] <word>
        found = forEachWordStartsWith(prefixes, inputs[0], function(pword, prefix){
          forEachWord(nouns, function(nword, noun) {
            // <prefix> <word>
            createSuggestion([pword, noun.chop(nword)], noun.function(prefix.function()));
            // <prefix> <arg> <word> - months do not make sense here
            var args = prefix.checkArg();
            if(args && !noun.month) {
                args.forEach(function(arg){
                  createSuggestion([pword, arg, nword], noun.function(prefix.function(arg)));
                });
            }
          });
        });

        // [<prefix>] <word>
        if(!found) {
          forEachWordStartsWith(nouns, inputs[0], function(nword, noun){
            // <word>
            createSuggestion([noun.chop(nword)], noun.function());
            // <prefix> <word>
            prefixes.forEach(function(prefix) {
              var r = noun.function(prefix.function());
              prefix.words.forEach(function(pword) {
                createSuggestion([pword, noun.chop(nword)], r);
              });
            });
          });
        }

      } else if(inputs.length==2){
        //  <prefix> <arg> -> <prefix> <arg> <word>
        //  <prefix> <word> -> <prefix> (<arg>) <word>
        //  <word> <postfix> -> <word> <postfix>

        var y = (new Date()).getFullYear();
        // special case for 1st/2nd/3rd/4th quarter
        forEachWordStartsWith(specials, inputs[0], function(word, special){
          forEachWordEquals(quarters, inputs[1], function(qword, quarter){
            createSuggestion([word, quarter.chop(qword)], quarter.function(special.function()));
            for(var j=y; j>y-5; j--) {
              createSuggestion([word, qword, j], quarter.function(special.function(), j));
            }
          });
        });

        // check prefixes - only full matches
        found = forEachWordEquals(prefixes, inputs[0], function(pword, prefix){
          // <prefix> <arg> <word>
          var arg = prefix.checkArg(inputs[1]);
          if(arg) {
            forEachWord(nouns, function(nword, noun){
              if(!noun.month) {
                // use original input for suggestion; arg only for computation (case: "ten" -> 10)
                createSuggestion([pword, inputs[1], nword], noun.function(prefix.function(arg)));
              }
            });
          } else {
            // <prefix> <word> [<arg>]
            forEachWordStartsWith(nouns, inputs[1], function(nword, noun) {
              // <prefix> <word>
              createSuggestion([pword, noun.chop(nword)], noun.function(prefix.function()));
              // <prefix> <word> <arg> - months do not make sense here
              var args = prefix.checkArg();
              if( args && !noun.month) {
                args.forEach(function(arg){
                  createSuggestion([pword, arg, nword], noun.function(prefix.function(arg)));
                });
              }
            });
          }
        });

        if(!found) {
          // <word> <postfix>
          forEachWordEquals(nouns, inputs[0], function(nword, noun){
            createSuggestion([noun.chop(nword), inputs[1]], noun.function(null, inputs[1]));
          });
        }

      } else if(inputs.length===3){
        //  <prefix> <arg> <word> -> <prefix> <arg> <word> [<postfix>]
        //  makes no sense for now: <prefix> <word> <postfix> -> <prefix> <word> <postfix>

        // special case for 1st/2nd/3rd/4th quarter
        forEachWordEquals(specials, inputs[0], function(sword, special){
          forEachWordEquals(quarters, inputs[1], function(qword, quarter){
            createSuggestion([sword, quarter.chop(qword), inputs[2]],  quarter.function(special.function(), inputs[2]));
          });
        });

        forEachWordEquals(prefixes, inputs[0], function(pword, prefix) {
          var arg = prefix.checkArg(inputs[1]);
          if(arg) {
            // <prefix> <arg> <word> [<postfix>]
            forEachWordStartsWith(nouns, inputs[2], function(nword, noun) {
              if(!noun.month) {
                createSuggestion([pword, inputs[1], noun.chop(nword)], noun.function(prefix.function(arg)));
              }
            });
          }
          //  else {
          //   // <prefix> <word> <postfix>
          //   forEachWordEquals(nouns, inputs[1], function(nword, noun) {
          //     createSuggestion([pword, nword, inputs[2]],   noun.function(prefix.function(), inputs[2]));
          //   });
          // }
        });
      }
    }

    return suggestions;
  };

  var suggestYears = function(inputs, companyCode, from) {
    var suggestions = [];
    if(!from || (from && from.type === "daterange")) {
      // Js parses 1-12 as month, 13-99 is invalid date, 100 - x>100 as year
      if(inputs.length<=1){
        var s = inputs[0]; // we can suggest years for empty string such as current year
        var length = s.length;
        var today = new Date();
        var displaycount = 3;
        // check if number is prefix of current year an if, suggest it
        var curyear = today.getFullYear()+"";
        // only check for years if we start with a digit or empty string
        if(!s || s.search(/^\d+/) !== -1) {
          if(length<4) {
            if(s === "" || curyear.lastIndexOf(s)===0){
              //s is a prefix of current year
              var nfrom;
              var to;
              var text1;
              // last digit(s) missing, suggest current + last 2 years
              if(from && from.from) {
                // also display from year as range
                for(var i=0; i<displaycount+1; i++){
                  nfrom = from.from;
                  to = new Date(nfrom.getFullYear()+i, 12, 0, 23, 59, 59, 999);
                  if(i===0) {
                    text1 = nfrom.getFullYear();
                  } else {
                    text1 = nfrom.getFullYear() + " - " + to.getFullYear();
                  }
                  suggestions.push({type : "daterange", from : nfrom, to : to, text1: text1, text2 :  dateRangeText(nfrom, to)});
                }
              } else {
                // suggest single years
                for(var i=0; i<displaycount; i++){
                  nfrom = new Date(today.getFullYear()-i, 0, 1, 0, 0, 0);
                  to = new Date(today.getFullYear()-i, 12, 0, 23, 59, 59, 999);
                  text1 = nfrom.getFullYear();
                  suggestions.push({type : "daterange", from : nfrom, to : to, text1: text1, text2 :  dateRangeText(nfrom, to)});
                }
                // suggest ranges - separated for proper order
                for(var i=0; i<displaycount; i++){
                  if(!from){
                    nfrom = new Date(today.getFullYear()-(i+1), 0, 1, 0, 0, 0);
                    to = new Date(today.getFullYear(), 12, 0, 23, 59, 59, 999);
                    text1 = nfrom.getFullYear() + " - " + to.getFullYear();
                    suggestions.push({type : "daterange", from : nfrom, to : to, text1: text1, text2 :  dateRangeText(nfrom, to)});
                  }
                }
              }
            }
          } else {
            var d = periodParser.parseDate(s);
            if (d && !isNaN(d.getTime())) {
              var nfrom;
              var to;
              var text1;
              nfrom = new Date(d);
              // year, return it
              var year = nfrom.getFullYear();
              to = new Date(nfrom);
              to.setMonth(12);
              to.setSeconds(-1);
              text1 = year;
              if(!from){
                suggestions.push({type : "daterange", from : nfrom, to : to, text1: text1, text2 :  dateRangeText(nfrom, to)});
                if(length<3) {
                  // month, suggest current and last 2 years
                  year = today.getFullYear();
                  for(var i=0; i<displaycount; i++){
                    nfrom.setFullYear(year-i);
                    to = new Date(nfrom);
                    to.setMonth(nfrom.getMonth()+1);
                    to.setSeconds(-1);
                    text1 = (nfrom.getMonth()+1)+"/"+nfrom.getFullYear();
                    suggestions.push({type : "daterange", from : nfrom, to : to, text1: text1, text2 :  dateRangeText(nfrom, to)});
                  }
                } else {
                  // add ranges for next years as well
                  for(var i=0; i<displaycount; i++){
                    to = new Date(nfrom);
                    to.setFullYear(year+i+1);
                    to.setMonth(12);
                    to.setSeconds(-1);
                    text1 = year + " - " + to.getFullYear();
                    suggestions.push({type : "daterange", from : nfrom, to : to, text1: text1, text2 :  dateRangeText(nfrom, to)});
                  }
                }
              } else if( from.from && length >=4 ) {
                nfrom = from.from;
                to = new Date(d);
                to.setMonth(12);
                to.setSeconds(-1);
                text1 = nfrom.getFullYear() + " - " + to.getFullYear();
                suggestions.push({type : "daterange", from : nfrom, to : to, text1: text1, text2 :  dateRangeText(nfrom, to)});
              }
            }
          }
        }
      }
    }
    return suggestions;
  };

  var suggestQuarters = function(words, CompanyCode, from) {
    var suggestions = [];
    if (from && (from.type !== "period") && (from.type !== "quarter"))
      return suggestions;

    var quarters = [
      ["1st", "first", "Q1", "q1"],
      ["2nd", "second", "Q2", "q2"],
      ["3rd", "third", "Q3", "q3"],
      ["4th", "fourth", "Q4", "q4"]
    ];

    //var periods_for_company_code = period_data.filter(function(period) {return (CompanyCode === period.CompanyCode);});
    var periods_for_company_code = periodData[CompanyCode] || {};

    var fiscalYears = Object.keys(periods_for_company_code).map(
      function(fiscalYear){
        var min = Math.min.apply(null, Object.keys(periods_for_company_code[fiscalYear]));
        var max = Math.max.apply(null, Object.keys(periods_for_company_code[fiscalYear]));
        return {fiscalYear : fiscalYear, from : min, to : max};
      });


    if (from)
      fiscalYears = fiscalYears.reverse();

    fiscalYears.forEach(function(fiscalYear) {
      quarters.forEach(function(quarter, i) {
        var j = 0;
        var chkwrd = function(word) {
          if (word === "")
            return true;
          if (!isNaN(word)) {
            // case: word represents a number
            // word = parseInt(word, 10).toString();
            if (word.length <= 4 && fiscalYear.fiscalYear.slice(0, word.length) === word)
              return true;
            else if (word.length === 2 && fiscalYear.fiscalYear.slice(2, 2 + word.length) === word)
              return true;
            else if (word.length === 1 && fiscalYear.fiscalYear.slice(3, 3 + word.length) === word)
              return true;
          } else {
            if ("quarter".slice(0, word.length) === word)
              return true;
            for (var i in quarter) {
              if (quarter[i].slice(0, word.length) === word) {
                j = i;
                return true;
              }
            }
          }
          return false;
        };

        if (words.every(chkwrd)) {
          var period = periodData[CompanyCode][fiscalYear.fiscalYear];
          if(period && period[fiscalYear.from] && period[fiscalYear.to]) {
            //FIXME: compute actual quarters
            var step = Math.floor((fiscalYear.to-fiscalYear.from)/4);
//            for(var i = fiscalYear.from; i<=fiscalYear.to; i+=step) {
              // var lfrom = period[i][0];
              // var lto = period[i+step-1][1];
            var lfrom = period[fiscalYear.from][0];
            var lto = period[fiscalYear.to][1];
              var text1 = "";
              if (!from) {
                text1 =  quarter[j] + " " + ((j >= 2) ? " " : " quarter ") + fiscalYear.fiscalYear;
              } else if (from.from < from) {
                lfrom = from.from;
                text1 = from.text1 + " - " + quarter[j] + " " + ((j >= 2) ? " " : " quarter ") + fiscalYear.fiscalYear;
              }
              //only add a suggestion if we have one -
              if(text1) {
                suggestions.push({
                  type  : "period",
                  subtype  : "quarter",
                  from  : lfrom,
                  to    : lto,
                  text1 : text1,
                  text2 : "Fiscal Period: " + dateRangeText(lfrom, lto)
                });
              }
            //}
          }
        }
      });
    });

    //FIXME: check for "last quarter"?
    //TODO: fix 'dis sh1t
    // if (words.every(function(word) {return "last".slice(0, word.length) === word || "quarter".slice(0, word.length) === word;}))
    //   suggestions.push({
    //     type  : "period",
    //     subtype : "quarter",
    //     from  : {FiscalYear : "2010", FiscalPeriod : "1"},
    //     to    : {FiscalYear : "2010", FiscalPeriod : "3"},
    //     text1 : "last quarter",
    //     text2 : "Fiscal Period"
    //   });

    return suggestions;
  };

  var suggestPeriods = function(words, CompanyCode, from) {
    var suggestions = [];
    if (from && (from.type !== "period"))
      return suggestions;

    var chkperiod = function (fiscalYear, fiscalPeriod) {
      var chkwrd = function(word) {
        if (word === "")
          return true;
        if (!isNaN(word)) {
          // case: word represents a number
          // word = parseInt(word, 10).toString();
          if (word.length <= 4 && fiscalYear.slice(0, word.length) === word)
            return true;
          else if (word.length <= 2 && fiscalYear.slice(2, 2 + word.length) === word)
            return true;
          else if (word.length <= 3 && fiscalPeriod.slice(0, word.length) === word)
            return true;
        } else {
          // case: word does not represent a number
          if ("period".slice(0, word.length) === word)
            return true;
          var words_of_word = word.split(periodDelimiter);
          if (words_of_word.length === 2 && words_of_word[0].length <= 3 && words_of_word[1].length <= 4) {
            var iperiod = words_of_word[0];
            iperiod = iperiod === "" ? "" : parseInt(iperiod, 10).toString();
            var iyear = words_of_word[1];
            iyear = iyear === "" ? "" : parseInt(iyear, 10).toString();
            if ((iperiod === "" || iperiod === fiscalPeriod) && (iyear === "" || fiscalYear.slice(0, iyear.length) === iyear || fiscalYear.slice(2, 2 + iyear.length) === iyear))
              return true;
          }
        }
        return false;
      };
      return words.every(chkwrd);
    };

    Object.keys(periodData[CompanyCode]).forEach(function(fiscalYear) {
      Object.keys(periodData[CompanyCode][fiscalYear]).forEach(function(fiscalPeriod) {
        if(chkperiod(fiscalYear, fiscalPeriod)) {
          var range = periodData[CompanyCode][fiscalYear][fiscalPeriod];
          var text1 = "";
          if(from) {
            if(from.from < range[1]) {
              text1 = [from.text1, " ", delimiter, " ", fiscalPeriod, periodDelimiter, fiscalYear].join("");
              range[0] = from.from;
            }
          } else {
            text1 = [fiscalPeriod, periodDelimiter, fiscalYear].join("");
          }
          // only add suggestion if it really is one
          if(text1) {
            suggestions.push({type: "period", from: range[0], to: range[1], text1: text1, text2: "Fiscal Period: " + dateRangeText(range[0], range[1])});
          }
        }
      });
    });


    return suggestions;
  };

  var sortSuggestions = function(date) {
    if(!date) {
      date = new Date();
    }
    return function(x, y) {
      // sort based on from distance to 'now' by year
      var a = Math.abs(x.from.getFullYear()-date.getFullYear());
      var b = Math.abs(y.from.getFullYear()-date.getFullYear());
      // same distance: order based on total from distance
      if(a===b) {
        a = Math.abs(x.from.getTime()-date.getTime());
        b = Math.abs(y.from.getTime()-date.getTime());
        // same distance: oder base on time of distance
        if(a===b) {
          a = x.to.getTime() - x.from.getTime();
          b = y.to.getTime() - y.from.getTime();
          // last resort: pick smaller from date
          if(a===b) {
            a = x.from.getFullYear();
            b = y.from.getFullYear();
          }
        }
      }
      return (a>b)-(a<b);
    };
  };
  var dateSorter = sortSuggestions();

  var fromToSuggestor = function(suggestor) {
    var retVal = function(input, CompanyCode) {
      return suggestor(input.fromStrs, CompanyCode).map(function(from){
        return !input.toStrs ? from : suggestor(input.toStrs, CompanyCode, from);
      }).reduce(function(a,b){
        return a.concat(b);
      }, []);
    };
    return retVal;
  };

  var cmp_a = function(a, b) {
    if(a === b) return true;
    return a.every(function (e, i) {
      return e === b[i];
    });
  };
  
  var prepareInputString = function(input) {
    var rc = {
      fromStrs: [""],
      toStrs: undefined,
      compare: function(other) {
        return cmp_a(other.fromStrs, this.fromStrs) && cmp_a(other.toStrs, this.toStrs);
      }
    };
    if(input) {
      var strs = input.toLowerCase().split(delimiter);
      // alway at least an empty string
      rc.fromStrs = strs[0].trim().split(/\s+/);
      if(strs[1]) {
        rc.toStrs = strs[1].trim().split(/\s+/);
      }
    }
    return rc;
  };

  var getUniqify = function(obj) {
    var uniq = obj || {};
    return function(suggestion) {
      if(!uniq[suggestion.text2]) {
        uniq[suggestion.text2] = true;
        return true;
      }
      return false;
    };
  };

  var flatten = function(suggestions) {
    return suggestions.reduce(function(suggestions, suggestion){
        return suggestions.concat(suggestion);
    }, []);
  };

  periodParser.suggest = function(s, limit, uniq) {

    // input string preparation
    var strs = prepareInputString(s);
    // get suggestions
    var suggestions = [];
    suggestions.push(fromToSuggestor(suggestDates)(strs));
    suggestions.push(fromToSuggestor(suggestYears)(strs));
    var periods = [];
    var quarters = [];
    suggestions.push(periods);
    suggestions.push(quarters);
    Object.keys(periodData).forEach(function(companyCode) {
      Array.prototype.push.apply(periods, fromToSuggestor(suggestPeriods)(strs, companyCode));
      Array.prototype.push.apply(quarters, fromToSuggestor(suggestQuarters)(strs, companyCode));
    });

    // uniq elements globally - undefined equals true
    if(uniq || uniq === undefined){
      // get uniq function
      var uniqify = getUniqify();
      suggestions = suggestions.map(function(suggestion){ return suggestion.filter(uniqify);});
    }
    // sort elements per group
    suggestions = suggestions.map(function(suggestion){
      return suggestion.sort(dateSorter);
    });
    // get lengths of groups
    var slength = suggestions.map(function(suggestion){
      return suggestion.length;
    });

    // get total number of (uniq) suggestions
    var total = slength.reduce(function(a, b) { return a + b; });

    if(total<=limit) {
      return flatten(suggestions);
    } else {
      // suggestions per group
      var cnt = Math.floor(limit/suggestions.length);
      // real suggestions per group
      slength = suggestions.map(function(suggestion){
        return Math.min(suggestion.length, cnt);
      });
      // increase count per group until we hit limit
      // -> we can overshoot limit by n-1 for n groups....
      while(slength.reduce(function(a, b) { return a + b; }) < limit){
        cnt++;
        slength = suggestions.map(function(suggestion){
          return Math.min(suggestion.length, cnt);
        });
      }
      return flatten(suggestions.map(function(suggestion, index){
        return suggestion.slice(0, slength[index]);
      }));
    }
  };

  periodParser.parse = function(s) {
    var strs = prepareInputString(s);
    var type = "invalid";
    var text1 = "";
    var text2 = "";

    // check *all* suggestions for exact text match
    var suggestions = [].concat(fromToSuggestor(suggestDates)(strs));
    Object.keys(periodData).forEach(function(companyCode) {
      suggestions = suggestions.concat(fromToSuggestor(suggestQuarters)(strs, companyCode));
      suggestions = suggestions.concat(fromToSuggestor(suggestPeriods)(strs, companyCode));
    });

    if(suggestions.length){
      var found = suggestions.find(function(suggestion, index, array) {
        return strs.compare(prepareInputString(suggestion.text1));
      });
      if(found) return found;
    }

    // fallback: check if we have parseable dates
    var from = this.parseDate(strs.fromStrs.join(" ")); // regexes work with arrays as well
    var to = this.parseDate(strs.toStrs ? strs.toStrs.join(" ") : strs.fromStrs.join(" "), true);
    if(from.getTime() && to.getTime()) {
      type = "daterange";
      text1 = strs.toStrs ? [strs.fromStrs.join(" "), delimiter, strs.toStrs.join(" ")].join(" ") : strs.fromStrs.join(" ");
      text2 = dateRangeText(from, to);
    }
    return {type : type, from : from, to : to, text1 : text1, text2 : text2};
  };

  periodParser.setPeriodData = function(data) {
    if (typeof data !== 'object') {
      throw new TypeError("PeriodData is not of type: object[year][period] = [ from<Date>, to<Date> ]");
    }
    periodData = data;
  };

  periodParser.setDateSorter = function(sorter) {
    if (typeof sorter !== 'function') {
      throw new TypeError("DateSorter is not of type: function(a, b)");
    }
    dateSorter = sorter;
  };

  periodParser.parseDate = function(str, extendRange) {
    // append UTC if we have more than just the year but less than hours because no timezone adjustments are made in this case
    var date;
    var fixDate = false;
    var m = regexYear.exec(str);
    // some prepocessing
    if(m) {
      switch (m[2]) {
      case "-":
        // dashes somehow alter the base value of the date object
        str = str + " UTC";
        fixDate = true;
        break;
      case undefined:
        // only digits -> convert so Date() understands
        //FIXME: "0001" as year is parsed as 2001 -> artifact of Date() parser not really sure how to handle and/or why at all
        str = [m[1], m[3], m[4]].map(function(s){ return s ? s : "01";}).join("/") + (m[5] ? " "+m[5]: " 00:00:00");
        break;
      }
    }
    date = new Date(str);
    // adjust for timezone in case of dashes or only year
    if(fixDate) {
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    }
    if(extendRange){
      // going from highest to least precise date component
      // extend every zero to its max value until we find a non-zero component
      var bs = (!date.getMilliseconds()) << (!date.getSeconds()) << (!date.getMinutes()) << (!date.getHours());
      if(m) {
        bs = bs << (!m[4]) << (!m[3]);
      }
      switch(bs) {
      case 32:
        date.setMonth(12);
        date.setMilliseconds(-1);
        break;
      case 16:
        date.setMonth(date.getMonth()+1);
        date.setMilliseconds(-1);
        break;
      case 8:
        date.setHours(23);
      case 4:
        date.setMinutes(59);
      case 2:
        date.setSeconds(59);
      case 1:
        date.setMilliseconds(999);
      default:
        break;
      }
    }
    return date;
  };

  return periodParser;
})();
