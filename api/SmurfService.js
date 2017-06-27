let smurfs = [
  { id: 1, name: "Papa", role: "patriarch" },
  { id: 2, name: "Smurfette", role: "Has pretty long hair" },
  { id: 3, name: "Hefty", role: "lifts the heavy thing" }
];
module.exports = {
  getSmurfs: () => {
    return smurfs;
  },
  getSmurf: id => {
    return smurfs.find(x => x.id == id);
  },
  addSmurf: smurf => {
    maxId = smurfs.reduce((curr, prev) => {
      return curr.id > prev.id ? curr.id : prev.id;
    }, 0);

    smurfs.push(Object.assign(smurf, { id: maxId + 1 }));
  }
};
