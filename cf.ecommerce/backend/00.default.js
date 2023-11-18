"use strict";

module.exports = {
	
	//@route('/favicon.ico')
	//@method(['get'])
	favicon: function(req,res){
		res.redirect('https://' + req.headers.host.replace('ecommerce','www') + '/assets/img/favicon.ico');
	},
	
	//@route('/robots.txt')
	//@method(['get'])
	robots: function(req,res){
		res.setHeader('content-type', 'text/plain');
		res.send('User-agent: *\n\nAllow: /');
	},
	
	//@route('/logo.png')
	//@method(['get'])
	logo: function(req,res){
		res.redirect('https://' + req.headers.host.replace('ecommerce','www') + '/assets/img/logo.png');
	}
	
};