var Promise = require('bluebird');
var path = require('path');

//this is used to easily require non-sibling modules from subdirectories
global.dir = path.dirname(require.main.filename);


var prompt = require(global.dir + '/modules/prompt');
var database = require(global.dir + '/modules/database');
var chat = require(global.dir + '/modules/chat');

prompt().tap(function(){
	console.log("");
}).then(function(result){
	//remove whitespace from strings
	Object.keys(result).forEach(function(key){
		result[key] = result[key].trim();
	})

	if(result.root_path.slice(-1) !== '/'){
		result.root_path += '/';
	}

	//dev override
	result.root_path = '/Users/freeman/Projects/wechat-logs/raw/';
	result.user_hash = 'b7e1ad495c6e37b828e02cc1c650f785';

	global.config = result;

	return database.init();

}).tap(function(){
	console.log("");
}).then(function(){
	return database.listChatHashes();

}).tap(function(){
	console.log("");
}).then(function(hashes){
	var operations = [];

	hashes.forEach(function(hash){
		operations.push(database.getLogs(hash.name))
	});

	return Promise.all(operations)

}).tap(function(){
	console.log("");
}).then(function(logs){
	var operations = [];

	logs.forEach(function(log){
		operations.push(chat.generate(log));
	})

	return Promise.all(operations);
}).tap(function(){
	console.log("");
}).then(function(){
	console.log("😎  Done!");

	process.exit()
});