var jaxPingIntervalTime = 2000;
var jaxPingCancelID;
var jaxPingUrl;
var jaxPingPostString;

var jaxResponseText;
var jaxResponseStatusText;

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
	jaxPingUrl = host + "/chatBox/cgi-bin/jax_ping_msg_server.cgi";
	jaxPingPostString = "req=ajaxPing" 
	jaxPingPostString += "&userID=" + encodeURIComponent(userID) + "&" + "roomID=" + encodeURIComponent(roomID);
		
	jaxPingCancelID = setInterval(JaxPingServerForData, jaxPingIntervalTime);

}

function JaxPingServerForData(urlArg,postArg)
{

	request = HTTP.newRequest();		
	request.onreadystatechange = function() {
		if(request.readyState == 4) {
			if(request.status == 200) {
				setChatPane(request.responseText);
				setMsgUserPane(request.responseText);
			} 
			else	
			{
				alert(request.statusText);
			}
		}


	};

	request.open("POST", jaxPingUrl);
	request.setRequestHeader("Content-Type",
					"application/x-www-form-urlencoded");

	request.send(jaxPingPostString);


}

function Jax_Call_Post(url, data, func, errfunc, async)
{
        request = HTTP.newRequest();
        request.onreadystatechange = function() {
                if(request.readyState == 4) {
                        if(request.status == 200) {
				
				jaxResponseText = request.responseText;
				func();
                        }
                        else
                        {
				jaxResponseStatusText = request.statusText;
				errfunc();
                        }
                }

        };

        request.open("POST", url, async);
        request.setRequestHeader("Content-Type",
                                        "application/x-www-form-urlencoded");
        request.send(data);

}

function Jax_Call_Get(url, func, errfunc, async)
{
        request = HTTP.newRequest();
        request.onreadystatechange = function() {
                if(request.readyState == 4) {
                        if(request.status == 200) {
				
				func();
                        }
                        else
                        {
				errfunc();
                        }
                }

        };

        request.open("GET", url, async);
        request.send(null);

}

