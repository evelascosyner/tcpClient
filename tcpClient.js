/* 
TCP Client
Author: Eduardo Velasco 
May 18, 2017
*/

const net = require("net"),
	colors = require("colors"),
	readline = require("readline");

let _this;
const tcpClient = function(port, host, user){
	this.host = host || "127.0.0.1";
	this.port = port || 8000;
	this.user = user || "Anonymous";
	_this = this;
}

//Safely parse JSON 
tcpClient.prototype.safelyParseJSON = function(json){
  	try {
    	const parsedJSON = JSON.parse(json);
    	// Neither JSON.parse(false) or JSON.parse(1234) throw errors
    	if ( parsedJSON && typeof parsedJSON === "object" ) {
    		return parsedJSON;
    	} else{
    		return null;
    	}
  	} catch (e) {
   		return null;
  	}
}

//Ensure that the request object is formatted properly
tcpClient.prototype.hasRequiredProperties = function(obj){
	const error = {
		status: false,
		message: 'Input is well formatted.'
	};
	const message = error.message;
	if(obj === null){
		error.message = "Please enter a valid JSON request.";
	} else if( !obj.hasOwnProperty('request') ){
		error.message = "Please specify a request property.";
	}else if( (Object.keys(obj).length > 1 && !obj.hasOwnProperty('id')) || (Object.keys(obj).length > 2 && obj.hasOwnProperty('id')) ){
		error.message = "Please include only the request and id (optional) properties.";
	}else if( obj.request !== 'count' && obj.request !== 'time' ){
		error.message = "Please set the request property to \"count\" or \"time\".";
	}
	if(error.message !== message){
		error.status = true;
	}
	return error;
}

//Parse incoming data 
tcpClient.prototype.handleData = function(streamData){
	const messageArr = streamData.toString('utf8').trim().split("\n").map(msg => _this.safelyParseJSON(msg));
	return messageArr;
}

tcpClient.prototype.displayMessage = function(message, client, request){
		let displayMessage = '';
		if( message === null ){
			// invalid JSON would be handled here 
			// the following is commented out because it interfered with request typing
			// console.log("Server sent invalid JSON." .red);
		} else if( message.type !== 'heartbeat' ){
			if ( message.type === 'welcome' ){
				displayMessage = message['msg'];
			} else if( client !== '' && message['msg']['reply'] !== client ){
				displayMessage = "Response is not to a request from this client.";
			} else {
				displayMessage = "The " + request + " is " +message['msg'][request]+".";		
				if( request === "time" && message['msg']['random'] > 30 ){
					displayMessage += "\nThe random number from the time request is greater than 30.";
				}
			}	
		}
		return displayMessage;
}

//Handle connection and input reading
tcpClient.prototype.openConnection = function(){
	const socket = new net.Socket(),
		user = {name: _this.user};
	let requestVal = clientId = '',
		parsedInput = formatError = {};
	socket.connect(_this.port, _this.host);
	socket.on('connect', () => {
		//log in to server
		socket.write(JSON.stringify(user));
	    //create readline interface
	    const rl = readline.createInterface({
	      input: process.stdin,
	      output: process.stdout
	    });
	    rl.on('line', (input) => {
	    	if( input !== null ){
	    		//check input is valid JSON and formatted properly
	    		parsedInput = _this.safelyParseJSON(input.toString('utf8'));
	    		formatError = _this.hasRequiredProperties(parsedInput);
	    		if( formatError.status === false ){
	    			//store value of request property 
	    			requestVal = parsedInput.request;
	    			//store id if specified
	    			if( parsedInput.hasOwnProperty("id") ){
	    				clientId = parsedInput.id;
	    			} else{
	    				clientId = '';
	    			}
	    			//send request 
	    			socket.write(JSON.stringify(parsedInput));
	    		} else{
	    			console.log(formatError.message .red);
	    		}
	       	}	   	
	    });
	    //Process incoming data and respond properly
	    socket.on('data', (data) => {
	    	const messages = _this.handleData(data);
	    	let display = '';
	    	for( let i =0; i < messages.length; i++ ){
	    		display = _this.displayMessage(messages[i], clientId, requestVal);	
	    		if(display !== ''){
	    			console.log("Server says: " .green + display);
	    		}
	    	}
	    });
	    //disconnect if no heartbeat is received in over 2 seconds.
	    socket.setTimeout(2000, () => {
	    	console.log("\nSocket timed out! Disconnecting..." .yellow);
	    	rl.close();
	    	socket.end();
	    });
	});
	//reconnect on disconnect
	socket.on("close", () => {
		console.log("Reconnecting..\n" .yellow);
		setTimeout(_this.openConnection, 2000);
	});
}
//start client
const port = 9432,
	host = '35.184.58.167',
	client = new tcpClient(port, host, 'Eduardo');

client.openConnection();

//export
module.exports = tcpClient;

	






