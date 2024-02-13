import mongoose from 'mongoose';
import {config} from '/config/config';

const setupMongoDB = () => {
  // Setup testing database for L1 test
  beforeAll(async () => {
    mongoose.connect(
      /* istanbul ignore next */
      config.env == 'circleci' ? config.mongodbci : config.mongodb,
      {
        dbName: 'test-fse',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    );
  });

  afterEach(async () => {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  });

  afterAll(async () => {
    mongoose.connection.close();
  });
};

export default setupMongoDB;
