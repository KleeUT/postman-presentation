var smurfService = require("./SmurfService.js");
var restify = require("restify");
var server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get("/health-check", (request, response) => {
  setTimeout(() => {
    response.send("A OK!");
  }, 5000);
});

server.get("/smurfs", (request, response) => {
  response.json(smurfService.getSmurfs());
});

server.get("/smurf", (request, response) => {
  let smurf = smurfService.getSmurf(request.query.id);
  if (smurf) {
    response.json(smurf);
  } else {
    response.status(404);
    response.end();
  }
});

server.post("/smurf", (request, response) => {
  let smurf = request.body;
  if (smurf.name && smurf.role) {
    smurfService.addSmurf(smurf);
    response.end();
  } else {
    response.status(400);
    response.json({ message: "Smurfs must have a name and a role" });
  }
});

server.listen(8080, function() {
  console.log(`${server.name} listening at ${server.url}`);
});
