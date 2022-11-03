// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./upgradeability/CustomOwnable.sol";
import "contracts/relayer/BasicMetaTransaction.sol";
import "./POAP_SBT.sol";
import "./ABC_SBT.sol";

import "./interfaces/ISBT721.sol";
import "./REP_Points.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

contract Registration is BasicMetaTransaction, Initializable, CustomOwnable {
    mapping(address => bool) public isRegistered;
    mapping(address => bool) public isPoaped;
    address public poap_sbt;
    address public ABC_sbt;
    address public babtContract;
    address public repContract;
    uint256 public repReward = 100;
    uint256 public endtime; //1665365400

    function initialize(
        address _poap_sbt,
        address _ABC_sbt,
        address _babtContract,
        address _repContract,
        uint256 _reward,
        uint256 _endtime
    ) public initializer {
        _setOwner(_msgSender());
        poap_sbt = _poap_sbt;
        ABC_sbt = _ABC_sbt;
        babtContract = _babtContract;
        repContract = _repContract;
        repReward = _reward;
        endtime = _endtime;
    }

    function getPOAP(POAP_SBT.sbt memory _sbt) external {
        require(block.timestamp <= endtime, "Claim POAP period is over");
        address user = _msgSender();
        require(!isPoaped[user], "User has POAP already minted");
        isPoaped[user] = true;
        _sbt.REPTokens = repReward;

        if (isRegistered[user]) {
            _sbt.REPTokenStatus = "Attested";
            _sbt.DeSocMembershipStatus = "Active";
            POAP_SBT(poap_sbt).mint(user, _sbt);
            RepPoints(repContract)._mint(user, repReward * 10**18);
        } else {
            _sbt.REPTokenStatus = "Unattested";
            _sbt.DeSocMembershipStatus = "Inactive";

            POAP_SBT(poap_sbt).mint(user, _sbt);
        }
    }

    function register(POAP_SBT.sbt memory _sbt, ABC_SBT.sbt memory _sbteq)
        external
    {
        address user = _msgSender();
        require(!isRegistered[user], "Already Registered");

        require(
            ISBT721(babtContract).balanceOf(user) > 0,
            "User does not have BAB Tokens"
        );

        isRegistered[user] = true;

        if (isPoaped[user]) {
            string memory status;
            uint256 reward;
            uint256 oldId = POAP_SBT(poap_sbt).userSbtID(user);
            (, , status, , , , , reward, ) = POAP_SBT(poap_sbt).sbtInfo(oldId);

            if (
                keccak256(abi.encodePacked(status)) ==
                keccak256(abi.encodePacked("Unattested"))
            ) {
                POAP_SBT(poap_sbt).burn(oldId);
                RepPoints(repContract)._mint(user, reward * 10**18);

                _sbt.REPTokens = repReward;
                _sbt.REPTokenStatus = "Attested";
                _sbt.DeSocMembershipStatus = "Active";

                POAP_SBT(poap_sbt).mint(user, _sbt);
            }
        }

        _sbteq.MembershipID = ISBT721(babtContract).tokenIdOf(user);
        _sbteq.Status = "Active";
        _sbteq.WalletType = "Root";
        ABC_SBT(ABC_sbt).mint(user, _sbteq);
    }

    function setRepContract(address _rep) external onlyOwner {
        repContract = _rep;
    }

    function setBabtContract(address _babt) external onlyOwner {
        babtContract = _babt;
    }

    function setPOAP_SBTcontract(address _sbt) external onlyOwner {
        poap_sbt = _sbt;
    }

    function setABC_SBTcontract(address _ABC_sbt) external onlyOwner {
        ABC_sbt = _ABC_sbt;
    }

    function setRepReward(uint256 _reward) external onlyOwner {
        repReward = _reward;
    }

    function setEndTime(uint256 _endtime) external onlyOwner {
        endtime = _endtime;
    }

    function _msgSender()
        internal
        view
        override(BasicMetaTransaction)
        returns (address sender)
    {
        if (msg.sender == address(this)) {
            bytes memory array = msg.data;
            uint256 index = msg.data.length;
            assembly {
                // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
                sender := and(
                    mload(add(array, index)),
                    0xffffffffffffffffffffffffffffffffffffffff
                )
            }
        } else {
            return msg.sender;
        }
    }
}
