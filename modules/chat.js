var Promise = require('bluebird');
var PDF = require('handlebars-to-pdf');
var read = require('read-file');
var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var Handlebars = require('handlebars');
var buffer = require('buffer');

Handlebars.registerHelper('ifEquals', function(v1, v2, options) {
	if(v1 === v2) {
		return options.fn(this);
	}
	
	return options.inverse(this);
});

Handlebars.registerHelper('unlessEquals', function(v1, v2, options) {
	if(v1 !== v2) {
		return options.fn(this);
	}
	
	return options.inverse(this);
});

Handlebars.registerHelper("switch", function(value, options) {
	this._switch_value_ = value;
	var html = options.fn(this); // Process the body of the switch block
	delete this._switch_value_;
	return html;
});

Handlebars.registerHelper("case", function(value, options) {
	if (value == this._switch_value_) {
		return options.fn(this);
	}
});

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

	createHTML: function(buffer, template_data){
		//compile handlebars template and data into raw HTML
		return new Promise(function(resolve){
			var output_html = Handlebars.compile(buffer)(template_data);

			var output_buffer = new Buffer(output_html);

			resolve(output_buffer)
		});
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

	saveFile: function(buffer, filename){
		var write_directory = path.join(global.dir, 'output');
		var write_path = path.join(write_directory, filename);

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
			return chat.createHTML(html_buffer, messages);

		}).then(function(html_buffer){
			return chat.saveFile(html_buffer, messages.id + '.html')
		})
	}
}

module.exports = chat;