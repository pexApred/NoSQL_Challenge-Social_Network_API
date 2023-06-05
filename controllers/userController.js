// const { objectId } = require('mongoose').Types;
const { User, Thought } = require('../models');

// Aggregate function to get the number of users overall
const headCount = async () => {
    const userCount = await User.aggregate().count('userCount');
    return userCount;
}

module.exports = {
    // GET all users
    async getAllUsers(req, res) {
        try {
            const users = await User.find({});

            const userObj = {
                users,
                headCount: await headCount(),
            };

            res.json(userObj);
        } catch (err) {
            console.log(err);
            return res.status(500).json(err);
        }
    },
    // GET a single user by its _id and populated thought and friend data
    async getSingleUser(req, res) {
        try {
            const user = await User.findOne({ _id: req.params.userId })
                .populate({
                    path: 'thoughts',
                    select: '-__v',
                })
                .populate({
                    path: 'friends',
                    select: '-__v',
                });

            if (!user) {
                return res.status(404).json({ message: 'No user with this id!' });
            }

            res.json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // POST a new user:
    async createUser(req, res) {
        try {
            const user = await User.create(req.body);
            res.json(user);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // PUT to update a user by its _id
    async updateUser(req, res) {
        try {
            const updatedUser = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $set: req.body },
                { runValidators: true, new: true }
            );
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // DELETE to remove user by its _id
    async deleteUser(req, res) {
        try {
            const deletedUser = await User.findOneAndRemove({ _id: req.params.userId });

            if (!deletedUser) {
                return res.status(404).json({ message: 'No such user exists!' });
            }

            // Remove the user from any friends arrays
            await User.updateMany(
                { _id: { $in: deletedUser.friends } },
                { $pull: { friends: req.params.userId } },
                { new: true }
            );

            // Remove any comments from this user
            await Thought.deleteMany({ username: deletedUser.username });

            res.json(deletedUser);
        }
        catch (err) {
            res.status(500).json(err);
        }
    },

    // POST to add a new friend to a user's friend list
    async addFriend(req, res) {
        console.log('You are adding a friend!');
        console.log(req.body);

        try {
            const updatedUser = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $addToSet: { friends: req.body } },
                { runValidators: true, new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'No user with this id!' });
            }

            res.json(updatedUser);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // DELETE to remove a friend from a user's friend list
    async removeFriend(req, res) {
        try {
            const updatedUser = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $pull: { friends: req.params.friendId } },
                { runValidators: true, new: true }
            );

            if (!updatedUser) {
                return res.status(404).json({ message: 'No user with this id!' });
            }

            res.json(updatedUser);
        } catch (err) {
            res.status(500).json(err);
        }
    },
};