export const settings = {
    JWT_SECRET: process.env.JWT_SECRET || "123",
    MONGOOSE_URI: process.env.mongoURI || 'mongodb://localhost:27017/'
}