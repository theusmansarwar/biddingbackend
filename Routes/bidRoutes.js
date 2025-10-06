const express = require("express");
const router = express.Router();
const { placeBid, producttop5Bid } = require("../Controller/bidController");

router.post("/", placeBid);
router.get("/:productId", producttop5Bid);

module.exports = router;
