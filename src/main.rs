use std::thread::sleep;
use std::time::Duration;
use std::{env, thread};

use actix_web::http::StatusCode;
use actix_web::{middleware, web, App, HttpResponse, HttpServer, Responder};
use once_cell::sync::Lazy;

use crate::db_helper::MySQLConnection;

mod db_helper;

pub static MYSQL: Lazy<MySQLConnection> = Lazy::new(|| MySQLConnection::new());

/// Default path
async fn index() -> actix_web::Result<HttpResponse> {
    Ok(HttpResponse::build(StatusCode::OK)
        .content_type("text/html; charset=utf-8")
        .body(include_str!("../static/dist/index.html")))
}

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

    let bind_address = env::var("BIND_ADDRESS").unwrap_or("127.0.0.1:8010".to_owned());

    thread::spawn(move || {
        loop {
            if let Err(why) = data_runner() {
                eprintln!("Error {}", why);
            }
            // Sleep for a minute!
            sleep(Duration::from_secs(600));
        }
    });

    println!("Starting up the server now!");

    HttpServer::new(|| {
        App::new()
            .wrap(middleware::Logger::default())
            .service(web::resource("/api/graph").route(web::get().to(graph)))
            .service(web::resource("/").route(web::get().to(index)))
            .service(actix_files::Files::new("/", "static/dist/").show_files_listing())
    })
    .bind(bind_address)?
    .run()
    .await
}

#[tokio::main]
async fn data_runner() -> Result<(), Box<dyn std::error::Error>> {
    let url = "https://revofitness.com.au/wp-content/themes/blankslate/member_visits_api_calls/innaloo.json";
    let count = reqwest::Client::new()
        .get(url)
        .send()
        .await
        .expect("Something went wrong with the GET request!")
        .json::<i32>()
        .await
        .unwrap_or(0);

    let insert = format!(
            "INSERT INTO `graph_data` (`date_time`, `count`) VALUES (CONVERT_TZ(CURRENT_TIMESTAMP, 'Australia/Melbourne', 'Australia/Perth'), '{}');",
            count
        );

    MYSQL.execute_update(&insert).await;

    Ok(())
}
