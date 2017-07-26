$(document).ready(function(){
	var a, b, anchorTagsArray, userName;
		userName = $("span#name").text();
		console.log("Username fetched is : "+userName);
		a = "http://localhost:1010/user/";
		b = a + userName;
		anchorTagsArray = $("ul a");
		console.log(anchorTagsArray);
		$(anchorTagsArray[1]).attr('href', b+"/addMoney" );
		$(anchorTagsArray[2]).attr('href', b+"/sendMoney");
		$(anchorTagsArray[3]).attr('href', b+"/payElse");
		$(anchorTagsArray[4]).attr('href', b+"/myTransactions");
		$(anchorTagsArray[5]).attr('href', b+"/");
		$(anchorTagsArray[6]).attr('href', b+"/logout");
	});
	
	// This file helps us fetch the logged in username , on line 4 and update the header tab links in header.pug .