// Shoutout to Nader Dabit for helping w/ this!
// https://twitter.com/dabit3
import fs from "fs";
import anchor from "@project-serum/anchor";

const account = anchor.web3.Keypair.generate();

fs.writeFileSync("./keypair.json", JSON.stringify(account));
