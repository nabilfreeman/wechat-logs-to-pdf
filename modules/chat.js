var Promise = require('bluebird');
var PDF = require('handlebars-to-pdf');
var read = require('read-file');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');

var chat = {
	message_types: {
		10000: 	"system",
		62: 	"sight",
		50: 	"call",
		49: 	"link",
		48: 	"location",
		47: 	"sticker",
		43: 	"video",
		42: 	"card",
		34: 	"voice",
		3: 		"image",
		1: 		"text"
	},

	loadTemplate: function(){
		return new Promise(function(resolve, reject){
			read(global.dir + '/templates/chat.handlebars', 'utf8', function(error, buffer) {
				if(error){
					reject(error);
					return;
				}

				resolve(buffer);
			});
		})
	},

	createPDF: function(buffer, messages){
		return new Promise(function(resolve, reject){
			PDF.create({
				template_html: buffer,
				template_data: messages
			}, function(error, buffer){
				if(error){
					reject(error);
					return;
				}

				resolve(buffer);
			});
		});
	},

	savePDF: function(buffer, filename){
		var write_directory = path.join(global.dir, 'output');
		var write_path = path.join(write_directory, filename + '.pdf');

		console.log("🕑  Saving " + write_path + '...');

		return new Promise(function(resolve, reject){
			mkdirp(write_directory, function(error){
				if(error){
					reject(error);
					return;
				}

				fs.writeFile(write_path, buffer, function(error) {
					if(error){
						reject(error);
						return;
					}

					console.log("💾  Saved " + write_path);

					resolve();
				});
			});
		});
	},

	generate: function(messages){
		return chat.loadTemplate().then(function(html_buffer){
			return chat.createPDF(html_buffer, messages);

		}).then(function(pdf_buffer){
			return chat.savePDF(pdf_buffer, messages.id)
		})
	}
}

module.exports = chat;