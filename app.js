
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , MongoStore = require('connect-mongo')(express)
  , settings = require('./settings');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
 
  app.use(express.cookieParser(settings.cookieSecret));
  app.use(express.session({

	cookie : {
			maxAge : 60000 * 20	//20 minutes
		},
	store: new MongoStore({
		db:settings.db
	})
  }));
  
 app.use(function(req, res, next){
	res.locals.user=req.session.user
	res.locals.error=req.session.error?req.session.error:null;
	res.locals.success=req.session.success?req.session.success:null;
	res.locals.req = req;
	res.locals.session = req.session;
	next();
	}); 
  app.use(app.router);
  //app.use(express.router(routes));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

//视图助手 epress 2.0
/* app.dynamicHelpers({
	user:function(req,res){
		return req.session.user;
	},
	error:function(req,res){
		var err=req.flash('error');
		if(err.length)
			return err;
		else
			return null;
	},
	success:function(req,res){
		var succ=req.flash('success');
		if(succ.length)
			return succ;
		else return null;
	}
}); */
//视图助手 epress 3.0
app.get('/', routes.index);
app.get('/index',routes.index);
app.get('/u/:user',routes.user);
app.post('/post',routes.post);
app.get('/reg', routes.reg);
app.post('/reg',routes.doReg);
app.get('/login',routes.login);
app.post('/login',routes.doLogin);
app.get('/logout',routes.logout);

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
