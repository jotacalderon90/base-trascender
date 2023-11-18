"use strict";

const parent = require('./lib/blog');
const fs = require('fs');
const response = require('cl.jotacalderon.cf.framework/lib/response');

module.exports = {
	
	//@route('/')
	//@method(['get'])
	renderCollection: async function(req,res){
		try{
			const tags = await parent.getTags(req);
			const rows = await parent.getCollection(req);
			let view = 'blog/collection/_';
			if(fs.existsSync(process.cwd() + '/frontend/' + req.headers.host + '/collection/_.html')){
				view = req.headers.host + '/collection/_';
			}
			response.render(req,res,view, {
				rows: rows,
				tags: tags,
				title: 'Blog de ' + req.headers.host.split('.')[1],
				keywords: parent.object + ',' + tags.join(','),
				description: 'Notas de ' + req.headers.host.split('.')[1],
				author: '@jotace',
				img: req.protocol + '://' + req.headers.host + '/logo.png',
				www: req.protocol + '://' + req.headers.host.replace('blog','www')
			});
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/categoria/:id')
	//@method(['get'])
	renderCollectionTag: async function(req,res){
		try{
			const tags = await parent.getTags(req);
			const rows = await parent.getCollection(req);
			let view = 'blog/collection/_';
			if(fs.existsSync(process.cwd() + '/frontend/' + req.headers.host + '/collection/_.html')){
				view = req.headers.host + '/collection/_';
			}
			response.render(req,res,view, {
				rows: rows, 
				tags: tags,
				title: req.params.id,
				keywords: parent.object + ',' + tags.join(','),
				description: 'Notas de ' + req.headers.host.split('.')[1] + ' acerca de ' + req.params.id, 
				author: '@jotace',
				img: req.protocol + '://' + req.headers.host + '/logo.png',
				www: req.protocol + '://' + req.headers.host.replace('blog','www')
			});
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/:id.html')
	//@method(['get'])
	renderHtml: async function(req,res){
		try{
			const data = await parent.getCollection(req);
			if(data.length==0){
				throw("No se encontró el documento solicitado");
			}else{
				response.renderHtml([data[0]],req,res);
			}
		}catch(e){
			response.renderError(req,res,e);
		}
	},
	
	//@route('/:id')
	//@method(['get'])
	renderDocument: async function(req,res){
		try{
			const row = await parent.getCollection(req);
			if(row.length==0){
				throw("No se encontró el documento solicitado");
			}else{
				row[0].relation = await parent.getCollectionRelation(req,row[0]);
				let view = 'blog/document/_';
				if(fs.existsSync(process.cwd() + '/frontend/' + req.headers.host + '/document/_.html')){
					view = req.headers.host + '/document/_';
				}
				response.render(req,res,view, {
					row: row[0], 
					tags: await parent.getTags(req), 
					title: row[0].title,
					keywords: parent.object + ',' + row[0].tag.join(','),
					description: row[0].resume, 
					author: row[0].author.nickname,
					img: req.protocol + '://' + process.env.HOST_CMS + '/assets/img/blog/' + row[0]._id + '.jpg',
					www: req.protocol + '://' + req.headers.host.replace('blog','www')
				});
			}
		}catch(e){
			response.renderError(req,res,e);
		}
	}
};