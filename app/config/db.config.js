
const mongoose = require("mongoose");


mongoose.set('useFindAndModify', false);
const uri = "mongodb+srv://superadmin:jadore@cluster0.8ra1aqb.mongodb.net/team-srh?retryWrites=true&w=majority";


const db = mongoose.createConnection(uri, { useNewUrlParser: true, useUnifiedTopology: true });

db.on('error', (err) => {
  console.log(err)
})
db.once('open', () => {
  console.log('Database Connection Established!')
})

module.exports = {
  db
};