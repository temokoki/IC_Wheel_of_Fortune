module {
    public type AccountBalanceArgs = { account : Blob };
    public type Tokens = { e8s : Nat64 };
    public type TimeStamp = { timestamp_nanos : Nat64 };

    public type TransferError = {
        #BadFee : { expected_fee : Tokens };
        #InsufficientFunds : { balance : Tokens };
        #TxTooOld : { allowed_window_nanos : Nat64 };
        #TxCreatedInFuture;
        #TxDuplicate : { duplicate_of : Nat64 };
    };

    public type TransferResult = {
        #Ok : Nat64;
        #Err : TransferError;
    };

    public type TransferArgs = {
        to : Blob;
        fee : Tokens;
        memo : Nat64;
        from_subaccount : ?Blob;
        created_at_time : ?TimeStamp;
        amount : Tokens;
    };

    public type SendArgs = {
        to : Text;
        fee : Tokens;
        memo : Nat64;
        from_subaccount : ?Blob;
        created_at_time : ?TimeStamp;
        amount : Tokens;
    };

    public let Actor = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai") : actor {
        account_balance : shared query AccountBalanceArgs -> async Tokens;
        transfer : shared TransferArgs -> async TransferResult;
        send_dfx : shared SendArgs -> async Nat64;
    };
};
