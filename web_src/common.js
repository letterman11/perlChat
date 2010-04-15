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

	var url = "http://192.168.0.197:8080/chatBox/cgi-bin/jax_server.cgi?req=roomIDs";
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
	request.setRequestHeader("Content-Type",
					"text/html");
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
	document.getElementById('logout_room_box').style.display = 'none';
}

function deleteRoomPane()
{
	var roomSelDiv = document.getElementById('top_sel_con');
	
	while(roomSelDiv.hasChildNodes())
	{
		roomSelDiv.removeChild(roomSelDiv.firstChild);
	}
}

function deleteRoomPaneLogout()
{
	var stock_UserID = getCookie('stock_UserID');
	var roomSelected = getCookie('roomSelected');
	var roomSelDiv = document.getElementById('top_sel_con');
	
	while(roomSelDiv.hasChildNodes())
	{
		roomSelDiv.removeChild(roomSelDiv.firstChild);
	}

	var url = "http://192.168.0.197:8080/chatBox/cgi-bin/jax_server.cgi?req=roomLogout";
	url += "&" + "userID=" + encodeURIComponent(stock_UserID) + "&" + "roomID=" + encodeURIComponent(roomSelected);
	//alert("URL " + roomSelected);

	request = HTTP.newRequest();		
	request.onreadystatechange = function() {
		if(request.readyState == 4) {
			if(request.status == 200) {
				document.getElementById('logout_room_box').style.display = 'none';
				eraseCookie('roomSelected');
				//startAjaxPing(stock_UserID,this.firstChild.data);	
				
			} 
			else	
			{
				alert(request.statusText);
			}
		}


	};

	request.open("GET", url);
	request.setRequestHeader("Content-Type",
					"text/html");
	request.send(null);
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


	var url = "http://192.168.0.197:8080/chatBox/cgi-bin/jax_server.cgi?req=roomLogin";
	url += "&" + "userID=" + encodeURIComponent(stock_UserID) + "&" + "roomID=" + encodeURIComponent(roomDiv.firstChild.data);

	request = HTTP.newRequest();		
	request.onreadystatechange = function() {
		if(request.readyState == 4) {
			if(request.status == 200) {

				createCookie('roomSelected', roomDiv.firstChild.data);
				setRoomPane(roomDiv);
				//startAjaxPing(stock_UserID,this.firstChild.data);	
				
			} 
			else	
			{
				alert(request.statusText);
			}
		}


	};

	request.open("GET", url);
	request.setRequestHeader("Content-Type",
					"text/html");
	request.send(null);



}

function setRoomPane(roomDiv)
{
	if(typeof roomDiv  != "string") 
	{
		var parentDiv = roomDiv.parentNode;
		deleteRoomPane();
		parentDiv.appendChild(roomDiv);	
	}
	else
	{
		var newRmDiv = document.createElement("div")
		var rmTxtNode = document.createTextNode(roomDiv);
		newRmDiv.appendChild(rmTxtNode);	
		newRmDiv.className = ' roomDiv1';

		var roomSelDiv = document.getElementById('top_sel_con');
		roomSelDiv.appendChild(newRmDiv);	
	}
	
	var rmLogOut = document.getElementById('logout_room_box');	
	rmLogOut.style.display = 'block';

	if(window.attachEvent) 
	{
		rmLogOut.attachEvent('onclick', deleteLoadRoomPane);
	}
	else
	{
		rmLogOut.addEventListener('click', deleteLoadRoomPane, false);
	}
	
	//--------------------------------------------------------	
	//Look into DOM structure of container for additional node
	//--------------------------------------------------------	

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
	var url = "http://192.168.0.197:8080/chatBox/cgi-bin/jax_authenticate.cgi";
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
				setTimeout('changePane(document,null)',2000);	

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
	var frm = form;
	//var url = "http://192.168.0.197:8080/chatBox/cgi-bin/respond.cgi";
	var url = "http://192.168.0.197:8080/chatBox/cgi-bin/jax_registration.cgi";
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
				document.getElementById("reg_response").innerHTML = "<span style='background-color:blue;'> <h3>" + request.statusText + " </h3> </span>";
			//	setTimeout('changePane(document,null)',5000);	

			} 
			else	
			{
				document.getElementById("reg_response").innerHTML = "<span style='background-color:red;'> <h3>" + request.statusText + " </h3> </span>";

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


