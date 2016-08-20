var bplist = require('bplist-parser');
var path = require('path');
var fs = require('fs');
var plist = require('plist');
var SHA1 = require('sha1');
var find = require('recursive-readdir');

var Backup = {
	getHashedFileName: function(device, filename){
		return new Promise(function(resolve, reject){
			var wechat_directory = 'AppDomain-com.tencent.xin-Documents';
			var hash = SHA1(path.join(wechat_directory, filename));

			find(device.directory, function (error, files) {
				if(error){
					reject(error);
					return;
				}

				files.some(function(file){
					if(file.indexOf(hash) > -1){
						resolve(file);
						return true;
					}

					return false;
				})
			});
		});
	},

	readWechatInfo: function(device){
		Backup.getHashedFileName(device, 'LocalInfo.lst').then(function(bplist_path){
			console.log("🕑  Reading WeChat user info from " + device.device_name + " (backup)...")

			return new Promise(function(resolve, reject){
				bplist.parseFile(bplist_path, function(error, result) {
					if(error){
						reject(error);
						return;
					}

					resolve(result)
				});
			});
		}).then(function(result){
			var UIN = null;
			var wechat_id = null;
			var trigger = false;

			result[0]['$objects'].some(function(object){
				if(trigger){
					wechat_id = object;
				} else if(typeof object === "object"){
					UIN = object['m_uiLastUin'];
				} else if(typeof object === "string" && object.indexOf('wxid_') > -1){
					trigger = true;
				}

				return UIN && wechat_id;
			})

			return {
				UIN: UIN,
				wechat_id: wechat_id
			};
		}).then(function(user_data){
			console.log("🙇  Found WeChat user " + user_data.wechat_id + ". Their UIN is " + user_data.UIN + '.');
			console.log(SHA1(user_data.UIN));
		});
	},

	readBackupInfo: function(data){
		return new Promise(function(resolve, reject){
			var plist_path = path.join(data.directory, 'Info.plist');

			fs.readFile(plist_path, 'utf8', function(error, file){
				if(error){
					reject(error);
					return;
				}

				var parsed = plist.parse(file);

				data.device_name = parsed['Device Name'];

				resolve(data);
			});
		});
	},

	loadBackups: function(){
		var backups_path = path.join(process.env.HOME, 'Library/Application Support/MobileSync/Backup');

		return new Promise(function(resolve, reject){
			fs.readdir(backups_path, function(error, files){
				var UDIDs = [];

				//we only want directories with 40 characters in their file name (iOS UDID).
				files.forEach(function(file){
					if(file.length === 40){
						var data = {
							UDID: file,
							directory: path.join(backups_path, file)
						}

						UDIDs.push(Backup.readBackupInfo(data));
					}
				})

				resolve(Promise.all(UDIDs))
			});
		});
	}
};

module.exports = Backup;