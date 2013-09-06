var track = (function() {
  var _paper;
  var events = [];
  var last_ts = 0;
  var min_interval = 200;

  var _track_events = {
  };

  var EventUtil = {};

  EventUtil.regist_event = function(type, handler) {
    if (_track_events[type]) {
      _track_events[type].push(handler);
    } else {
      _track_events[type] = [handler];
    }
  };

  EventUtil.unbind = function(type, elem) {
    if (!type && !elem) {
      $(document).unbind('.track');
    } else if (type && !elem) {
      $(document).unbind(type + '.track');
    } else if (!type && elem) {
      $(elem).unbind('.track');
    } else {
      $(elem).unbind(type + '.track');
    }
  };

  function click_event(callback) {

    function _bind_event(e) {
      var ts = new Date();
      // no need to care  min interval for click event
      // if (ts - last_ts < min_interval) return;
      var d = ['click', e.pageX + ',' + e.pageY, ts - last_ts].join('*');
      events.push(d);
      last_ts = ts;
      return d;
    }

    EventUtil.regist_event('click', _bind_event);

    $(document).bind('click.track', function(e) {
      var d = _bind_event(e);
      callback && callback(d);
    });
  }

  function move_event(callback) {
    function _bind_event(e) {
      var ts = new Date();
      if (ts - last_ts < min_interval) return;
      var d = ['move', e.pageX + ',' + e.pageY, ts - last_ts].join('*');
      events.push(d);
      last_ts = ts;
      return d;
    }

    EventUtil.regist_event('mousemove', _bind_event);

    $(document).bind('mousemove.track', function(e) {
      var d = _bind_event(e);
      d && callback && callback(d);
    });
  }

  return {
    track_click: click_event,
    track_move: move_event,
    data: events,
    EventUtil: EventUtil
  };
})();

var play = (function() {
  var _paper;
  var _handlers = {};

  function init_paper() {
    if (!_paper) {
      _paper = Raphael(0, 0, $(document).width(), $(document).width());
    } else {
      _paper.clear();
    }
    return _paper;
  }

  function _parse_events(evts) {
    var i, n;
    var results = [];
    n = evts.length;
    for (i = 0; i < n; i++) {

      // parse single event string
      var evt = evts[i].split('*');
      evt[1] = $.map(evt[1].split(','), function(elem) { return +elem; });
      evt[2] = +evt[2];

      // then add ts
      if (i == 0) {
        evt[2] = 0;
      } else {
        evt[2] += results[i - 1][2];
      }

      if (evt[0] == 'click') {
        results.push(['move', evt[1], evt[2]]);
      }

      results.push(evt);
    }

    return results;
  }

  var _move_path = null;
  var play_handler = {
    'click': function(evt) {
      var point = evt[1];
      console.log(['draw circle', point]);
      var c = _paper.circle(point[0], point[1], 25);
      c.attr('stroke', 'gray');
      c.attr('stroke-width', 2);
    },
    'move': function(evt) {
      var point = evt[1];

      if (!_move_path) {
        _move_path = 'M' + point.join(',');
      } else {
        _move_path += 'L' + point.join(',');
      }

      var path = _paper.path(_move_path);
      path.attr('stroke-width', 3);
      path.attr('stroke', '#aaa');
      path.attr('stroke-linecap', 'round');
      path.attr('stroke-linejoin', 'round');
      path.attr('stroke-dasharray', '-');

    }
  }

  function main_loop(events) {
    console.log(['Events', events]);
    var evt;
    var ts  = +new Date();
    var parsed_events = _parse_events(events);

    init_paper();
    var timer = setInterval(function() {
      var played = false;
      if (!evt) {
        evt = parsed_events.shift();
        console.log(['event', evt]);
        play_handler[evt[0]](evt);
        played = true;
      } else {
        if (+new Date >= ts + evt[2]) {
          play_handler[evt[0]](evt);
          played = true;
        }
      }

      if (played) {
        evt = parsed_events.shift();
        if (!evt) {
          clearInterval(timer);
          console.log('finished play');
        }
      }
    }, 50);
  }

  return {
    play: main_loop
  }
})();

// track.track_click(function(d) {
//   $('body').html(JSON.stringify(track.data));
// });
// track.track_move(function(d) {
//   $('body').html(JSON.stringify(track.data));
// });


var data = ["move*1201,74*1378442314915","move*1148,29*200","move*1133,26*200","move*1072,128*201","move*1019,233*200","move*876,250*201","move*699,226*200","click*684,217*486","move*536,297*216","move*497,313*200","move*475,323*201","click*475,323*191","move*646,339*209","move*793,340*201","click*861,327*397","move*859,327*204","move*805,400*201","move*765,442*201","move*738,458*200","move*705,477*337","click*534,483*537","move*533,482*265","move*534,479*752","move*507,304*200","click*476,210*279","move*477,208*223","move*895,215*697","move*1021,215*222","move*1086,215*222","move*1215,215*231","move*362,215*2743","move*428,215*209","move*476,215*209","move*483,215*248"];

