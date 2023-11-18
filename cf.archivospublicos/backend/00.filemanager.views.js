"use strict";

module.exports = {
	
	//@route('/filemanager/admin')
	//@method(['get'])
	//@roles(['root','admin'])
	renderAdmin: function(req,res){
		res.render('filemanager/admin/_',{user: req.user});
	}
	
}