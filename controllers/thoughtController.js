const { Thought, User } = require('../models');

module.exports = {
    // get all thoughts
    async getAllThoughts(req, res) {
        try {
            console.log("getAllThoughts");
            const thoughts = await Thought.find();
            console.log(thoughts);
            res.json(thoughts);
        } catch (err) {
            console.log(err);
            res.status(500).json(err);
        }
    },
    // get a single thought by its _id
    async getSingleThought(req, res) {
        try {
            const singleThought = await Thought.findById(req.params.thoughtId ).select('-__v');
            
            if (!singleThought) {
                return res.status(404).json({ message: 'No thought with this id!' });
            }
            res.json(singleThought);
        }   catch (err) {
            res.status(500).json(err);
        }
    },
    // POST to create a new thought (don't forget to push the created thought's _id to the associated user's thoughts array field)
    async createThought(req, res) {
        try {
            const newThought = await Thought.create(req.body);
            console.log("thought", newThought);
            const user = await User.findOneAndUpdate(
                { username: req.body.username },
                { $push: { thoughts: newThought._id } },
                { new: true }
            );

            if (!user) {
                return res.status(404).json({ message: 'No user with this id!' });
            }
            res.json(newThought);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // PUT to update a thought by its _id
    async updateThought(req, res) {
        try {
            const editThought = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId },
                { $set: req.body },
                { runValidators: true, new: true }
            );

            if (!editThought) {
                return res.status(404).json({ message: 'No thought with this id!' });
            }

            res.json(editThought);
        } catch (err) {
            res.status(500).json(err);
        }
    },
    // DELETE to remove a thought by its _id
    async deleteThought(req, res) {
        try {
            const deleteThought = await Thought.findOneAndDelete({ _id: req.params.thoughtId });

            if (!deleteThought) {
                return res.status(404).json({ message: 'No thought with this id!' });
            }

            await User.findOneAndUpdate( 
                { username: deleteThought.username },
                { $pull: { thoughts: deleteThought._id } },
                { validation: true, new: true } 
            );
            
            res.json(deleteThought);
        } catch (err) {
            res.status(500).json(err);
        }
    },

    // POST to create a reaction stored in a single thought's reactions array field
    async addReaction(req, res) {
        try {
            const newReaction = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId },
                { $push: { reactions: req.body } },
                { runValidators: true, new: true }
            );

            if (!newReaction) {
                return res.status(404).json({ message: 'No thought with this id!' });
            }

            res.json(newReaction);
        }
        catch (err) {
            res.status(500).json(err);
        }
    },
    // DELETE to pull and remove a reaction by the reaction's reactionId value
    async removeReaction(req, res) {
        try {
            const deleteReaction = await Thought.findOneAndUpdate(
                { _id: req.params.thoughtId },
                { $pull: { reactions: { reactionId: req.params.reactionId } } },
                { runValidators: true, new: true }
            );

            if (!deleteReaction) {
                return res.status(404).json({ message: 'No thought with this id!' });
            }

            res.json(deleteReaction);
        } catch (err) {
            res.status(500).json(err);
        }
    }
};

