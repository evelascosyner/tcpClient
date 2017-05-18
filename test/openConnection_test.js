const assert = require("chai").assert,
    tcpClient = require(__dirname + "/../tcp_client"),
    client = new tcpClient(),
    net = require("net"),
    colors = require("colors"),   
    readline = require("readline");

function areEqualObjects(objectOne, objectTwo){
    const keysOne = Object.keys(objectOne),
        keysTwo = Object.keys(objectTwo);
    if( keysOne.length !== keysTwo.length ){
        return false;
    }
    let areEqual = true;
    for( let i = 0; i < keysOne.length; i++ ){
        if( objectOne[keysOne[i]] !== objectTwo[keysOne[i]] ){
            areEqual = false;
            break;
        }
    }
    return areEqual;
}

describe("openConnection()", () => {
    describe("socket.on('connect')", () => {
        it("Should log in as TCP client", (done) => {
            const testServerOne = net.createServer((socket) => {
                socket.on("data", (data) => {
                    let firstMessageReceived = client.safelyParseJSON(data.toString("utf8").trim());
                    assert.equal(firstMessageReceived.name, "Eduardo");
                    testServerOne.close();
                    done();
                });
            });
            testServerOne.listen(3000, "127.0.0.1", () => {
                const testClientOne = new tcpClient(3000, "127.0.0.1", "Eduardo");    
                testClientOne.openConnection();
            });
        });
    });
    describe("handleData()", () => {
        let message;
        it("Should process multiple incoming messages properly.", (done) => {
            const testServerTwo = net.createServer((socket) => {
                    message = { "message": "message" }; 
                      for( let i = 0; i < 1000; i++ ){
                        socket.write(JSON.stringify(message)+"\n");    
                    }
                    socket.end();
            });
            testServerTwo.listen(4000, "127.0.0.1", () => {
                const testClientTwo = new net.Socket();
                testClientTwo.connect(4000, "127.0.0.1");
                testClientTwo.on("data", (data) => {
                    const messages = client.handleData(data);
                    for( let i = 0; i < messages.length; i++ ){
                        assert.equal(areEqualObjects(messages[i], message), true);
                    }
                });
                testClientTwo.on("close", () => {
                    testServerTwo.close();
                    done();
                });
            });
        });
    });
    describe("displayMessages()", () => {
        it("Should display messages correctly and in a nice way.", () => {
            const display = [
                "",
                "Welcome ~~ Eduardo!", 
                "The count is 10.",
                "The time is Thu May 18 01:19:18 2017.",
                "The time is Thu May 18 01:19:18 2017.\nBy the way, the random number is greater than 30.", 
                "Response is not to a request from this client.", 
            ];
            const sampleMessages = [
                { type:"heartbeat", epoch: 1495074025, display: display[0] },
                { type: "welcome", msg: "Welcome ~~ Eduardo!", display: display[1] },
                { msg: { "time": "Thu May 18 01:19:18 2017", "random": 20 }, display: display[3] },
                { msg: { "time": "Thu May 18 01:19:18 2017", "random": 35 }, display: display[4] }
            ];
            let displayMessage;
            for( let i = 0; i < sampleMessages.length; i++ ){
                displayMessage = client.displayMessage(sampleMessages[i] , "", "time");
                assert.equal(displayMessage, sampleMessages[i]["display"]);
            }
        });
    });
});
