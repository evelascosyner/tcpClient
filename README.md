
## This is a simple TCP client that operates from the command line.

### The Client:
  1. Connects to a server at a specified port/ip.
  2. Receives line delimited JSON.
  3. "Logs in" with the key/value pair {"name":"your_name"}.
  4. Listens for heartbeat messages. If no data is received in over 2 seconds, the client reconnects and logs in once more.
  5. Detects when a message received is invalid JSON.

### The Client also handles input from STDIN to send two supported commands once connected to the worker process:
  -count : How many requests have been made since the startup of the worker process.
    Example: { "request" : "count" }
  -time : The current date/time and a random number
    Example: { "request" : "time" }
  -An "id" property may be specified  which the worker process will use in the reply, this is an optional parameter.
    Example: { "request" : "count", "id" : "your_name" }
  -The input is validated before being sent.
  -When the random number sent back from the "time" request is greater than 30, it prints a message saying so.

======================================

In order to support including line breaks within the JSON, '\n' could be replaced by '\\n'. Additionally, there are JSON 
specific duplex stream packages that could be used for this purpose.
