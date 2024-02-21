import React, { useState, useEffect } from "react";
import { AUTH_ACTOR } from "../index";

export default function Participate({ currentBalance, onTransferSuccess, onCancel }) {
  const [displayName, setDisplayName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isFeedbackHidden, setFeedbackHidden] = useState(true);
  const [isButtonsDisabled, setButtonsDisabled] = useState(false);

  useEffect(() => document.getElementById("displayName").scrollIntoView({ behavior: "smooth" }), []);

  async function handleParticipate() {
    setFeedbackHidden(true);
    setButtonsDisabled(true);

    if (displayName.length < 3)
      alert("Display name should be more than 2 chars");
    else if (currentBalance < 0.1001) {
      alert("Your deposit balance must be more than 0.1001 ICP (participation = 0.1 ICP; IC ledger transfer fee = 0.0001 ICP");
    } else {
      try {
        const result = await AUTH_ACTOR.participate(displayName);
        if (result == "Success") {
          scrollTo({ top: 0, behavior: "smooth" });
          onTransferSuccess();
        }

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
        <fieldset id="displayName">
          <legend>Display Name:</legend>
          <input
            type="text"
            maxLength="10"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </fieldset>
      </div>
      <p style={{ textAlign: "center" }}>
        <button
          onClick={handleParticipate}
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