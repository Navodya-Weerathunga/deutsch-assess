const express = require("express");
const crypto = require("crypto");

const router = express.Router();

const zoomService = require("../services/zoom.service");
const zoomAccount = require("../config/zoomAccounts");

// 🔐 Basic webhook security
function verifyWebhook(req) {
  const token = req.headers["authorization"];
  return token === zoomAccount.webhookSecretToken;
}

// ✅ FINAL ROUTE
router.post("/zoom", async (req, res) => {
  try {

    console.log("ZOOM BODY:", JSON.stringify(req.body, null, 2));

    const { event, payload } = req.body;

    // ✅ Zoom URL validation
    if (event === "endpoint.url_validation") {

      const plainToken = payload.plainToken;

      const encryptedToken = crypto
        .createHmac(
          "sha256",
          zoomAccount.webhookSecretToken
        )
        .update(plainToken)
        .digest("hex");

      return res.status(200).json({
        plainToken,
        encryptedToken
      });
    }

    // 🔐 Optional security
    // Skip during testing if needed
    // if (!verifyWebhook(req)) {
    //   return res.status(401).send("Unauthorized");
    // }

    // ✅ Recording completed
    if (event === "recording.completed") {

      console.log("📥 Recording completed webhook received");

      zoomService
        .handleRecordingCompleted(payload)
        .catch(err => console.error("Zoom processing error:", err));
    }

    // ✅ Meeting ended
    if (event === "meeting.ended") {
      console.log("Meeting ended:", payload.object.topic);
    }

    return res.status(200).send("OK");

  } catch (err) {

    console.error("Webhook error:", err);

    return res.status(500).send("Error");
  }
});

module.exports = router;