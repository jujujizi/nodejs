var server=require("./server");
var router=require("./router");
var requestHandlers=require("./requesthandlers");

var handle={};
handle["/"]=requestHandlers.start;
handle["/start"]=requestHandlers.start;
handle["/login"]=requestHandlers.login;
handle["/upload"]=requestHandlers.upload;
handle["/download"]=requestHandlers.download;
handle["/downloadFiles"]=requestHandlers.downloadFiles;
handle["/list"]=requestHandlers.list;
handle["/changepass"]=requestHandlers.changepass;
handle["/uploadpage"]=requestHandlers.uploadpage;
handle["/exit"]=requestHandlers.exit;
handle["/register"]=requestHandlers.register;

server.start(router.route, handle);