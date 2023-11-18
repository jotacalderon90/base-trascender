"use strict";

module.exports = {
	validRequest: function(req,force){
		if(!req.query.host){
			throw('invalid query host');
		}
		if(req.user.cms.map((r)=>{return r.host}).filter((r)=>{return r===req.query.host}).length==0){
			throw('invalid user host');
		}
		if(force){				
			if(req.user.cms.filter((r)=>{return r.host===req.query.host})[0].collection.indexOf(req.params.object)==-1){
				throw('invalid object');
			}
		}
		return true;
	}
};