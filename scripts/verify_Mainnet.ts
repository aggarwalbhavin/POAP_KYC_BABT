const hre = require("hardhat");
function sleep(ms: any) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log("Start");
  let obj: any = {
    RegisterImpl: "0xe81De4cB1BB0093Ad2AdED61A9EF5613ff3767B9",
    Register: "0x8227ea0f6998F6751d44fEdeb1ef85cc3d90a522",
    POAP_SBT: "0x2e9Ba0C90A00BF5f9cEa20573F86a7d9e44902Bf",
    EQ8_SBT: "0xaCe6580583AFf2eDb3134578171eD7f90eACF682",
    REPToken: "0x59341ec8Ab0E523e02525cB59149CAD221567D63",
  };
  await hre.run("verify:verify", {
    address: obj.Register,
    constructorArguments: [],
    contract:
      "contracts/upgradeability/OwnedUpgradeabilityProxy.sol:OwnedUpgradeabilityProxy",
  });

  await hre.run("verify:verify", {
    address: obj.POAP_SBT,
    constructorArguments: [],
    contract: "contracts/POAP_SBT.sol:POAP_SBT",
  });

  await hre.run("verify:verify", {
    address: obj.EQ8_SBT,
    constructorArguments: [],
    contract: "contracts/EQ8_SBT.sol:EQ8_SBT",
  });

  await hre.run("verify:verify", {
    address: obj.REPToken,
    constructorArguments: [],
    contract: "contracts/REP_Points.sol:RepPoints",
  });

  await hre.run("verify:verify", {
    address: obj.RegisterImpl,
    constructorArguments: [],
    contract: "contracts/Registration.sol:Registration",
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
