import React, { useState, useEffect } from "react";
import { AUTH_ACTOR } from "../index";

export default function Withdraw({ currentBalance, onTransferSuccess, onCancel }) {
  const [amount, setAmount] = useState(0);
  const [withdrawalAddress, setWithdrawalAddress] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isFeedbackHidden, setFeedbackHidden] = useState(true);
  const [isButtonsDisabled, setButtonsDisabled] = useState(false);

  useEffect(() => document.getElementById("withdrawalAddress").scrollIntoView({ behavior: "smooth" }), []);

  async function handleWithdrawal() {
    setFeedbackHidden(true);
    setButtonsDisabled(true);

    const withdrawalAmount = parseFloat(amount);

    if (withdrawalAddress.length != 64) {
      alert("Withdrawal address isn't correct, it should be 64 characters long");
    } else if (withdrawalAmount < 0.01) {
      alert("Amount must be more than 0.01 ICP");
    } else if (withdrawalAmount > currentBalance) {
      alert("You don't have enough ICP on balance");
    } else {
      try {
        const result = await AUTH_ACTOR.withdraw(withdrawalAddress, parseInt(withdrawalAmount * 100000000));
        if (result == "Success") onTransferSuccess();

        setFeedback(result);
        setFeedbackHidden(false);
      } catch (error) {
        alert(error);
      }
    }
    setButtonsDisabled(false);
  }

  return (
    <>
      <div className="subPanel">
        <fieldset id="withdrawalAddress">
          <legend>Address (Account ID):</legend>
          <input
            type="text"
            value={withdrawalAddress}
            onChange={(e) => setWithdrawalAddress(e.target.value)}
          />
        </fieldset>
        <fieldset id="withdrawalAmount">
          <legend>Amount:</legend>
          <input
            type="number"
            min="0"
            step="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value < 0 ? 0 : e.target.value)}
          />
        </fieldset>
      </div>
      <p style={{ textAlign: "center" }}>
        <button
          onClick={handleWithdrawal}
          disabled={isButtonsDisabled}
        >
          Confirm
        </button>
        <button
          onClick={onCancel}
          disabled={isButtonsDisabled}
        >
          Cancel
        </button>
      </p>
      <p className="feedback-text" hidden={isFeedbackHidden}>{feedback}</p>
    </>
  );
}