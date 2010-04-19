var jaxPingIntervalTime = 1000;
var jaxPingCancelID;

var HTTP = {};

HTTP._factories = [
	function() { return new XMLHttpRequest(); },
	function() { return new ActiveXObject("Msxml2.XMLHTTP"); },
	function() { return new ActiveXObject("Microsoft.XMLHTTP"); }
	];


HTTP._factory = null;



HTTP.newRequest = function() {
	if (HTTP._factory != null) return HTTP._factory();

	for(var i = 0; i < HTTP._factories.length; i++) {
		try {
			var factory = HTTP._factories[i];
			var request = factory();
			if (request != null) {
				HTTP._factory = factory;
				return request;
		    	}
		}	
		catch(e) {
			continue;
		}
	}

	HTTP._factory = function() {
		throw new Error("XMLHttpRequest not supported");
	}
	HTTP._factory();
}

function startAjaxPing(userID,roomID)
{
	var postString;
	var url = host + "/chatBox/cgi-bin/jax_server.cgi";

	postString = "req=ajaxPing" 
	postString += "&userID=" + encodeURIComponent(userID) + "&" + "roomID=" + encodeURIComponent(roomID);
		
	jaxPingCancelID = setInverval(JaxPingServerForData(url,postString), jaxPingIntervalTime);


}

function JaxPingServerForData(urlArg,postrArg)
{

	var url = urlArg;
	var postString = postrArg;

	request = HTTP.newRequest();		
	request.onreadystatechange = function() {
		if(request.readyState == 4) {
			if(request.status == 200) {
				setChatPane(request.responseText);
			} 
			else	
			{
				alert(request.statusText);
			}
		}


	};

	request.open("POST", url);
	request.setRequestHeader("Content-Type",
					"application/x-www-form-urlencoded");

	request.send(postString);


}
