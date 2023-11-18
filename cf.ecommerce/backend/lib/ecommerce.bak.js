"use strict";

const fs = require('fs');

const logger = require('./log')('lib.product');
const helper = require('./helper');
const mongodb = require('./mongodb');
const response = require('./response');

const self = function(){
		
	this.object = 'product';
	this.img_back_path = process.cwd() + '/frontend';
	this.img_front_path = '/img/product/';

	this.projection = {title: 1,resume: 1, img:1, uri: 1, created: 1, price: 1};

	if (!fs.existsSync(this.img_back_path + this.img_front_path)) {
		fs.mkdirSync(this.img_back_path + this.img_front_path);
	}

	this.start();

}

self.prototype.start = async function(){
	try{
		this.setting = await mongodb.find("setting",{type: this.object},{limit: 1});
		if(this.setting.length==1){
			this.setting = this.setting[0];
		}else{
			this.setting = await mongodb.insertOne("setting",{type: this.object});
			this.setting = this.setting.ops[0];
		}
		this.setTagsByRole();
	}catch(e){
		logger.info(e);
	}
}

self.prototype.setTagsByRole = function(){
	if(this.setting.roles && this.setting.tag){
		this.setting.roles_tag = {};
		for(let i=0;i<this.setting.roles.length;i++){
			this.setting.roles_tag[this.setting.roles[i]] = this.forTag(this.setting.roles[i],this.setting.tag);
		}
	}
}

self.prototype.forTag = function(role,tag){
	let r = [];
	for(let i=0;i<tag.length;i++){
		if(typeof tag[i]==='string'){
			r.push(tag[i]);
		}else if(typeof tag[i]==='object' && (!tag[i].roles || tag[i].roles.indexOf(role) > -1)){
			r.push(tag[i].label);
			if(tag[i].tag){
				r = r.concat(this.forTag(role,tag[i].tag));
			}
		}
	}
	return r;
}

self.prototype.getUserRole = function(req){
	return ((req.user && req.user.roles && req.user.roles.length > 0)?req.user.roles[0]:'anonymous');
}

self.prototype.getTagsEnabledByUserRole = function(req){
	if(!this.setting.active || !this.setting.roles_tag){
		return req.query.tag;
	}
	const userRole = this.setting.roles_tag[this.getUserRole(req)];
	if(req.query.tag && typeof req.query.tag==='string' && userRole.length > 0 && userRole.indexOf(req.query.tag) > -1){
		return req.query.tag;
	}else if(req.query.tag && req.query.tag['$in']){
		return {$in: req.query.tag['$in'].filter((r)=>{
			return userRole.indexOf(r)>-1;
		})};
	}else{
		return {$in: userRole};
	}
}

self.prototype.canExecute = async function(req){
	if(req.user.roles.indexOf('root')==-1 && req.user.roles.indexOf('admin')==-1){
		const row = await mongodb.findOne(this.object,req.params.id);
		if(row.author._id.toString() != req.user._id.toString()){
			throw('invalid user!');
		}
	}
	return true;
}

self.prototype.canShowInactive = function(req){
	try{
		if (req.user.roles.indexOf('root') > -1 || req.user.roles.indexOf('admin') > -1 || req.user.roles.indexOf(this.object) > -1){
			return true;
		}else{
			return false;
		}
	}catch(e){
		return false;
	}
}

self.prototype.getTags = async function(req){
	return ((this.setting.active)?this.setting.roles_tag[this.getUserRole(req)]:await mongodb.distinct(this.object,"tag")).sort();
}

module.exports = new self();