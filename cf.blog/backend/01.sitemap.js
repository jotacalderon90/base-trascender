"use strict";

const parent = require('./lib/blog');

module.exports = {
	
	//@route('/sitemap.xml')
	//@method(['get'])
	sitemap: async function(req,res){
		let data = '';
		try{
			const tags = await parent.getTags(req);
			data += tags.map((r)=>{return '<url><loc>https://' + req.headers.host + '/categoria/' + r.split(' ').join('%20') + '</loc><lastmod>2023-03-18</lastmod></url>'}).join('');
			const rows = await parent.getCollection(req);
			data += rows.map((r)=>{return '<url><loc>https://' + req.headers.host + '/' + r.uri + '</loc><lastmod>' + r.created.toString().split('T')[0] + '</lastmod></url>'}).join('');
		}catch(e){
			console.log(e);
		}
		res.set('Content-Type', 'text/xml');
		res.send('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://' + req.headers.host + '</loc><lastmod>2022-03-18</lastmod></url>' + data + '</urlset>');
	}
	
};