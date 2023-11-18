"use strict";

module.exports = {
	
	//@route('/favicon.ico')
	//@method(['get'])
	favicon: function(req,res){
		res.redirect(process.env.HOST_CMS + '/assets/img/favicon/' + req.headers.host + '.ico');
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
		res.redirect(process.env.HOST_CMS + '/assets/img/logo/' + req.headers.host + '.png');
	}
	
};