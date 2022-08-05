// SPDX-License-Identifier: Legi
pragma solidity >=0.8.2;
import "./all.sol";

contract Legi is ERC20, ERC20Burnable, AccessControl, ERC20Permit {
    bytes32 public constant MINTER_ROLE = keccak256(abi.encodePacked("MINTER_ROLE"));
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant WITHDRAWER_ROLE = keccak256("WITHDRAWER_ROLE");
    event Received(address, uint);
    event withdrawn(address, uint);
    event sentContractEth(address, uint);
    event fallbackReceived(address, uint);

    constructor(string memory dname, string memory symb) ERC20(dname, symb) ERC20Permit(dname) {
        _mint(msg.sender, 69000000 * 10 ** 24);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(BURNER_ROLE, msg.sender);
        _grantRole(WITHDRAWER_ROLE, msg.sender);
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        unchecked{
            _mint(to, amount);
        }
    }

    function getEtherBalance(address _checkBal) public view returns(uint256){
        require(_checkBal != address(0),'cannot be 0 address');
        return _checkBal.balance;
    }

    function contractEthBalance() public view returns(uint){
        require(msg.sender != address(0), 'address 0 not allowed to call;');
        return address(this).balance;
    }

    function sendEther(address payable _to, uint amount) public onlyRole(WITHDRAWER_ROLE) {
        (bool sent,) = _to.call{value: amount}("");
        require(sent, "Failed to send Ether");
        emit sentContractEth(_to, amount);
    }

    function withdrawEther() public onlyRole(WITHDRAWER_ROLE) {
        uint256 ownerBalance = address(this).balance;
        require(ownerBalance > 0, "insufficient tokens");
        (bool sent,) = msg.sender.call{value: address(this).balance}("");
        require(sent, "withdraw failed");
        emit withdrawn(msg.sender, ownerBalance);
    }

    fallback() external payable {
        emit fallbackReceived(msg.sender, msg.value);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }
}
