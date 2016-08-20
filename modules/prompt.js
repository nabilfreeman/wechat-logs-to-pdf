var Promise = require('bluebird');

module.exports = function(backups){
	return new Promise(function(resolve, reject){
		var prompt = require("prompt");
		var colors = require("colors/safe");

		var app = prompt.message = colors.magenta("wechat-logs-to-pdf");
		var empty = "                  ";
		var delimiter = prompt.delimiter = "    ";

		console.log("");
		console.log(app + delimiter + colors.yellow("Hello! This tool uses your iPhone/iPad backups to extract your WeChat history."))
		console.log(app + delimiter + colors.yellow("It generates each of your conversations into a separate HTML file that you can then print or save to a PDF."))
		console.log(app + delimiter + colors.yellow("All files are saved in the ") + colors.magenta('output/') + colors.yellow(' directory in this folder.'))
		console.log("");
		console.log(app + delimiter + colors.yellow("We've successfully read the backups on this machine."))
		console.log(app + delimiter + colors.yellow("Choose your device from the list below:"))
		console.log("");

		backups.forEach(function(backup, index){
			console.log(empty + delimiter + (index + 1) + ") " + backup.device_name);
		});

		console.log("");

		prompt.start();

		prompt.get({
			properties: {
				chosen_index: {
					description: colors.yellow("Enter a number:")
				},
			}
		}, function (err, result) {
			if(err){
				reject(err);
				return;
			}

			//change back to array notation
			result.chosen_index -= 1;

			//return selected array item
			resolve(backups[result.chosen_index]);
		});
	});
}