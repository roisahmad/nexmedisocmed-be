const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const User = require("./user");
const Post = require("./post");

const Like = sequelize.define(
  "likes",
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

Post.hasMany(Like, { foreignKey: "post_id", as: "likes" });
Like.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});
Like.belongsTo(Post, {
  foreignKey: "post_id",
  as: "post",
});

module.exports = Like;
