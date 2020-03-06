pragma solidity ^0.5.0;

import "@openzeppelin/contracts/lifecycle/Pausable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./CanReclaimToken.sol";


contract ExpandVault is Ownable, Pausable, CanReclaimToken {
    using SafeMath for uint;

    struct Withdrawal {
        uint t;
        uint value;
    }

    struct Address {
        uint length;
        mapping (uint => Withdrawal) withdrawals;
    }

    ERC20 internal xpn;

    mapping (address => Address) internal log;

    event Deposited(address from, uint value);
    event Withdrew(address to, uint value);

    modifier nonzeroAddress(address _address) {
        require(_address != address(0));
        _;
    }

    modifier nonzeroValue(uint _value) {
        require(_value > 0);
        _;
    }

    constructor(address _expand, address _xpn)
        public
        nonzeroAddress(_expand)
        nonzeroAddress(_xpn)
    {
        xpn = ERC20(_xpn);
    }

    function deposit(address _from, uint _value)
        external
        onlyOwner
        nonzeroAddress(_from)
        nonzeroValue(_value)
        returns (bool)
    {
        xpn.transferFrom(_from, address(this), _value);
        emit Deposited(_from, _value);
        return true;
    }


    function withdraw(address _to, uint _value)
        external
        onlyOwner
        nonzeroAddress(_to)
        nonzeroValue(_value)
        returns (bool)
    {
        xpn.transfer(_to, _value);
       	emit Withdrew(_to, _value);
        return true;
    }
}
