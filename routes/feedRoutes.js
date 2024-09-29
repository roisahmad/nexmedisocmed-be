const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feedController");
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware.authenticateToken);

router.post("/", feedController.create);
router.get("/", feedController.getAll);
router.get("/:id", feedController.getById);
router.put("/:id", feedController.update);
router.delete("/:id", feedController.delete);

router.post("/:postId/comment", feedController.createComment);
router.put("/:postId/comment/:commentId", feedController.updateComment);
router.delete("/:postId/comment/:commentId", feedController.deleteComment);

router.post("/:postId/like", feedController.createLike);

module.exports = router;
