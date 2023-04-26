contract ImmutableDividends {
    bool public dividendsEnabled = false;

    // plan
    // ownership of the NFT contract will be passed to the DAO,
    // then balance will be sent to this contract
    // token holders will then be able to either claim their share of the dividends or have it sent to LP
    // maybe the claim dividends function and send to lp function have a lock and this can be controlled by the DAO, so people cant just claim whenever

    // needs to be ownable contract

    // also lp cant claim dividends, this
    // means we must have a lp claim dividends function?
    // or maybe after dividend period we auto send to LP?
    // idk the game theory

    // callable by only the DAO
    function sendToLP() public {
        // send to LP
    }

    function claimDividends() public {
        // claim dividends
    }
}
