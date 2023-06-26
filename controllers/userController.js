const { User, Thought } = require('../models');

// Aggregate function to get the number of users overall
const headCount = async () => {
    try {
        const userCount = await User.aggregate().count('userCount');

        if (userCount.length === 0) {
            return 0;
        }

        return userCount[0].userCount;
    } catch (err) {
        console.log(err);
        throw err;
    }
};


module.exports = {
    // GET all users
    async getAllUsers(req, res) {
        try {
            const allUsers = await User.find({});

            const userObj = {
                allUsers,
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
            const singleUser = await User.findById(req.params.userId)
                .populate({
                    path: 'thoughts',
                    select: '-__v',
                })
                .populate({
                    path: 'friends',
                    select: '-__v',
                });
            if (!singleUser) {
                return res.status(404).json({ message: 'No user with this id!' });
            }
            res.json(singleUser);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // POST a new user:
    async createUser(req, res) {
        try {
            const newUser = await User.create(req.body);
            if (!newUser) {
                return res.status(404).json({ message: 'Unsuccessful in creating new user!' });
            }
            res.json(newUser);
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
                if (!updatedUser) {
                    return res.status(404).json({ message: 'Could not update user!' });
                }
            res.json(updatedUser);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // DELETE to remove user by its _id
    async deleteUser(req, res) {
        try {
            const deletedUser = await User.findByIdAndDelete(req.params.userId);

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
            const newFriend = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $addToSet: { friends: req.body.objectId } },
                { runValidators: true, new: true }
            );

            if (!newFriend) {
                return res.status(404).json({ message: 'This friend does not exist!' });
            }

            res.json(newFriend);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // DELETE to remove a friend from a user's friend list
    async removeFriend(req, res) {
        try {
            const deletedFriend = await User.findOneAndUpdate(
                { _id: req.params.userId },
                { $pull: { friends: req.params.objectId } },
                { runValidators: true, new: true }
            );

            if (!deletedFriend) {
                return res.status(404).json({ message: 'No friend to delete!' });
            }
            res.json(deletedFriend);
        } catch (err) {
            res.status(500).json(err);
        }
    },
};
