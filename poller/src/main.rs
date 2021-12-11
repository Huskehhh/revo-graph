#![allow(non_camel_case_types)]

use std::thread::sleep;
use std::time::Duration;

use anyhow::{Error, Result};
use chrono::{DateTime, Local};
use get_gyms::GetGymsRevoGyms;
use graphql_client::GraphQLQuery;

use graphql_client::reqwest::post_graphql;
use reqwest::{
    header::{HeaderMap, HeaderValue},
    Client, ClientBuilder,
};

// This is required for GraphQL to resolve the type.
type bigint = i64;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "graphql/schema.graphql",
    query_path = "graphql/mutation.graphql",
    response_derives = "Debug"
)]
pub struct AddGraphEntryMutation;

#[derive(GraphQLQuery)]
#[graphql(
    schema_path = "graphql/schema.graphql",
    query_path = "graphql/query.graphql",
    response_derives = "Debug"
)]
pub struct GetGyms;

#[tokio::main]
async fn main() -> Result<()> {
    dotenv::dotenv().ok();
    println!("Starting poller!");

    let hasura_api_key = std::env::var("HASURA_API_KEY").expect("HASURA_API_KEY not set!");
    let hasura_api_url = std::env::var("HASURA_API_URL").expect("HASURA_API_URL not set!");

    let client = ClientBuilder::new()
        .timeout(Duration::from_secs(5))
        .build()
        .expect("Error when creating reqwest client");

    let hasura_client = create_hasura_reqwest_client(&hasura_api_key)?;

    let variables = get_gyms::Variables {};
    let response_body = post_graphql::<GetGyms, _>(&hasura_client, &hasura_api_url, variables).await?;

    if let Some(data) = response_body.data {
        let gyms = data.revo_gyms;

        loop {
            for gym in gyms.iter() {
                if let Err(why) = data_runner(&client, gym, &hasura_client, &hasura_api_url).await {
                    eprintln!("Error when retrieving count for gym: {}! {}", gym.name, why);
                }
            }

            // Sleep for 10 mins!
            sleep(Duration::from_secs(600));
        }
    }

    Ok(())
}

pub async fn data_runner(
    client: &Client,
    gym: &GetGymsRevoGyms,
    hasura_client: &Client,
    hasura_api_url: &str,
) -> Result<(), Error> {
    let url = format!(
        "https://revofitness.com.au/wp-content/themes/blankslate/member_visits_api_calls/{}.json",
        gym.name.to_lowercase()
    );

    match client.get(url).send().await {
        Ok(resp) => {
            let count = resp.json::<i64>().await.unwrap_or(0);

            let local: DateTime<Local> = Local::now();
            let unix_epoch = local.timestamp();

            let variables = add_graph_entry_mutation::Variables {
                count,
                epoch: unix_epoch,
                gym_id: gym.id
            };

            println!("Adding entry for gym: {} with count of {}", gym.name, count);
            post_graphql::<AddGraphEntryMutation, _>(hasura_client, hasura_api_url, variables).await?;

            Ok(())
        }
        Err(why) => Err(why.into()),
    }
}

pub fn create_hasura_reqwest_client(hasura_api_key: &str) -> Result<Client, Error> {
    let mut headers = HeaderMap::new();

    let auth_header = HeaderValue::from_str(hasura_api_key)?;

    let content_type_header = HeaderValue::from_str("application/json")
        .expect("Error when creating content type header for hasura client");

    headers.insert("x-hasura-admin-secret", auth_header);
    headers.insert("Content-Type", content_type_header);

    Ok(ClientBuilder::new()
        .timeout(Duration::from_secs(5))
        .default_headers(headers)
        .build()?)
}
