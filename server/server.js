const express = require('express');
// const helmet = require('helmet');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const path = require('path');
const { authMiddleware } = require('./utils/auth');

const { typeDefs, resolvers } = require('./schemas');
const db = require('./config/connection');

const PORT = process.env.PORT || 3000;
const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

app.get('*.js', function (req, res, next) {
  res.type('application/javascript');
  next();
});

const startApolloServer = async () => {
  await server.start();
  
  // app.use(helmet.contentSecurityPolicy({
  //   directives: {
  //     defaultSrc: ["'none'"],
  //     fontSrc: ["'self'", 'https://fonts.gstatic.com'],
  //     styleSrc: ["'self'", 'https://fonts.googleapis.com'],
  //   },
  // }));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  
  app.use('/graphql', expressMiddleware(server, {
    context: authMiddleware
  }));

  
  
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
  }


  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};

startApolloServer();


