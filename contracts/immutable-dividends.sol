contract ImmutableDividends {
    bool public dividendsEnabled = false;

    // plan
    // ownership of the NFT contract will be passed to the DAO,
    // then balance will be sent to this contract
    // token holders will then be able to either claim their share of the dividends or have it sent to LP
    // maybe the claim dividends function and send to lp function have a lock and this can be controlled by the DAO, so people cant just claim whenever

    // needs to be ownable contract

    // callable by only the DAO
    function sendToLP() public {
        // send to LP
    }

    function claimDividends() public {
        // claim dividends
    }
}
