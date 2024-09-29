const sequelize = require("sequelize");
const _ = require("lodash");
const { successResponse, errorResponse } = require("../utils/response");
const path = require("path");
const fs = require("fs");
const getUploadMiddleware = require("../middlewares/uploadMiddleware");
const User = require("../models/user");
const Post = require("../models/post");
const Comment = require("../models/comment");
const Like = require("../models/like");

const feedUploadDir = path.join(__dirname, "../uploads/feeds");
const { upload: feedUpload, processImage: processFeedImage } =
  getUploadMiddleware(feedUploadDir, ["image/jpeg", "image/png", "image/gif"]);

exports.create = async (req, res) => {
  try {
    feedUpload.single("image_url")(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === "ETIMEDOUT") {
          return errorResponse(
            res,
            408,
            "Waktu unggahan terlalu lama. Silakan coba lagi."
          );
        }
        return errorResponse(res, 400, err.message);
      }

      try {
        const { content } = req.body;
        const userId = req.user.id;

        let feed_path = null;
        if (req.file) {
          feed_path = await processFeedImage(req.file.path);
          feed_path = path.relative(feedUploadDir, feed_path);
        }

        const user = await Post.create({
          content,
          image_url: feed_path,
          user_id: userId,
        });
        successResponse(res, 201, "Berhasil membuat postingan", user);
      } catch (err) {
        console.error(err);
        errorResponse(res, 500, "Internal server error");
      }
    });
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, "Internal server error");
  }
};

exports.getAll = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        { model: User, as: "user", attributes: ["username", "name"] },
        {
          model: Comment,
          as: "comments",
          include: {
            model: User,
            as: "user",
            attributes: ["username", "name"],
          },
        },
        { model: Like, as: "likes", attributes: [] },
      ],
      attributes: {
        include: [
          [sequelize.fn("COUNT", sequelize.col("likes.id")), "like_count"],
        ],
      },
      group: ["posts.id", "user.id", "comments.id", "comments->user.id"],

      order: [["created_at", "DESC"]],
    });

    const response = posts.map((post) => {
      return {
        id: post.id,
        content: post.content,
        image_url: post.image_url
          ? `${req.protocol}://${req.get("host")}/uploads/profile_pictures/${
              post.image_url
            }`
          : null,
        user: post.user,
        comments: post.comments
          ? post.comments.map((comment) => ({
              id: comment.id,
              content: comment.content,
              user: comment.user,
              created_at: comment.created_at,
            }))
          : [],
        like_count: post.dataValues.like_count || 0,
        created_at: post.created_at,
      };
    });

    successResponse(res, 200, "Berhasil mendapatkan data postingan", response);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Internal server error");
  }
};

exports.getById = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByPk(id, {
      include: [
        { model: User, as: "user", attributes: ["username", "name"] },
        {
          model: Comment,
          as: "comments",
          include: {
            model: User,
            as: "user",
            attributes: ["username", "name"],
          },
        },
        { model: Like, as: "likes", attributes: [] },
      ],
      attributes: {
        include: [
          [sequelize.fn("COUNT", sequelize.col("likes.id")), "like_count"],
        ],
      },
      group: ["posts.id", "user.id", "comments.id", "comments->user.id"],
    });
    if (!post) {
      return errorResponse(res, 404, "Postingan tidak ditemukan");
    }

    successResponse(res, 200, `Berhasil mendapatkan data postingan`, post);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Internal server error");
  }
};

exports.update = async (req, res) => {
  try {
    feedUpload.single("image_url")(req, res, async (err) => {
      if (err) {
        if (err instanceof multer.MulterError && err.code === "ETIMEDOUT") {
          return errorResponse(
            res,
            408,
            "Waktu unggahan terlalu lama. Silakan coba lagi."
          );
        }
        return errorResponse(res, 400, err.message);
      }

      try {
        const { content } = req.body;
        const postId = req.params.id;
        const userId = req.user.id;

        const post = await Post.findOne({
          where: { id: postId, user_id: userId },
        });

        if (!post) {
          return errorResponse(
            res,
            404,
            "Post tidak ditemukan atau Anda tidak memiliki izin untuk mengeditnya."
          );
        }

        let feed_path = post.image_url;
        if (req.file) {
          feed_path = await processFeedImage(req.file.path);
          feed_path = path.relative(feedUploadDir, feed_path);

          if (post.image_url && post.image_url !== feed_path) {
            const oldImagePath = path.join(feedUploadDir, post.image_url);
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          }
        }

        await post.update({
          content: content || post.content,
          image_url: feed_path,
        });

        successResponse(res, 200, "Berhasil mengedit postingan", post);
      } catch (err) {
        console.error(err);
        errorResponse(res, 500, "Internal server error");
      }
    });
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, "Internal server error");
  }
};

exports.delete = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    const post = await Post.findOne({ where: { id: postId, user_id: userId } });

    if (!post) {
      return errorResponse(
        res,
        404,
        "Post tidak ditemukan atau Anda tidak memiliki izin untuk menghapusnya."
      );
    }

    if (post.image_url) {
      const imagePath = path.join(feedUploadDir, post.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await post.destroy();

    successResponse(res, 200, "Post berhasil dihapus");
  } catch (err) {
    console.error(err);
    errorResponse(res, 500, "Internal server error");
  }
};

exports.createComment = async (req, res) => {
  const { content } = req.body;
  const postId = req.params.postId;
  const userId = req.user.id;

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return errorResponse(res, 404, "Postingan tidak ditemukan");
    }
    const comment = await Comment.create({
      content,
      user_id: userId,
      post_id: postId,
    });

    successResponse(res, 201, `Berhasil membuat komentar`, comment);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Internal server error");
  }
};

exports.updateComment = async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user.id;
  const { content } = req.body;

  try {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return errorResponse(res, 404, "Komentar tidak ditemukan");
    }

    if (comment.user_id !== userId) {
      return errorResponse(
        res,
        403,
        "Anda tidak memiliki izin untuk mengeditnya."
      );
    }

    comment.content = content;
    await comment.save();

    successResponse(res, 201, `Berhasil update komentar`, comment);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Internal server error");
  }
};

exports.deleteComment = async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user.id;

  try {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return errorResponse(res, 404, "Komentar tidak ditemukan");
    }

    if (comment.user_id !== userId) {
      return errorResponse(
        res,
        403,
        "Anda tidak memiliki izin untuk mengeditnya."
      );
    }

    await comment.destroy();
    successResponse(res, 201, `Berhasil update komentar`, comment);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Internal server error");
  }
};

exports.createLike = async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return errorResponse(res, 404, "Komentar tidak ditemukan");
    }

    const existingLike = await Like.findOne({
      where: { user_id: userId, post_id: postId },
    });

    if (existingLike) {
      return errorResponse(
        res,
        400,
        "Anda sudah memberikan like pada postingan ini"
      );
    }

    const like = await Like.create({
      user_id: userId,
      post_id: postId,
    });

    successResponse(res, 201, `Berhasil menyukai postingan`, like);
  } catch (error) {
    console.error(error);
    errorResponse(res, 500, "Internal server error");
  }
};
