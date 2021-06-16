FROM rust:latest as builder

WORKDIR /usr/src/revo-graph
COPY backend .

RUN cargo install --path .

FROM debian:latest

RUN apt-get update && apt-get upgrade -y
RUN apt-get install mariadb-client -y
RUN apt-get install ca-certificates -y
RUN apt-get install openssl -y

COPY --from=builder /usr/local/cargo/bin/revo-graph /

CMD ["./revo-graph"]
