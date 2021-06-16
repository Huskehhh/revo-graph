#[macro_use]
extern crate failure;

use actix_cors::Cors;
use failure::Error;

use std::thread::sleep;
use std::time::Duration;
use std::{env, thread};

use actix_web::{get, middleware, App, HttpResponse, HttpServer, Responder};
use once_cell::sync::Lazy;

use crate::db_helper::MySQLConnection;

mod db_helper;

pub static MYSQL: Lazy<MySQLConnection> = Lazy::new(MySQLConnection::default);

#[get("/graph")]
async fn graph() -> impl Responder {
    match MYSQL.get_data().await {
        Ok(data) => {
            let result = serde_json::to_string(&data).expect("Error unwrapping results");
            HttpResponse::Ok().json(result)
        }
        Err(why) => {
            eprint!("Error when retrieving data from database: {}", why);
            HttpResponse::InternalServerError().body("Error retrieving data")
        }
    }
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    std::env::set_var("RUST_LOG", "actix_web=info");
    env_logger::init();

    let bind_address = env::var("BIND_ADDRESS").unwrap_or_else(|_| "127.0.0.1:8010".to_owned());

    thread::spawn(move || {
        let url = "https://revofitness.com.au/wp-content/themes/blankslate/member_visits_api_calls/innaloo.json";
        loop {
            if let Err(why) = data_runner(url) {
                eprintln!("Error {}", why);
            }
            sleep(Duration::from_secs(600));
        }
    });

    println!("Starting up the server now!");

    HttpServer::new(|| {
        let allowed_origin =
            env::var("ALLOWED_ORIGIN").expect("No ALLOWED_ORIGIN environment variable set!");

        let cors = Cors::default()
            .allowed_origin(&allowed_origin)
            .allowed_methods(vec!["GET"]);
        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .service(graph)
    })
    .bind(bind_address)?
    .run()
    .await
}

#[tokio::main]
async fn data_runner(url: &str) -> Result<(), Error> {
    return match reqwest::Client::new().get(url).send().await {
        Ok(resp) => {
            let count = resp.json::<i32>().await.unwrap_or(0);

            let insert = format!(
            "INSERT INTO `graph_data` (`date_time`, `count`) VALUES (CONVERT_TZ(CURRENT_TIMESTAMP, 'Australia/Melbourne', 'Australia/Perth'), '{}');",
            count
        );

            MYSQL.execute_update(&insert).await;

            Ok(())
        }
        Err(why) => Err(format_err!("Error on the GET request... {}", why)),
    };
}
