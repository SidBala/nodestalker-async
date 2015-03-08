var nodestalkerAsync = require('..');
var log = require('log-colors');
var should = require('chai').should();
var util = require('util');

describe('Basic', function() {
	it('Something', function(done) {
		this.timeout(100000);

		var client = nodestalkerAsync.Client('127.0.0.1:11300');
		var consumerClient = nodestalkerAsync.Client('127.0.0.1:11300');

		client.useAsync('default')
		.then(function() {
			client.putAsync('AJobPayload');
		})		
		.then(function() {
			consumerClient.watchAsync('default');
		})
		.then(function() {
			return consumerClient.reserveAsync();
		})
		.then(function(job) {
			job = job[0];

			job.data.should.equal('AJobPayload');
			log.info(util.inspect(job));

			return job;
		})
		.then(function(job) {
			consumerClient.deleteJobAsync(job.id);
		})
		.then(done.bind(this,null));
	});
});