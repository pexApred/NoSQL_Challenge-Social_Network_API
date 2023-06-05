const { Schema, model } = require('mongoose');

// Create the Thought model using the thoughtSchema
const thoughtSchema = new Schema(
    {
        thoughtText: {
            type: String,
            required: 'Thought is required!',
            minlength: 1,
            maxlength: 280
        },
        createdAt: {
            type: Date,
            default: Date.now(),
            // Use a getter method to format the timestamp on query
            get: (createdAtVal) => dateFormat(createdAtVal)
        },
        username: {
            type: String,
            required: 'Username is required!'
        },
        // use ReplySchema to validate data for a reply
        reactions: [reactionSchema]
    },
    {
        toJSON: {
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
module.exports = Thought;