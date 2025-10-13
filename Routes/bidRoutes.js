const express = require("express");
const router = express.Router();
const { placeBid, producttop5Bid, getAllBids, softDeleteMultipleBids, getLatest5Bids } = require("../Controller/bidController");

router.post("/", placeBid);
router.get("/bidlist/:productId", producttop5Bid);
router.get("/listbidders", getAllBids);
router.get("/listlivebidders", getLatest5Bids);
router.delete("/delete-multiple", softDeleteMultipleBids);

module.exports = router;
