"use strict";

const mongodb = require('cl.jotacalderon.cf.framework/lib/mongodb');
const response = require('cl.jotacalderon.cf.framework/lib/response');

const self = function(){
		
	this.object = 'ecommerce';
	this.projection = {title: 1,resume: 1, img:1, uri: 1, created: 1, price: 1};
	
}

self.prototype.getBasicQuery = function(req){
	return {active: true, host: req.headers.host};
}

self.prototype.canShowInactive = function(user){
	try{
		if (user.roles.indexOf('root') > -1 || user.roles.indexOf('admin') > -1 || user.roles.indexOf(this.object) > -1){
			return true;
		}else{
			return false;
		}
	}catch(e){
		return false;
	}
}

self.prototype.getTags = async function(req){
	return await mongodb.distinct(this.object,"tag",{host: req.headers.host});
}

self.prototype.canExecute = async function(req){
	if(req.user.roles.indexOf('root')==-1 && req.user.roles.indexOf('admin')==-1){
		const row = await mongodb.findOne(this.object,req.params.id);
		if(row.host!=req.headers.host){
			throw('invalid host');
		}
		if(row.author._id.toString() != req.user._id.toString()){
			throw('invalid user!');
		}
	}
	return true;
}

module.exports = new self();