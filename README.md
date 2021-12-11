# Revo graph

A silly tool to graph the number of people in some of Revo's gyms in a completely overkill way.

## Poller

The poller is written in Rust and makes use of a Hasura GraphQL backend. It simply grabs the number of active members from Revo's endpoint(s) and stores it in the database.

## UI

The UI is built with React with TypeScript using MUI for design elements while making GraphQL requests to Hasura with Apollo