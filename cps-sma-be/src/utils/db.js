const mongoose = require("mongoose");
const { MONGODB } = require('../../config');

const connectToDb = async () => {
  try { process.env.MONGOURI
    const connection = await mongoose.connect(MONGODB, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });

    console.log(`Connected to database ${connection.connections[0].name}`);
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectToDb;