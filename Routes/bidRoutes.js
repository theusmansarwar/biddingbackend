const express = require("express");
const router = express.Router();
const { placeBid } = require("../Controller/bidController");

router.post("/", placeBid);

module.exports = router;
