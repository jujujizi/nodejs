var fs=require("fs");
var formidable=require("formidable");
var url=require("url");
var mysql=require("mysql");
var path=require("path");
var homeworkDir="./homework/";
var mime=require("./mime").mime;

var UserNumber="";
var UserName="";
var WorkName="";
var WorkLocation="";
var UploadTime="";
var WorkIndex=0;

var images=''+
	'<div class="content"><div class="head"><div class="head_1"><div class="top"><div class="top_logo"><img src="images/logo.jpg" /></div></div>'+
	'<div class="nav"><ul>'+
	'<li><a href="uploadpage">上传作业</a></li><li>|</li><li><a href="list">查看作业</a></li><li>|</li><li><a href="#">作业公告</a></li>'+
	'<li>|</li><li><a href="#">关于系统</a></li><li>|</li>'+
 	'<li><a  href="changepass.html">修改密码</a></li><li>|</li><li><a  href="register.html">注册</a></li>'+
	'<li>|</li><li><a href="/exit">退出系统</a></li> </ul></div></div>';
var head='<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">'+
	'<html xmlns="http://www.w3.org/1999/xhtml">'+
	'<head>'+
	'<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />'+
	'<link href="css/type.css" rel="stylesheet" type="text/css" />';


function start(response, request)
{
	console.log("Request handler 'start' was called.");
	fs.readFile("./login.html", function(err, html)
		{
			if(err){throw err}
			else
			{
				response.writeHeader(200, {"Content-Type": "text/html"});
				response.write(html);
				response.end();
			}
		});
}

function login(response, request)
{
	var form=new formidable.IncomingForm();
	form.parse(request, function(error, fields, files)
	{
		global.number=fields.number;
		global.password=fields.password;
		userTest(number, password, response);
	});
}
//上传作业页面
function uploadpage(response, request)
{
	checkUserLogin(response);
	var uploadUrl=url.parse(request.url, true);
	var query=uploadUrl.query;
	var fileName=query.name;

	var form='<form action="/upload" enctype="multipart/form-data" ' + 'method="post">';
	var body=head+
	'<title>上传文件</title></head><body>'+images+
	'<center><h2>提交作业</h2>' +form+
	'<input type="file" name="upload" multiple="multiple"> <br/>'+
	'<input type="submit" value="提交"/>' + 
	'</form>' + '</center></body>' + '</html>';

	response.writeHead(200, {"Content-Type" : "text/html"});
	response.write(body);
	response.end();
}
//上传文件
function upload(response, request) {
	console.log("Request handler 'upload' was called.");
	var date = new Date();
	var form = new formidable.IncomingForm();
	form.uploadDir = "./homework/";//设置上传文件的保存位置
	console.log("about to parse");
	form.parse(request, function(error, fields, files) {
	UserNumber = global.number;
	UserName = global.name;
    console.log("parsing done");
	WorkIndex++;
	fs.renameSync(files.upload.path, "./homework/"+UserNumber+"_"+UserName+"_0"+WorkIndex+".zip");//文件重命名
	WorkName = UserNumber+"_"+UserName+"_0"+WorkIndex+".zip";
	WorkLocation = "./homework/"+WorkName;
	UploadTime = date.getFullYear()+"-"+date.getMonth()+"-"+date.getDate()+" ";
	UploadTime += date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
	console.log(UserName+UserNumber);
	console.log(UploadTime);
	var connection = mysql.createConnection({
		host:'localhost',
		user:'root',
		password:'123',
		database:'nodejs',
		port:3306
	});
	connection.connect();
	var insertString="insert into homework(UserNumber,WorkName,WorkLocation,UploadTime) values('"+UserNumber+"','"+WorkName+"','"+WorkLocation+"','"+UploadTime+"')";
	console.log(insertString);
	connection.query(insertString,function(err,result){
		if(err){
			console.log('[INSERT ERROR] - ',err.message);
			return;
		}
		
		console.log('----------------------------INSERT----------------------------');
		console.log('INSERT ID:',result);
		console.log('--------------------------------------------------------------');
		
	});
	connection.end();
	response.writeHead(302, {"Location": "list"});
	response.end();

  });
}
//显示所有已上传文件的页面
function list(response,request) {
	checkUserLogin(response);
	var body=head+
	'<title>已上传文件</title></head><body>'+images+
	'<center><table class="tableclass">'+
	'<caption>已上传文件 </caption>'+
	'<tr><th>已上传作业：</th></tr>';
	
	console.log("Request handler 'show' was called.");
	UserNumber = global.number;
 	var connection = mysql.createConnection({
		host:'localhost',
		user:'root',
		password:'123',
		database:'nodejs',
		port:3306
	});
	connection.connect(function(err){
		if(err){
			console.log('[query] - :'*err);
			return;
		}
		console.log('[connection connect] succeed!');
	});
	var queryString="select * from homework where UserNumber='"+UserNumber+"'";
	console.log(queryString);
	connection.query(queryString,function(err,rows,fields){
		if(err){
			console.log("[query] - :"*err);
			return;
		}
		WorkIndex = rows.length;
		for(var i=1;i<=rows.length;i++){
			var rs = rows[i-1];
			body+="<tr>"
				+"<td><a href='/download?file="+rs["WorkName"]+"'>"+rs["WorkName"]+"</a></td>"
				+"</tr>";
		}
		body+="</table>";
		
		response.writeHead(200, {"Content-Type":"text/html charset=UTF-8"});
		response.write(body);
		response.write('<p><div align="center"><input class="btnclass" align="center" type="submit" value="继续上传" onclick="location.href=\'uploadpage\'"></div></p></center></body></html>');
		response.end();
	});
	connection.end();
	
}

function isEmpty(value)
{
	return Boolean(value && typeof(value)=="object") && !Object.keys(value).length;
}
//下载
function download(response, request)
{
	console.log("Request handler 'download' was called.");
	var downloadUrl=url.parse(request.url, true);
	console.log("downloadUrl", downloadUrl);
	var query=downloadUrl.query;
	var fileName=query.file;
	console.log("-----------------"+fileName);
	fs.readFile(homeworkDir+fileName, "binary", function(error, file)
		{
			if(error)
			{
				response.writeHead(500, {"Content-Type":"text/plain"});
				response.write(error+"\n");
				response.end();
			}
			else
			{
				response.writeHead(200, {"Content-Type":"application/zip",
					"Content-disposition":transformDownloadHeader(request, fileName)
				});
				response.write(file, "binary");
				response.end();
			}
		});
}

function downloadFiles(response, request)
{
	console.log("Request handler 'downloadfiles' was called.");
	var downloadUrl=url.parse(request.url, true);
	var filename=downloadUrl.pathname.slice(1);
	global.query=downloadUrl.query;
	var extname=path.extname(filename);
	var type=extname.slice(1);
	fs.readFile(filename, "binary", function(error, file)
		{
			if(error)
			{
				response.writeHead(500, {"Content-Type":"text/plain"});
				response.write(error+"\n");
				response.end();
			}
			else
			{
				response.writeHead(200, {"Content-Type":mime[type]});
				response.write(file, "binary");
				response.end();
			}
		});
}
//修改密码
function changepass(response, request)
{
	var form=new formidable.IncomingForm();
	form.parse(request, function(error, fields, files)
	{
		console.log(fields);
		global.password=fields.password;
		var pass1=fields.newpassword;
		console.log("password", pass1);
		changepassword(pass1, response);
	});
}

function changepassword(pass, response)
{
	checkUserLogin(response);
	var connection=mysql.createConnection(
	{
		host:"localhost",
		user:"root",
		password:'123',
		database:'nodejs',
		port:3306
	});
	connection.connect();
	var updateString='update student set password="'+pass+'" where number="'+global.number+ '" and password="'+global.password+"\"";
	console.log(updateString);
	connection.query(updateString, function(error, result)
		{
			if(error){throw error;}
			else
			{
				console.log(result);
				response.writeHead(200, {"Content-Type":"text/html"});
				if(result.affectedRows==0)
				{
					response.write('<script language="javascript">alert("Original password error!");location.href="changepass.html";</script>');
				}
				else
				{
					response.write('<script language="javascript">alert("Modify password success!");location.href="changepass.html";</script>');
				}
				response.end();
			}
		});
	connection.end();
}

function transformDownloadHeader(httpReq, fileName)
{
	var userAgent=(httpReq.headers['user-agent'] || '').toLowerCase();
	if(userAgent.indexOf('msie')>=0 || userAgent.indexOf('chrome')>=0)
	{
		return 'attachment;filename='+encodeURIComponent(fileName);
	}
	else if(userAgent.indexOf('firefox')>=0)
	{
		return 'attachment;filename*="utf8\'\''+encodeURIComponent(fileName)+"";
	}
	else
	{
		return 'attachment;filename='+new Buffer(fileName).toString('binary');
	}
}

function userTest(number, password, response)
{
	var connection=mysql.createConnection(
	{
		host:"localhost",
		user:"root",
		password:'123',
		database:'nodejs',
		port:3306
	});
	connection.connect();
	var queryString='select * from student where number='+number;
	console.log(queryString);
	connection.query(queryString, function(err, rows, fields)
		{
			if(err){throw err;}
			else
			{
				console.log(rows);
				if(typeof(rows[0])=="undefined")
				{

					response.writeHead(200, {"Content-Type":"text/html"});
					response.write('<script language="javascript">alert("The number does not exist!");location.href="login.html";</script>');
				}
				else
				{
					if(password!=rows[0].password)
					{
						response.writeHead(200, {"Content-Type":"text/html"});
						response.write('<script language="javascript">alert("Password error!");location.href="login.html";</script>');
					}
					else
					{
						global.name=rows[0].name;
						response.writeHead(302, {"Location": "/list"});
					}
				}
				response.end();
			}
		});
	connection.end();
}
//退出登录
function exit(response, request)
{
	global.name="";
	global.number="";
	response.writeHead(302, {"Location": "/login.html"});
	response.end();
}
//注册
function register(response, request)
{
	var form=new formidable.IncomingForm();
	form.parse(request, function(error, fields, files)
	{
		var number=fields.number;
		var name=fields.name;
		var password=fields.password1;
		addUser(number, name, password, response);
	});
}

function addUser(number, name, password, response)
{
	var connection=mysql.createConnection(
	{
		host:"localhost",
		user:"root",
		password:'123',
		database:'nodejs',
		port:3306
	});
	connection.connect();
	var insertString='insert into student(number, name, password) values('+number+', "'+name+'", "'+password+'")';
	console.log(insertString);
	connection.query(insertString, function(err, res)
		{
			if(err)
			{
				console.log(err);
				response.writeHead(200, {"Content-Type":"text/html"});
				response.write('<script language="javascript">alert("register failed！");location.href="register.html";</script>');
			}
			else
			{
				console.log(res);
				response.writeHead(302, {"Location": "/login.html"});

			}
			response.end();
		});
	connection.end();
}
//判断用户是否登录
function checkUserLogin(response)
{
	if(typeof(global.number)=="undefined" || global.number=="")
	{
		response.writeHead(200, {"Content-Type":"text/html"});
		response.write('<script language="javascript">alert("Please log in first!");location.href="login.html";</script>');
		response.end();
	}
}

function homework()
{

}

exports.start=start;
exports.login=login;
exports.upload=upload;
exports.list=list;
exports.download=download;
exports.downloadFiles=downloadFiles;
exports.changepass=changepass;
exports.uploadpage=uploadpage;
exports.exit=exit;
exports.register=register;
exports.homework=homework;