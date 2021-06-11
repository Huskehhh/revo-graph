#!/bin/bash

git pull
cd static
yarn install
yarn build -g
