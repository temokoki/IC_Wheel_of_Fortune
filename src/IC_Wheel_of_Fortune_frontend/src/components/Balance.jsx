import React, { useState, useEffect } from "react";
import { AUTH_ACCOUNT, AUTH_DEPOSIT_ADDRESS } from "../index";
import { icp_ledger } from "../../../declarations/icp_ledger";
import Participate from "./Participate";
import Withdraw from "./Withdraw";

export default function Balance({ onParticipate }) {
  const [balance, setBalance] = useState(0);
  const [isParticipateVisible, setParticipateVisible] = useState(false);
  const [isWithdrawalVisible, setWithdrawalVisible] = useState(false);

  async function checkBalance() {
    const currentBalance = await icp_ledger.account_balance({ account: AUTH_ACCOUNT });
    setBalance((parseFloat(currentBalance.e8s) / 100000000).toFixed(4));
  }

  useEffect(() => { checkBalance() }, []);

  return (
    <div className="panel">
      <h2>💶 Balance</h2>
      <label>
        <span>Your Deposit Address: <span className="highlighted-text">{AUTH_DEPOSIT_ADDRESS}</span></span>
        <p>Your Deposit Balance: <span className="highlighted-text">{balance} ICP</span></p>
      </label>
      <p style={{ textAlign: "center" }}>
        <button onClick={() => checkBalance()}>
          Refresh
        </button>
        <button onClick={() => { setParticipateVisible(true); setWithdrawalVisible(false); }}>
          Participate (0.1ICP)
        </button>
        <button onClick={() => { setWithdrawalVisible(true); setParticipateVisible(false); }}>
          Withdraw
        </button>
      </p>
      {isWithdrawalVisible &&
        <Withdraw
          currentBalance={balance}
          onTransferSuccess={() => checkBalance()}
          onCancel={() => setWithdrawalVisible(false)}
        />}
      {isParticipateVisible &&
        <Participate
          currentBalance={balance}
          onTransferSuccess={() => { onParticipate(); checkBalance(); }}
          onCancel={() => setParticipateVisible(false)}
        />
      }
    </div >
  );
}