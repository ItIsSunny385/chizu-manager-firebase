const { join } = require('path')
const { https } = require('firebase-functions')
const { default: next } = require('next')
const express = require('express')

const routes = require('next-routes');
const basicAuth = require('basic-auth-connect');

const USERNAME = 'user';
const PASSWORD = 'password';

const server = express();

const nextjsDistDir = join('src', require('./src/next.config.js').distDir)

const app = next({
  dev: false,
  conf: {
    distDir: nextjsDistDir,
  },
})
const handler = routes().getRequestHandler(app);
server.use(basicAuth(USERNAME, PASSWORD));
server.get('*', (req, res) => handler(req, res));

exports.nextjsFunc = https.onRequest(server);
