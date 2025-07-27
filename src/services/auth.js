const { User } = require("../models");
async function findAllUser() {
  return await User.find();
}
async function findUser({ id, email, username }, selectField = false) {
  const query = {};
  if (id) query._id = id;
  if (email) query.email = email;
  if (username) query.username = username;

  const userQuery = User.findOne({
    $or: [
      id ? { _id: id } : null,
      email ? { email } : null,
      username ? { username } : null,
    ].filter(Boolean),
  });
  if (selectField) {
    userQuery.select(selectField);
  }
  return await userQuery;
}
async function createUserOrUpdate(userData, updateUser) {
  if (Boolean(updateUser)) {
    for (let key in userData) {
      updateUser[key] = userData[key];
    }
    return await updateUser.save();
  }
  const data = new User(userData);
  return await data.save();
}

module.exports = {
  findUser,
  createUserOrUpdate,
  findAllUser,
};
