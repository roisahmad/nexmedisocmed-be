const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = require("./user");
const Post = require("./post");

const Comment = sequelize.define(
  "comments",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    post_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Post,
        key: "id",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: false,
  }
);

Post.hasMany(Comment, { foreignKey: "post_id", as: "comments" });

Comment.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});
Comment.belongsTo(Post, {
  foreignKey: "post_id",
  as: "post",
});

module.exports = Comment;
