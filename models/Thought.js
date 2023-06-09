const { Schema, model } = require('mongoose');
const dateFormat = require('../utils/dateFormat');
const reactionSchema = require('./Reaction');
// Create the Thought model using the thoughtSchema
const thoughtSchema = new Schema(
    {
        thoughtText: {
            type: String,
            required: 'You need to provide a thought!',
            minlength: 1,
            maxlength: 280
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            // Use a getter method to format the timestamp on query
            get: function (currentDate) {
                return dateFormat(currentDate);
            }
        },
        username: {
            type: String,
            required: 'You need to provide a username!'
        },
        // use ReplySchema to validate data for a reply
        reactions: [reactionSchema]
    },
    {
        toJSON: {
            virtuals: true,
            getters: true
        },
        id: false
        }
);

// get total count of reactions on retrieval
thoughtSchema.virtual('reactionCount').get(function () {
    return this.reactions.length;
});

// create the Thought model using the ThoughtSchema
const Thought = model('Thought', thoughtSchema);

// export the Thought model
module.exports = Thought ;