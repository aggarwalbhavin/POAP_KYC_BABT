import { ethers } from "hardhat";

function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default async function main() {
  console.log("main");

  // We get the contract to deploy
  const owner = "0xAbFe96009c70C1fb1c28b1C2539cD230d83eE887"; //change this before deploying
  const Proxy = await ethers.getContractFactory("OwnedUpgradeabilityProxy");
  const babToken = "0x2B09d47D550061f995A3b5C6F0Fd58005215D7c8";

  //POAPSBT
  const POAP_SBT = await ethers.getContractFactory("POAP_SBT");
  const poap_sbt = await POAP_SBT.deploy();
  await sleep(15000);
  console.log("poap sbt", poap_sbt.address);

  //EQ8SBT
  const EQ8_SBT = await ethers.getContractFactory("EQ8_SBT");
  const eq8_sbt = await EQ8_SBT.deploy();
  await sleep(15000);
  console.log("eq8 sbt", eq8_sbt.address);

  //REPToken
  const REPToken = await ethers.getContractFactory("RepPoints");
  const repToken = await REPToken.deploy();
  await sleep(15000);
  console.log("REP Token", repToken.address);

  //Registration
  const Register = await ethers.getContractFactory("Registration");
  const register = await Register.deploy();
  await sleep(15000);
  console.log("Registration Impl", register.address);

  //Initialize the Contracts
  const registerProxy = await Proxy.deploy();
  await registerProxy.upgradeTo(register.address);
  await sleep(15000);

  console.log("Upgraded proxy to register", registerProxy.address);
  const regProxy = register.attach(registerProxy.address);

  await regProxy.initialize(
    poap_sbt.address,
    eq8_sbt.address,
    babToken,
    repToken.address,
    100,
    1665840600
  );
  await sleep(15000);
  console.log("Register initialized");

  //ADD minter in the token contracts

  await repToken.addMinter(regProxy.address);
  await sleep(15000);
  console.log("Added register as minter in REP Points");

  await poap_sbt.addMinter(regProxy.address);
  await sleep(15000);
  console.log("Add register as minter in POAP SBT");

  await eq8_sbt.addMinter(regProxy.address);
  await sleep(15000);
  console.log("Add register as minter in EQ8 SBT");

  const obj = {
    RegisterImpl: register.address,
    Register: regProxy.address,
    POAP_SBT: poap_sbt.address,
    EQ8_SBT: eq8_sbt.address,
    REPToken: repToken.address,
  };
  console.log(obj);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


  // {
  //   RegisterImpl: '0xe81De4cB1BB0093Ad2AdED61A9EF5613ff3767B9',
  //   Register: '0x8227ea0f6998F6751d44fEdeb1ef85cc3d90a522',
  //   POAP_SBT: '0x2e9Ba0C90A00BF5f9cEa20573F86a7d9e44902Bf',
  //   EQ8_SBT: '0xaCe6580583AFf2eDb3134578171eD7f90eACF682',
  //   REPToken: '0x59341ec8Ab0E523e02525cB59149CAD221567D63'
  // }