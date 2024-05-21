//Modified from https://github.com/barisusakli/nodebb-plugin-imgur
//Also check https://github.com/lzjluzijie/nodebb-plugin-6tu 
//And check https://github.com/lzjluzijie/nodebb-plugin-smms

'use strict';

var request = require('request');
var fs = require('fs');

var plugin = {};

plugin.upload = function(data, callback) {
	var image = data.image;

	if (!image) {
		return callback(new Error('invalid image'));
	}

	var type = image.url ? 'url': 'file';
	if (type === 'file' && !image.path) {
		return callback(new Error('invalid image path'));
	}

	var formDataImage;
	if (type === 'file') {
		formDataImage = fs.createReadStream(image.path);
		formDataImage.on('error',
		function(err) {
			done(err);
		});
	} else if (type === 'url') {
		formDataImage = image.url;
	} else {
		return callback(new Error('unknown-type'));
	}

	// var options = {
	// 	url: 'https://www.niupic.com/index/upload/process',
	// 	headers: {
	// 		'User-Agent': 'request'
	// 	},
	// 	formData: {
	// 		image_field: formDataImage
	// 	}
	// };
	var options = {
		url: 'https://imgtp.com/api/upload',
		headers: {
			'User-Agent': 'request'
		},
		formData: {
			image: formDataImage
		}
	};

	request.post(options, function optionalCallback(err, httpResponse, body) {
		if (err) {
			return console.error('upload failed:', err);
		}
		var resp;
		try {
			resp = JSON.parse(body);
		} catch(err) {
			return console.error('parse json failed:', err);
		}
		
		console.log('Upload successful! Server responded with:', body);
		// {"code":200,"msg":"success","data":{"id":"432950","name":"3AgsMpI9jbzCg0FebRj2g3Cs.jpg","url":"https:\/\/img2.imgtp.com\/2024\/05\/21\/MjxkOKVF.jpg","size":35410,"mime":"image\/jpeg","sha1":"e1f08b0f3ae5b90d78c7a9c19f0b49bb79323918","md5":"338689823e7a2e542b4a7c8039379f5f"},"time":1716257304}
		return callback(null, {
			name: image.name,
			url: resp.data.url
		});
	});

};

module.exports = plugin;