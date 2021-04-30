const Sequelize = require("sequelize");

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        // 모델 속성
        email: {
          type: Sequelize.STRING(30),
          allowNull: true,
          unique: true,
        },
        nick: {
          type: Sequelize.STRING(30),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(100), // 해시화 때문에 넉넉하게
          allowNull: true,
        },
        provider: {
          type: Sequelize.STRING(20),
          allowNull: false,
          defaultValue: "local",
        },
        snsId: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
      },
      {
        // 옵션
        sequelize,
        modelName: "User",
        tableName: "users",

        timestamps: true,
        paranoid: true,
        underscored: false,

        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Post);
    db.User.belongsToMany(db.User, {
      // 팔로워하는 관계
      foreignKey: "followingId", // 외래키
      as: "Followers",
      through: "Follow",
    });
    db.User.belongsToMany(db.User, {
      // 팔로잉하는 관계
      foreignKey: "followerId",
      as: "Followings",
      through: "Follow",
    });
    db.User.hasMany(db.Domain);
  }
};
