require('nodestalker')

var Promise = require("bluebird");
var nodeStalker = require("nodestalker");
var log = require('log-colors');
var util = require('util');

// All nodestalker methods that can be async
var methodNamesToPromisify = 
'disconnect use watch ignore put reserve reserve_with_timeout reserveWithTimeout touch deleteJob release bury kick peek peek_ready peekReady peek_delayed peekDelayed peek_buried peekBuried stats stats_job statsJob stats_tube statsTube list_tubes listTubes list_tubes_watched listTubesWatched list_tube_used listTubeUsed pause_tube pauseTube quit setMaxListeners addListener once removeListener removeAllListeners listeners'.split(' ');


function EventEmitterPromisifier(originalMethod) {
    // return a function
    return function promisified() {

        var args = arguments; //[].slice.call(arguments);
        // Needed so that the original method can be called with the correct receiver
        var self = this;
        // which returns a promise
        return new Promise(function(resolve, reject) {

        	try {
            // We call the originalMethod here because if it throws,
            // it will reject the returned promise with the thrown error
            var emitter = originalMethod.apply(self, args);
            } catch (e) {
            	reject(e);
            }

            emitter
                .on("command_success", function(data, response) {
                    resolve([data, response]);
                })
                .on("fail", function(data, response) {
                    // Erroneous response like 400
                    resolve([data, response]);
                })
                .on("error", function(err) {
                    reject(err);
                })
                .on("command_error", function(err) {
                    reject(err);
                })
                .on("abort", function() {
                    reject(new Promise.CancellationError());
                })
                .on("timeout", function() {
                    reject(new Promise.TimeoutError());
                });
        });
    };
};

var nodeStalkerAsync = {};


nodeStalkerAsync.Client = function(server) {
	var client = nodeStalker.Client(server);

	return Promise.promisifyAll(client, {
		 filter: function(name) {
	        return methodNamesToPromisify.indexOf(name) > -1;
	     },
	    promisifier: EventEmitterPromisifier
	});
} 

module.exports = nodeStalkerAsync;
