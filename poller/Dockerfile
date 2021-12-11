FROM rust:slim-buster as builder

WORKDIR /home/rust/

RUN apt-get update && apt-get upgrade -y
RUN apt-get install libssl-dev pkg-config -y

COPY . .

RUN cargo install --path .

FROM debian:stable-slim
RUN apt-get update && apt-get upgrade -y
RUN apt-get install ca-certificates openssl -y
COPY --from=builder /usr/local/cargo/bin/revo-poller /

CMD ["./revo-poller"]