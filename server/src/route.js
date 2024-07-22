const { Router } = require("express");
const crux = require("./controllers/crux");

const router = Router();

router.get("/test", (req, res) => res.send({ status: true }));
router.post("/crux", crux);

module.exports = router;
