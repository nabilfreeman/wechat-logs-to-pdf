var Promise = require('bluebird');
var moment = require('moment-timezone');
moment.tz.setDefault("Europe/London");

var chat = require(global.dir + '/modules/chat');

var database = {
	init: function(){
		console.log("🕑  Initalizing WeChat database... ");

		return new Promise(function(resolve){
			var database_path = global.config.root_path + 'Documents/' + global.config.user_hash + '/DB/MM.sqlite';

			console.log('🤖  Database path: ' + database_path);

			global.knex = require('knex')({
				client: 'sqlite3',
				connection: {
					filename: database_path
				},
				useNullAsDefault: true
			});

			console.log("✅  Loaded database.");

			resolve();
		});
	},

	listChatHashes: function(){
		console.log("🕑  Loading list of chats... ");

		return knex('sqlite_sequence').select('name').then(function(hashes){
			console.log("✅  Loaded " + hashes.length + " chats.");

			return hashes;
		});
	},

	getLogs: function(chat_id){
		console.log('🕑  Retrieving chat logs for ' + chat_id + '...');

		return knex(chat_id)
				.select('CreateTime', 'Message', 'Type', 'Des')
				.orderBy('CreateTime', 'asc')
				.then(function(messages){
					var to_return = [];

					//format data into a more useful structure
					messages.forEach(function(message){
						to_return.push({
							created_at: moment(message.CreateTime * 1000).format('MMM Do YYYY, HH:mm'),
							message: message.Message,
							type: chat.message_types[message.Type],
							is_self: message.Des === 0 ? true : false
						});
					})

					console.log("✅  Retrieved " + chat_id + ".");

					return {
						id: chat_id,
						data: to_return
					};
				});
	}
};

module.exports = database;