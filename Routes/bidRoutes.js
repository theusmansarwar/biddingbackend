const express = require("express");
const router = express.Router();
const { placeBid, producttop5Bid, getAllBids } = require("../Controller/bidController");

router.post("/", placeBid);
router.get("/bidlist/:productId", producttop5Bid);
router.get("/listbidders", getAllBids);

module.exports = router;
