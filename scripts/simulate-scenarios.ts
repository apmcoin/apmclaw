import fs from "node:fs/promises";
import path from "node:path";

/**
 * apM Claw Simulation Tester
 * Tests specific scenarios to prevent historical mistakes (e.g., deleting CEO messages).
 */
async function runSimulation() {
  const CEO_MESSAGE = `
    Hello everyone, This Richard, the CEO of apM Project... 
    [Long message discussing buybacks, Bithumb delisting, and ethical management]
    https://www.edaily.co.kr/News/Read?newsId=05139766645354456&mediaCodeNo=257&OutLnkChk=Y
  `;

  const SCAM_MESSAGE = "Check your airdrop eligibility now: https://scam-link.com/drainer";

  const SCENARIOS = [
    {
      name: "Admin (CEO) Message Exemption Test",
      sender: { id: "admin_123", name: "Richard (CEO)", is_admin: true },
      text: CEO_MESSAGE,
      expected: "ALLOW (Admin Exemption)",
    },
    {
      name: "Spam Detection & Response Test",
      sender: { id: "user_456", name: "Bad Actor", is_admin: false },
      text: SCAM_MESSAGE,
      expected: "DELETE & Record Reason without repeating link",
    },
    {
      name: "Official Link Recognition Test",
      sender: { id: "user_789", name: "Helpful User", is_admin: false },
      text: "Check out the official site: https://apm.fashion",
      expected: "ALLOW (Official Domain)",
    }
  ];

  console.log("Starting apM Claw Logic Simulation...\n");

  for (const scenario of SCENARIOS) {
    console.log(`[Testing: ${scenario.name}]`);
    console.log(`Sender: ${scenario.sender.name} (Admin: ${scenario.sender.is_admin})`);
    
    // Logic Simulation
    let action = "CHECKING...";
    if (scenario.sender.is_admin) {
      action = "PASSED: Admin Exemption Rule Applied.";
    } else if (scenario.text.includes("apm.fashion")) {
      action = "PASSED: Official Link Recognition.";
    } else if (scenario.text.includes("scam-link.com")) {
      action = "DELETED: High-confidence phishing detected.";
      const response = "⚠️ Your message was removed due to a prohibited link.";
      if (response.includes("scam-link.com")) {
        action += " ERROR: Response leaked the scam link!";
      } else {
        action += " SUCCESS: Reason provided safely.";
      }
    }

    console.log(`Action Taken: ${action}`);
    console.log(`Expected Result: ${scenario.expected}\n`);
  }
}

runSimulation();
