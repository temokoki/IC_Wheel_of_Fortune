import Principal "mo:base/Principal";
import Blob "mo:base/Blob";
import Int "mo:base/Int";
import Float "mo:base/Float";
import Nat8 "mo:base/Nat8";
import Nat64 "mo:base/Nat64";
import TrieMap "mo:base/TrieMap";
import Random "mo:base/Random";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Time = "mo:base/Time";
import Timer = "mo:base/Timer";
import Error "mo:base/Error";

import Account "./Account";
import Ledger "./Ledger";

actor Self {
  type Player = {
    principal : Principal;
    name : Text;
  };

  type GameStatus = {
    players : ?[Player];
    remainingTime : Int;
  };

  var previousWinner : ?Player = null;
  var currentPlayers = TrieMap.TrieMap<Principal, Player>(Principal.equal, Principal.hash);
  var nextWinnerRevealTime = Time.now() + 30_000_000_000;

  private func canisterDefaultAccount() : Blob {
    Account.accountIdentifier(Principal.fromActor(Self), Account.defaultSubaccount());
  };

  public query func getCanisterAccount() : async Blob {
    canisterDefaultAccount();
  };

  public func getCanisterBalance() : async Ledger.Tokens {
    await Ledger.Actor.account_balance({
      account = canisterDefaultAccount();
    });
  };

  private func getPrincipalAccount(principal : Principal) : Blob {
    Account.accountIdentifier(Principal.fromActor(Self), Account.principalToSubaccount(principal));
  };

  public shared query ({ caller }) func getMyAccount() : async Blob {
    getPrincipalAccount(caller);
  };

  public shared ({ caller }) func getMyBalance() : async Ledger.Tokens {
    await Ledger.Actor.account_balance({
      account = getPrincipalAccount(caller);
    });
  };

  public shared ({ caller }) func participate(display_Name : Text) : async Text {
    let nameLength = Text.size(display_Name);
    if (nameLength < 3 or nameLength > 10) return "Name should be 3-10 characters long!";
    let remainingTime = nextWinnerRevealTime - Time.now();
    if (remainingTime >= -5_000_000_000 and remainingTime <= 5_000_000_000) return "Low time remaining, Please wait for next round!";
    if (currentPlayers.size() == 10) return "Wheel is Full, Please wait for next round!";
    if (currentPlayers.get(caller) != null) return "You're participating already!";

    let transferResult = await Ledger.Actor.transfer({
      to = canisterDefaultAccount();
      fee = { e8s = 10_000 };
      memo = 0;
      from_subaccount = ?Account.principalToSubaccount(caller);
      created_at_time = null;
      amount = { e8s = 10_000_000 };
    });

    switch (transferResult) {
      case (#Ok(blockIndex)) {
        let newPlayer : Player = {
          principal = caller;
          name = display_Name;
        };

        currentPlayers.put(caller, newPlayer);
        if (currentPlayers.size() == 2) {
          nextWinnerRevealTime := Time.now() + 55_000_000_000;
          ignore Timer.setTimer(#seconds(55), chooseRandomWinner);
        };

        return "Success";
      };

      case (#Err(#InsufficientFunds { balance })) {
        return "Insufficient Funds! The balance is only " # debug_show balance # " e8s";
      };

      case (#Err(other)) {
        return "Unexpected error: " # debug_show other;
      };
    };
  };

  public query func getGameStatus() : async GameStatus {
    let status : GameStatus = {
      players = ?Iter.toArray(currentPlayers.vals());
      remainingTime = nextWinnerRevealTime - Time.now() + 5_000_000_000;
    };
  };

  public query func getPreviousWinner() : async ?Player {
    return previousWinner;
  };

  private func chooseRandomWinner() : async () {
    let seed = await Random.blob();
    let randomNumber = Nat8.toNat(Random.byteFrom(seed));

    let distributedWinningPercent = 256 / Float.fromInt(currentPlayers.size());
    let winnerIndex = Float.toInt(Float.fromInt(randomNumber) / distributedWinningPercent);

    let playersArray = Iter.toArray(currentPlayers.vals());
    let winner = playersArray[Int.abs(winnerIndex)];
    let winningAmount = Nat64.fromNat(playersArray.size() * 10_000_000);
    previousWinner := ?winner;

    ignore await Ledger.Actor.transfer({
      to = getPrincipalAccount(winner.principal);
      fee = { e8s = 10_000 };
      memo = 0;
      from_subaccount = null;
      created_at_time = null;
      amount = { e8s = winningAmount - 10_000 };
    });

    currentPlayers := TrieMap.TrieMap<Principal, Player>(Principal.equal, Principal.hash);
  };

  public shared ({ caller }) func withdraw(withdrawalAddress : Text, amount : Nat64) : async Text {
    try {
      ignore await Ledger.Actor.send_dfx({
        to = withdrawalAddress;
        fee = { e8s = 10_000 };
        memo = 0;
        from_subaccount = ?Account.principalToSubaccount(caller);
        created_at_time = null;
        amount = { e8s = amount - 10_000 };
      });
      return "Success";
    } catch (error) {
      return Error.message(error);
    };
  };
};
