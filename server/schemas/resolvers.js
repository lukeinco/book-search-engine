const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        throw new Error('You must be logged in to view this information.');
      }
      const foundUser = await User.findOne({ _id: user._id });
      return foundUser;
    },
  },
  Mutation: {
    login: async (_, { body }, res) => {
      const user = await User.findOne({ $or: [{ username: body.username }, { email: body.email }] });
      if (!user) {
        throw new Error("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(body.password);

      if (!correctPw) {
        throw new Error('Wrong password!');
      }
      const token = signToken(user);
      return { token, user };
    },
    addUser: async (_, { body }, res) => {
      const user = await User.create(body);

      if (!user) {
        throw new Error('Something is wrong!');
      }
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (_, { user, body }, res) => {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: body } },
          { new: true, runValidators: true }
        );
        return updatedUser;
      } catch (err) {
        console.log(err);
        throw new Error('Failed to save the book.');
      }
    },
    removeBook: async (_, { user, params }, res) => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: params.bookId } } },
        { new: true }
      );
      if (!updatedUser) {
        throw new Error("Couldn't find user with this id!");
      }
      return updatedUser;
    },
  },
};

module.exports = resolvers;
