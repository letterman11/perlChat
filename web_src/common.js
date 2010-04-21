var PANE = { 
		REGISTRATION : 0,
		LOGIN : 1
	};

var reEmailValidation = /^\w+[\w.]+?\w+@\w+[\w.]+?\.{1}\w+\s*$/;
var passLen = 6;
var userLen = 6;
var userID;
var phoneLen = 10;
var zipcodeLen = 5;
var host = "http://192.168.0.197:8080";


var ERRCODE = {
                INVALID_PASSWORD:"Password length must be at least 6 characters",
                        PASSWORD_MISMATCH:"Passwords do not match"
                 };

function getCookie(name) 
{
	var start = document.cookie.indexOf( name + "=" );
	var len = start + name.length + 1;

	if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) {
		return null;
	}

	if ( start == -1 ) return null;
		var end = document.cookie.indexOf( ";", len );
	if ( end == -1 ) end = document.cookie.length;
		return unescape( document.cookie.substring( len, end ) );

}

function createCookie(name,value,days) 
{
        if (days) {
                var date = new Date();
                date.setTime(date.getTime()+(days*24*60*60*1000));
                var expires = "; expires="+date.toGMTString();
        }
        else var expires = "";
        document.cookie = name+"="+value+expires+"; path=/";
}

function eraseCookie(name) 
{
        createCookie(name,"",-1);
}

function logOut()
{
	deleteRoomPaneLogout();	
	document.getElementById('logout_room_box').style.display = 'none';

	for(i=0; i<arguments.length; i++) {
		eraseCookie(arguments[i]);
	}
	
}

function init()
{
	var stock_SessionID = getCookie('stock_SessionID');
	var roomSelected = getCookie('roomSelected');

	if ((stock_SessionID != null && stock_SessionID != 'null')) {
		document.getElementById('login').style.display = 'none';
		document.getElementById('logged_on').style.display = 'block';
		document.getElementById('main_sub_panel').style.display = 'block';
		document.getElementById('landing_panel').style.display = 'none';
		document.getElementById('register_panel').style.display = 'none';	

		if(roomSelected == null || roomSelected == 'null')
		{
			loadRooms();
		}
		else
		{
			setRoomPane(roomSelected);
		}
	}
	
}

function loadRooms()
{

	var url = host + "/chatBox/cgi-bin/jax_server.cgi?req=roomIDs";
	request = HTTP.newRequest();		
	request.onreadystatechange = function() {
		if(request.readyState == 4) {
			if(request.status == 200) {
			
				loadRoomPane(request.responseText);
			} 
			else	
			{
				alert(request.statusText);
				document.getElementById('top_sel_con').innerHTML = request.statusText;	
			}
		}


	};

	request.open("GET", url);
	request.send(null);

}

function loadRoomPane(rspObj)
{
	
	var roomArray = eval (rspObj);
	var roomSelDiv = document.getElementById('top_sel_con');

	for(i=0;  i < roomArray.length; i++) 
	{
		var newRmDiv = document.createElement("div");	
		var rmTxtNode = document.createTextNode(roomArray[i]);	
		newRmDiv.appendChild(rmTxtNode);

		newRmDiv.className = i % 2 ? ' roomDiv1' : ' roomDiv2';

		if(window.attachEvent) 
		{
			newRmDiv.attachEvent('onclick', logIntoRoom);
		}
		else
		{
			newRmDiv.addEventListener('click', logIntoRoom, false);
		}
		
		roomSelDiv.appendChild(newRmDiv);

	}

}

function deleteLoadRoomPane()
{
	deleteRoomPaneLogout();
	loadRooms();
	deleteMsgUserPane();
	document.getElementById('logout_room_box').style.display = 'none';
}

function finalLogout()
{
	var sessID = getCookie('stock_SessionID');
	if(sessID == null || sessID == 'null' || sessID == undefined || sessID == 'undefined')
	  return;

	deleteRoomPaneLogout();
	deleteMsgUserPane();
	document.getElementById('logout_room_box').style.display = 'none';
}

function deleteRoomPane()
{
	var roomSelDiv = document.getElementById('top_sel_con');
	
	while(roomSelDiv.hasChildNodes())
	{

		if(window.attachEvent)
		{
			roomSelDiv.firstChild.detachEvent("onclick", logIntoRoom);
		}
		else
		{
			roomSelDiv.firstChild.removeEventListener("click", logIntoRoom, false);
		}
		
		roomSelDiv.removeChild(roomSelDiv.firstChild);
	}
	document.getElementById('logout_room_box').style.display = 'none';
}

function deleteRoomPaneLogout()
{
	var stock_UserID = getCookie('stock_UserID');
	var roomSelected = getCookie('roomSelected');

	var roomSelDiv = document.getElementById('top_sel_con');
	var postString;
	
	while(roomSelDiv.hasChildNodes())
	{
		if(window.attachEvent)
		{
			roomSelDiv.firstChild.detachEvent("onclick", logIntoRoom);
		}
		else
		{
			roomSelDiv.firstChild.removeEventListener("click", logIntoRoom, false);
		}

		roomSelDiv.removeChild(roomSelDiv.firstChild);
	}

	var url = host + "/chatBox/cgi-bin/jax_server.cgi";

	postString  = "req=roomLogout&";
	postString += "userID=" + encodeURIComponent(stock_UserID) + "&";
	postString += "roomID=" + encodeURIComponent(roomSelected);

	eraseCookie('roomSelected');
	deleteChatPane();

	if(jaxPingCancelID) 
		clearInterval(jaxPingCancelID);

	request = HTTP.newRequest();		
	request.onreadystatechange = function() {
		if(request.readyState == 4) {
			if(request.status == 200) {
				document.getElementById('logout_room_box').style.display = 'none';
			} 
			else	
			{
				alert(request.statusText);
			}
		}


	};

	request.open("POST", url, false);
	request.setRequestHeader("Content-Type",
					"application/x-www-form-urlencoded");
	request.send(postString);


}

function logIntoRoom()
{

	var roomDiv;
	var stock_UserID = getCookie('stock_UserID');

	if(window.attachEvent)
	{
		roomDiv = window.event.srcElement;
	}
	else
	{
		roomDiv = this;
	}	


	var url = host + "/chatBox/cgi-bin/jax_server.cgi";

         postString  = "req=roomLogin&";
         postString += "userID=" + encodeURIComponent(stock_UserID) + "&";
         postString += "roomID=" + encodeURIComponent(roomDiv.firstChild.data);


	request = HTTP.newRequest();		
	request.onreadystatechange = function() {
		if(request.readyState == 4) {
			if(request.status == 200) {
				createCookie('roomSelected', roomDiv.firstChild.data);
				setRoomPane(roomDiv.firstChild.data);
				//alert("request_response: " + request.responseText);	
				setMsgUserPane(request.responseText);	
				startAjaxPing(stock_UserID,roomDiv.firstChild.data);	
				
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

function setRoomPane(roomDivText)
{
	deleteRoomPane();
	var newRmDiv = document.createElement("div")
	var rmTxtNode = document.createTextNode(roomDivText);
	newRmDiv.appendChild(rmTxtNode);	
	newRmDiv.className = ' roomDiv1';

	var roomSelDiv = document.getElementById('top_sel_con');
	roomSelDiv.appendChild(newRmDiv);	
	
	var rmLogOut = document.getElementById('logout_room_box');	
	rmLogOut.style.display = 'block';

	
	//--------------------------------------------------------	
	//Look into DOM structure of container for additional node
	//--------------------------------------------------------	

}

function setMsgUserPane(rspObj)
{

	deleteMsgUserPane();

        var jSonCO = eval (rspObj);

	if (jSonCO == null || jSonCO == 'null' || jSonCO == undefined || jSonCO == 'undefined')
		return;
	if (jSonCO.msg_user_ids == null || jSonCO.msg_user_ids == 'null' || jSonCO.msg_user_ids == undefined || jSonCO.msg_user_ids == 'undefined')
		return;

        var userPaneDiv = document.getElementById('bot_disp_con');

	var stockID = getCookie('stock_UserID');


        for(i=0;  i < jSonCO.msg_user_ids.length; i++)
        {
		if(jSonCO.msg_user_ids[i] == stockID)
			continue;
                var newUserDiv = document.createElement("div");
                var userTxtNode = document.createTextNode(jSonCO.msg_user_ids[i]);
                newUserDiv.appendChild(userTxtNode);

                newUserDiv.className = i % 2 ? ' userDiv1' : ' userDiv2';
                userPaneDiv.appendChild(newUserDiv);
        }

}

function deleteMsgUserPane()
{
        var userPaneDiv = document.getElementById('bot_disp_con');

        while(userPaneDiv.hasChildNodes())
        {
                userPaneDiv.removeChild(userPaneDiv.firstChild);
        }
}

function setChatPane(rspObj)
{

	var chatPaneDiv = document.getElementById('chat_panel');
	var jSonCO = eval(rspObj);

	if (jSonCO == null || jSonCO == 'null' || jSonCO == undefined || jSonCO == 'undefined')
		return;
	if (jSonCO.messages == null || jSonCO.messages == 'null' || jSonCO.messages == undefined || jSonCO.messages == 'undefined')
		return;

	for(i=0; i < jSonCO.messages.length; i++)
	{
		var newChatMsgDiv = document.createElement("div");
		var newSpan = document.createElement("span");
		newSpan.style.fontWeight = "bold";
		var userSpanTxtNode = document.createTextNode(jSonCO.messages[i].user_id + ": ");
		newSpan.appendChild(userSpanTxtNode);
		var msgStr = jSonCO.messages[i].msg_text; 	
		var userTxtNode = document.createTextNode(msgStr);
		newChatMsgDiv.appendChild(newSpan);
		newChatMsgDiv.appendChild(userTxtNode);

		newChatMsgDiv.className = chatPaneDiv.childNodes.length % 2 ? ' chatMsgDiv1' : ' chatMsgDiv2'; 

		chatPaneDiv.appendChild(newChatMsgDiv);
	}
	newChatMsgDiv.scrollIntoView();	
}

function deleteChatPane()
{
	var chatPaneDiv = document.getElementById('chat_panel');
	
	while(chatPaneDiv.hasChildNodes())
	{
		chatPaneDiv.removeChild(chatPaneDiv.firstChild);
	}
}


function changePane(obj,pane)
{
	var doc = obj;
	if(pane == PANE.REGISTRATION) 
	{
		doc.getElementById('landing_panel').style.display = 'none';
		doc.getElementById('main_sub_panel').style.display = 'none';
		doc.getElementById('register_panel').style.display = 'block';	

	}
	else if(pane == PANE.LOGIN)
	{
		doc.getElementById('landing_panel').style.display = 'block';
		doc.getElementById('register_panel').style.display = 'none';	
		doc.getElementById('main_sub_panel').style.display = 'none';
		doc.getElementById('login').style.display = 'block';
		doc.getElementById('logged_on').style.display = 'none';

	}
	else
	{
		doc.getElementById('landing_panel').style.display = 'none';
		doc.getElementById('register_panel').style.display = 'none';	
		doc.getElementById('main_sub_panel').style.display = 'block';	
		doc.getElementById('login').style.display = 'none';
		doc.getElementById('logged_on').style.display = 'block';
		displayLoggedOn();
		loadRooms();
	}


}

function displayLoggedOn()
{
	stock_UserID = getCookie('stock_UserID');
	var spanLoggedOn = document.getElementById('form_login');
	spanLoggedOn.innerHTML = stock_UserID + " LOGGED IN | " +
	" <a href=\"javascript:changePane(document,PANE.LOGIN)\" onclick=\"logOut('stock_UserID','stock_SessionID','Instance','roomSelected')\" target=\"_top\" > LOG OUT </a> " +
	" | <a href=\"/cgi-bin/profile_page.cgi?userName=" + stock_UserID + "\">" +  " update profile </a> ";

}


function validateRegistration()
{
   var regForm = arguments[0];
   var state = true;

   clearValidationRegistration(regForm);

   var regForm = arguments[0];
   if (! reEmailValidation.test(regForm.email.value)) {
        document.getElementById("val_email").style.visibility = "visible";
        state = false
   }

   if(regForm.userName.value.length < userLen) {
        document.getElementById("val_username").style.visibility = "visible";
        state = false
   }

   if(regForm.password.value.length < passLen) {
        document.getElementById("val_password").style.visibility = "visible";
        state = false
   }

   regForm.zipcode.value = regForm.zipcode.value.replace(/\D*/g,"");
   regForm.zipcode.value = regForm.zipcode.value.substring(0,zipcodeLen);

   regForm.phone.value = regForm.phone.value.replace(/\D*/g,"");
   regForm.phone.value = regForm.phone.value.substring(0,phoneLen);

   return state;

}

function clearValidationRegistration()
{
   var regForm = arguments[0];
   document.getElementById("val_email").style.visibility = "hidden";
   document.getElementById("val_username").style.visibility = "hidden";
   document.getElementById("val_password").style.visibility = "hidden";

}

function processSignInForm(form)
{

	//Adhoc will replace with more structured code
	document.getElementById("err_text").innerHTML =  ""; 
	var i;
	var request;
	var postString = "";
	var frm = form;
	var url = host + "/chatBox/cgi-bin/jax_authenticate.cgi";
	var frmElements = form.elements;

	for (i=0; i < frmElements.length-1; i++) 
	{
		postString += encodeURIComponent(frmElements[i].name) + "=" + encodeURIComponent(frmElements[i].value) + "&";
	}
	postString += encodeURIComponent(frmElements[i].name) + "=" + encodeURIComponent(frmElements[i].value);
	postString = postString.replace(/%20/g,"+");	

	request = HTTP.newRequest();		
	request.onreadystatechange = function() {
		if(request.readyState == 4) {
			if(request.status == 200) 
			{
				setTimeout('changePane(document,null)',1000);	

			} 
			else	
			{
				document.getElementById("err_text").innerHTML =  request.statusText; 

			} 


		}	


	};

	request.open("POST", url);
	request.setRequestHeader("Content-Type",
					"application/x-www-form-urlencoded");

	request.send(postString);

}


function processForm(form)
{

	if(!validateRegistration(form)) return;

	var i;
	var request;
	var postString = "";
	var url = host + "/chatBox/cgi-bin/jax_registration.cgi";
	var frmElements = form.elements;

	for (i=0; i < frmElements.length-1; i++) 
	{
		postString += encodeURIComponent(frmElements[i].name) + "=" + encodeURIComponent(frmElements[i].value) + "&";
	}

	postString += encodeURIComponent(frmElements[i].name) + "=" + encodeURIComponent(frmElements[i].value);
	postString = postString.replace(/%20/g,"+");	

	request = HTTP.newRequest();		
	request.onreadystatechange = function() {
		if(request.readyState == 4) {
			if(request.status == 200) {
				document.getElementById("reg_response").innerHTML = "<h3>" + request.responseText + " </h3> ";
			//	setTimeout('changePane(document,null)',5000);	

			} 
			else	
			{
				document.getElementById("reg_response").innerHTML = " <h3>" + request.statusText + " </h3> ";

			} 


		}	


	};

	request.open("POST", url);
	request.setRequestHeader("Content-Type",
					"application/x-www-form-urlencoded");
	request.send(postString);

}

function processSend(sendMsg)
{
	var request;
	var postString = "";
	var url = host + "/chatBox/cgi-bin/jax_server.cgi";
	var frmElements = sendMsg.elements;
        var stock_UserID = getCookie('stock_UserID');
        var roomSelected = getCookie('roomSelected');

	postString  = "req=sendMsg&";
	postString += encodeURIComponent(frmElements[0].name) + "=" + encodeURIComponent(frmElements[0].value) + "&";
	postString += "userID=" + encodeURIComponent(stock_UserID) + "&" + "roomID=" + encodeURIComponent(roomSelected);
	postString  = postString.replace(/%20/g,"+");

	//alert(postString);
	if (roomSelected == null || roomSelected == 'null')
		return;

        request = HTTP.newRequest();
        request.onreadystatechange = function() {
                if(request.readyState == 4) {
                        if(request.status == 200) {
				frmElements[0].value = "";	
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

function popForm(form) 
{
	form.firstName.value = "John";
	form.lastName.value = "Blake";
	form.address1.value = "33 Kingston Drive";
	form.address2.value = "Suite 11A";
	form.zipcode.value = "23215";
	form.city.value = "Phoenix";
	form.state.value = "AZ";
	form.phone.value = "4578901234";
	form.email.value = "johnb@yahoo.com";
	form.userName.value = "johnblake";
	form.password.value = "johnblake";


}


