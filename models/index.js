const User = mongoose.model('User', userSchema );
const Thought = mongoose.model('Thought', thoughtSchema);

module.exports = { User, Thought };