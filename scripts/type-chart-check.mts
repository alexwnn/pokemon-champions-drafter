import { effectiveness } from "../lib/typeChart";

const cases: [string, number, number][] = [
  ["fire vs grass", effectiveness("fire", ["grass"]), 2],
  ["fire vs grass/poison", effectiveness("fire", ["grass", "poison"]), 2],
  ["ice vs dragon/flying", effectiveness("ice", ["dragon", "flying"]), 4],
  ["electric vs ground", effectiveness("electric", ["ground"]), 0],
  ["ground vs flying", effectiveness("ground", ["flying"]), 0],
  ["ghost vs normal", effectiveness("ghost", ["normal"]), 0],
  ["fighting vs normal/ice", effectiveness("fighting", ["normal", "ice"]), 4],
  ["water vs ground/rock", effectiveness("water", ["ground", "rock"]), 4],
  ["fairy vs dragon", effectiveness("fairy", ["dragon"]), 2],
  ["dragon vs fairy", effectiveness("dragon", ["fairy"]), 0],
  ["fighting vs ghost", effectiveness("fighting", ["ghost"]), 0],
  ["steel vs fairy", effectiveness("steel", ["fairy"]), 2],
  ["ice vs fire/water", effectiveness("ice", ["fire", "water"]), 0.25],
];

let ok = 0;
let fail = 0;
for (const [name, got, want] of cases) {
  if (got === want) {
    ok++;
  } else {
    fail++;
    console.log(`FAIL ${name}: got=${got} want=${want}`);
  }
}
console.log(`${ok}/${ok + fail} type chart assertions pass`);
process.exit(fail === 0 ? 0 : 1);
