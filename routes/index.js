
/*
 * GET home page.
 */
var crypto = require('crypto');
var User=require('../models/user.js');
var Post=require('../models/post.js');
 
exports.index = function(req,res){
	Post.get(null,function(err,posts){
		if(err){
			post=[];
		}
		res.render('index',{title:'首页',posts:posts,});
	});
};

exports.user=function(req,res){
	User.get(req.params.user,function(err,user){
		if(!user){
			req.session.error='用户不存在';
			return res.redirect('/');
		}
		
		Post.get(user.name,function(err,posts){
			if(err){
				req.session.error=err;
				return res.redirect('/');
			}
			res.render('user',{
				title:user.name,
				posts:posts,
			});
		
		});
	})
};

exports.post=function(req,res){
	checkLogin(req,res);
	var currentUser=req.session.user;
	var post=new Post(currentUser.name,req.body.post);
	
	post.save(function(err){
		if(err){
			req.session.error=err;
			return res.redirect('/');
		}
		
		req.session.success='发表成功'
		res.redirect('/u/'+currentUser.name);
	});
};

exports.reg = function(req,res){
	checkNotLogin(req,res);
	res.render('reg',{title:'用户注册'});
};


exports.doReg=function(req,res){
	checkNotLogin(req,res);
	console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
	//检查用户两次输入的密码是否一致
	if(req.body['password-repeat']!=req.body['password']){
		req.session.error='两次输入的口令不一致';
		return res.redirect('/reg');
	}
	var md5=crypto.createHash('md5');
	var password=md5.update(req.body.password).digest('base64');
	
	var newUser = new User({
		name:req.body.username,
		password:password
	});
	
	//检查用户是否存在
	User.get(newUser.name,function(err,user){
		if(user)
			err='Username already exists.';
		if(err){
			req.session.error = err;
			return res.redirect('/reg');
		}
		//如果不存在则新增用户
		newUser.save(function(err){
			if(err){
				req.session.error = err;
			    return res.redirect('/reg');
			}
			req.session.user=newUser;
			req.session.success='注册成功';
			res.redirect('/');
			
		});
	});
};

exports.login=function(req,res){
	checkNotLogin(req,res);
	res.render('login',{
		title:'用户登入'
	});
};


exports.doLogin=function(req,res){
	checkNotLogin(req,res);
	var md5 = crypto.createHash('md5');
	var password = md5.update(req.body.password).digest('base64');
	
	User.get(req.body.username,function(err,user){
		if(!user){
			req.session.error='用户不存在';
			return res.redirect('/login');
		}
		if(user.password!=password){
			req.session.error='用户口令错误';
			return res.redirect('/login');
		}
		req.session.user=user;
		req.session.success='登入成功';
		res.redirect('/');
	});
};

exports.logout=function(req,res){
	checkLogin(req,res);
	req.session.user=null;
	req.session.success='登出成功';
	req.session.error=null;
	res.redirect('/');
};

function checkLogin(req,res,next){
	if(!req.session.user){
		console.log('未登入');
		req.session.error='未登入';
		return res.redirect('/login');
	next();
	}
}

function checkNotLogin(req,res,next){
	if(req.session.user){
		req.session.error='已登入';
		return res.redirect('/'); 
	next();
	}
}


