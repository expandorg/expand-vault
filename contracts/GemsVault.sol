pragma solidity ^0.5.0;

import "@openzeppelin/contracts/lifecycle/Pausable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract GemsVault is Ownable, Pausable {
    using SafeMath for uint;

    struct Withdrawal {
        uint t;
        uint value;
    }

    struct Address {
        uint length;
        mapping (uint => Withdrawal) withdrawals;
    }

    uint constant internal MAX_WITHDRAW_PERIOD = 1 days;
    uint constant internal MAX_WITHDRAW_AMOUNT = 1000000*10**18;

    ERC20 internal gems;
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

    constructor(address _gems, address _xpn)
        public
        nonzeroAddress(_gems)
        nonzeroAddress(_xpn)
    {
        gems = ERC20(_gems);
        xpn = ERC20(_xpn);
    }

    function deposit(address _from, uint _value)
        external
        onlyOwner
        nonzeroAddress(_from)
        nonzeroValue(_value)
        returns (bool)
    {
        gems.transferFrom(_from, address(this), _value);
        emit Deposited(_from, _value);
        return true;
    }


    function depositXpn(address _from, uint _value)
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
        logWithdrawal(_to, _value);
        xpn.transfer(_to, _value);
       	emit Withdrew(_to, _value);
        return true;
    }

    function logWithdrawal(address _to, uint _value)
        internal
    {
        uint sum;
        bool inserted;
        Withdrawal memory withdrawal = Withdrawal(now, _value);
        for (uint i = 0; i < log[_to].length; i++) {
            if (log[_to].withdrawals[i].t <= now-MAX_WITHDRAW_PERIOD) {
                if (!inserted) {
                    log[_to].withdrawals[i] = withdrawal;
                    sum += withdrawal.value;
                    inserted = true;
                } else {
                    log[_to].withdrawals[i] = Withdrawal(0, 0);
                }
            } else {
                sum += log[_to].withdrawals[i].value;
            }
        }
        if (!inserted) {
            log[_to].withdrawals[log[_to].length] = withdrawal;
            log[_to].length++;
            sum += withdrawal.value;
        }
        require(sum <= MAX_WITHDRAW_AMOUNT);
    }
}
