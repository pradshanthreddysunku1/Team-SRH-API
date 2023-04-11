const mongoose = require("mongoose");

const Feedback = mongoose.model(
  "feedback",
  new mongoose.Schema({
    fromLanguage: String,
    inputText: String,
    toLanguage: String,
    outputText: String,
    feedbackText: String,
    user: 
      {
        id:  {
            type:mongoose.Schema.Types.ObjectId,
             ref:"user"
         }
      }
  })
);

module.exports = Feedback;
