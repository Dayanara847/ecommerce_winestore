const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('order', {
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM([
        'created',
        'canceled',
        'pending',
        'completed',
        'cart',
      ]),
      defaultValue: 'cart',
    },
  });
};
