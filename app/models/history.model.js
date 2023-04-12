const mongoose = require("mongoose");

const History = mongoose.model(
  "history",
  new mongoose.Schema({
    fromLanguage: String,
    inputText: String,
    toLanguage: String,
    outputText: String,
    user: 
      {
        id:  {
            type:mongoose.Schema.Types.ObjectId,
             ref:"user"
         }
      }
  })
);

module.exports = History;
