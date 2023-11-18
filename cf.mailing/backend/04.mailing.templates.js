"use strict";

const fs = require('fs');
const path = require("path");
const response = require('cl.jotacalderon.cf.framework/lib/response');
const render = require('cl.jotacalderon.cf.framework/lib/render');
const frontDirectory = 'mailing/memo/';
const directory = process.cwd() + '/frontend/' + frontDirectory;

const getMetadata = function(template){
	const rows = [];
	while(template.indexOf("{{")>-1){
		const index1 = template.indexOf("{{");
		const tmp = template.substring(index1);
		const index2 = tmp.indexOf("}}");
		const tempTemplate = tmp.substring(2,index2);
		rows.push({label: tempTemplate.replace("data:doc.","") ,name: tempTemplate,type: "static", value: ""});
		template = template.split("{{"+tempTemplate+"}}").join("metadata");
	}
	return rows;
}

module.exports = {
	
	//@route('/api/mailing/template/collection')
	//@method(['get'])
	//@roles(['root','admin','mailing'])
	templates: async function(req,res){
		try{
			res.send({data: fs.readdirSync(directory,"utf8").filter((row)=>{
				return fs.statSync(path.join(directory,row)).isFile();
			})});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/api/mailing/template/:id')
	//@method(['get'])
	//@roles(['root','admin','mailing'])
	template_metadata: async function(req,res){
		try{
			res.send({data: getMetadata(fs.readFileSync(directory + req.params.id,"utf8"))});
		}catch(e){
			response.APIError(req,res,e);
		}
	},
	
	//@route('/mailing/templates/:id')
	//@method(['get'])
	//@roles(['root','admin','mailing'])
	render_template: async function(req,res){
		try{
			res.send(render.process(frontDirectory + req.params.id,req.body));
		}catch(e){
			response.APIError(req,res,e);
		}
	}
	
};