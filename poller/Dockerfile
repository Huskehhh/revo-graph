FROM rust:slim-buster as builder

WORKDIR /home/rust/
COPY . .

RUN cargo install --path .

FROM debian:stable-slim
COPY --from=builder /usr/local/cargo/bin/revo-poller /

CMD ["./revo-poller"]