function route(handle, pathname, response, request)
{
//	console.log("About to route a request for "+pathname);
	if(typeof(handle[pathname])==="function")
	{
		handle[pathname](response, request);
	}
	else
	{
		handle["/downloadFiles"](response, request);
	//	console.log("No request handler for "+pathname);
	//	response.writeHead({"Content-Type":"text/html"});
	//	response.write("404 Not found");
	//	response.end();
	}
}
exports.route=route; 