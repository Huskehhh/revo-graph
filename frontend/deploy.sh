#!/bin/bash

npm install
npm run build

tar -cvf ./deploy.tar --exclude='*.map' ./captain-definition ./dist/*

caprover deploy -t ./deploy.tar -a revo-frontend
