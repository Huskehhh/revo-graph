git pull
cd static
yarn install
yarn build -g
cd ..
screen -S revo cargo run --release