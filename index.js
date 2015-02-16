'use strict';

var util         = require('util'),
    EventEmitter = require('events').EventEmitter;

var Queue = function (wait) {
  this.wait = wait;
  this.tasks = [];
  this.interval = null;
};

// Inherit the event emitter
util.inherits(Queue, EventEmitter);

Queue.prototype.add = function (fn, args, context, then) {
  this.tasks.push({
    fn: fn,
    args: args,
    context: context,
    then: then
  });
  this.start();
};

Queue.prototype.run = function (task) {
  console.log('task running @ ' + Date().toString());
  task.fn.apply(task.context, task.args)
    .then(task.then)
    .catch(function (err) {
      console.log('Queue Error: ' + err);
    });
};

Queue.prototype.start = function () {
  var self = this;
  if (this.interval === null) {
    this.interval = setInterval(function () {
      if (self.tasks.length > 0) {
        var task = self.tasks.splice(0, 1);
        self.run(task[0]);
      } else {
        clearInterval(self.interval);
        // Wait a half second because the queue could have a short timer.
        setTimeout(function () {
          self.emit('done');
        }, 500);
      }
    }, this.wait);
  }
};

module.exports = Queue;
