'use strict';
const path 	 	= require('path'),
	async 	 	= require('async'),
	lo 			= require('lodash'),
	mongoose 	= require('mongoose'),
	Blog 	 	= require(path.resolve('./models/Blog')),
	datatable 	= require(path.resolve('./core/lib/datatable')),
  	config 		= require(path.resolve(`./core/env/${process.env.NODE_ENV}`)),
  	paginate    = require(path.resolve('./core/lib/paginate'));

exports.add = (req, res, next) => {
	if(!req.body.title || !req.body.type) {
		res.status(422).json({
			errors: {
				message: 'Title and type is required', 
				success: false,
			}	
		});
		return;
	}	 
    
    let cms = new Blog(req.body);
    cms.save()
    .then(result => res.json({success: true}))
    .catch(error => res.json({errors: error}));
};

exports.edit = (req, res, next) => {
	if(!req.body._id) {
		res.status(422).json({
			errors: {
				message: 'Title and type is required', 
				success: false,
			}	
		});
		return;
	}	 
    
    
    Blog.update({_id: req.body._id},{$set: { title: req.body.title, type: req.body.type, description: req.body.description }}, 
    	function (error, result) {
    		if(error){
    			res.json({errors: error});
    		}
    		res.json({success: true});
    	}
    );
};

exports.view = (req, res, next) => {
	if(!req.params.type) {
		res.status(422).json({
			errors: {
				message: 'Type is required', 
				success: false,
			}	
		});
		return;
	}	 
    
    
    Blog.findOne({type: req.params.type}, 
    	function (error, result) {
    		if(error){
    			res.json({errors: error});
    		}
    		res.json({success: true, result: result});
    	}
    );
};

exports.list = (req, res, next) => {
	console.log(req.body);
	let operation = {};
	if( req.body.title ){
		operation.title = {$regex: new RegExp(`${req.body.title}`), $options:"im"};
	}
	if( req.body.type ){
		operation.type = {$regex: new RegExp(`${req.body.type}`), $options:"im"};
	}
	if( req.body.status ){
		operation.status = req.body.status;
	}
	async.parallel({
		count: (done) => {
			Blog.count(done);
		},
		records: (done) => {
			Blog.find(operation,done);	
		}
	}, (err, result) => {
		if(err){
			return res.json({errors: err});
		}
		let status_list = {
			class: {
				true : "info",
				false : "danger"	
			},
			status: {
				true : "Active",
				false : "InActive"	
			}
		};
		
		let dataTableObj = datatable.table(status_list, result.count, result.records, req.body.draw);
		res.json(dataTableObj);
	});
};