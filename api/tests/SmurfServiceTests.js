const chai = require("chai");
const expect = chai.expect;
describe("Smurf Service", function() {
  let service;
  beforeEach(function() {
    service = require("../SmurfService.js");
  });

  it("Should return all smurfs", function() {
    expect(service.getSmurfs()).is.deep.equal([
      { id: 1, name: "Papa", role: "patriarch" },
      { id: 2, name: "Smurfette", role: "spy" },
      { id: 3, name: "Hefty", role: "lifts the heavy thing" }
    ]);
  });

  it("Should return known smurf", function() {
    expect(service.getSmurf(2)).is.deep.equal({
      id: 2,
      name: "Smurfette",
      role: "spy"
    });
  });

  it("Should return undefined for unknown smurf", function() {
    expect(service.getSmurf(99)).is.undefined;
  });

  it("Should be able to add a smurf", function() {
    service.addSmurf({ name: "new", role: "Im new" });
    expect(service.getSmurfs()).is.deep.equal([
      { id: 1, name: "Papa", role: "patriarch" },
      { id: 2, name: "Smurfette", role: "spy" },
      { id: 3, name: "Hefty", role: "lifts the heavy thing" },
      { id: 4, name: "new", role: "Im new" }
    ]);
  });
});
