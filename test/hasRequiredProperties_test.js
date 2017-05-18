const assert = require("chai").assert,
	tcpClient = require(__dirname + "/../tcp_client"),
	client = new tcpClient();

describe("hasRequiredProperties()", () => {
	it("Should detect invalid JSON and provide a helpful error message", () => {
		const errors = [
			"Please enter a valid JSON request.", 
			"Please specify a request property.", 
			"Please include only the request and id (optional) properties.",
			"Please set the request property to \"count\" or \"time\"."
		];
		const invalidJSON = [
			{ json: "123", error: errors[0] },
			{ json: "{\"request\":\"count }", error: errors[0] },
			{ json: "{\"any\":\"any\"}", error: errors[1] },
			{ json: "{\"request\":\"time\", \"id\":\"id\", \"other\":\"other\"  }", error: errors[2] },
			{ json: "{\"request\":\"other\" }", error: errors[3] },
			{ json: "{\"request\":\"other\", \"id\":\"id\" }", error: errors[3] }
		];
		let formatError;
		for( let i = 0; i < invalidJSON.length; i++ ){
			formatError = client.hasRequiredProperties(client.safelyParseJSON(invalidJSON[i]["json"]));
			assert.equal(formatError.message, invalidJSON[i]["error"]);
		}
	});
});

