"use strict";

const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');
const setting = require('cl.jotacalderon.cf.framework/lib/setting');

const self = function(){
	this.object = 'blog';
	this.projection = {title: 1,resume: 1, img:1, uri: 1, created: 1};
}

self.prototype.getTags = async function(req){
	try{
		req.headers.host = process.env.TEST_DOMAIN || req.headers.host;
		const mySetting = await mongodb.find('setting',{host: req.headers.host});
		if(mySetting.length==0){
			return await mongodb.distinct(this.object,"tag",{host: req.headers.host});
		}else{
			return setting.getTagsBySetting(req,mySetting[0]);
		}
	}catch(e){
		console.log(e);
		return [];
	}
}

self.prototype.getCollection = async function(req,row){
	req.headers.host = process.env.TEST_DOMAIN || req.headers.host;
	let query = this.getBasicQuery(req);
	let options = {};
	if(req.path == '/sitemap.xml'){
		options = {projection: {uri: 1, created: 1}, sort:{created: -1}};
	}else if(req.path == '/'){
		options = {projection: this.projection, sort:{created: -1}, limit: 6};
	}else if(req.path.indexOf('/categoria/') == 0){
		query = {...query, tag: req.params.id}
		options = {projection: this.projection, sort:{created: -1}};
	}else if(row){
		//req no es req, es un row y quiere buscar relacion :S
		query = {...query, tag: {$in: [row.tag_main]}, title: {$ne: row.title}};
		options = {projection: this.projection, limit: 5};
	}else{
		//buscar registro por url
		query = {...query, uri:req.params.id}
	}
	return await mongodb.find(this.object,query,options)
}

self.prototype.getCollectionRelation = async function(req,row){
	req.headers.host = process.env.TEST_DOMAIN || req.headers.host;
	return this.randomArray((await this.getCollection(req,row))).slice(0,2);
}

self.prototype.getBasicQuery = function(req){
	req.headers.host = process.env.TEST_DOMAIN || req.headers.host;
	return {active: true, host: req.headers.host};
}

self.prototype.randomArray = function(array){
	let new_array = [];
	let used = [];
	for(let i=0;i<array.length;i++){
		let r = Math.round(Math.random() * (array.length-1));
		while(used.indexOf(r)>-1){
			r = Math.round(Math.random() * (array.length-1));
		}
		used.push(r);
		new_array.push(array[r]);
	}
	return new_array;
}
module.exports = new self();