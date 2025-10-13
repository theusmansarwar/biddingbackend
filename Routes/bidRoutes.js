const express = require("express");
const router = express.Router();
const { placeBid, producttop5Bid, getAllBids, softDeleteBid } = require("../Controller/bidController");

router.post("/", placeBid);
router.get("/bidlist/:productId", producttop5Bid);
router.get("/listbidders", getAllBids);
router.post("/delete-multiple", softDeleteBid);

module.exports = router;
