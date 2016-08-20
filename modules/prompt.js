var Promise = require('bluebird');

module.exports = function(){
	return new Promise(function(resolve, reject){
		var prompt = require("prompt");
		var colors = require("colors/safe");

		prompt.message = colors.blue("wechat-logs-to-pdf");
		prompt.delimiter = colors.green("    ");

		prompt.start();

		prompt.get({
			properties: {
				root_path: {
					description: colors.yellow("What is the full path to your ") + colors.magenta("com.tencent.xin") + colors.yellow(" folder?")
				},
				user_hash: {
					description: colors.yellow("Great! Now, your 32-character user hash:")
				}
			}
		}, function (err, result) {
			if(err){
				reject(err);
				return;
			}

			resolve(result);
		});
	});
}