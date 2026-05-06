const User = require('./User');
const Link = require('./Link');
const Click = require('./Click');

// Associations
User.hasMany(Link, { foreignKey: 'user_id', as: 'links', onDelete: 'CASCADE' });
Link.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

Link.hasMany(Click, { foreignKey: 'link_id', as: 'clicks', onDelete: 'CASCADE' });
Click.belongsTo(Link, { foreignKey: 'link_id', as: 'link' });

module.exports = { User, Link, Click };
