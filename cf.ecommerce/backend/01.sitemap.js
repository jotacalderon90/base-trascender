"use strict";

const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');
const parent = require('./lib/ecommerce');

module.exports = {
	
	//@route('/sitemap.xml')
	//@method(['get'])
	sitemap: async function(req,res){
		let data = '';
		try{
			const rows = await mongodb.find(parent.object,parent.getBasicQuery(req),{sort:{created: -1}, projection: {uri: 1, created: 1}});
			data = rows.map((r)=>{return '<url><loc>https://' + req.headers.host + '/' + r.uri + '</loc><lastmod>' + r.created.toString().split('T')[0] + '</lastmod></url>'}).join('');
		}catch(e){
			console.log(e);
		}
		res.set('Content-Type', 'text/xml');
		res.send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://' + req.headers.host + '</loc><lastmod>2022-03-18</lastmod></url>' + data + '</urlset>');
	},
	
};