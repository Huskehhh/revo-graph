use mysql::{PooledConn, Pool};
use std::env;
use mysql::prelude::Queryable;
use serde::{Serialize, Deserialize};
use std::error::Error;

pub struct MySQLConnection {
    pub pool: Pool,
}

#[derive(Serialize, Deserialize)]
pub struct Data {
    pub date_time: String,
    pub count: i32
}

impl MySQLConnection {
    pub fn new() -> MySQLConnection {
        let url = env::var("MYSQL_DB_CONN_STR").expect("No MySQL_DB_CONN_STR env var!");
        let pool = Pool::new(&url).unwrap();
        MySQLConnection { pool }
    }

    pub async fn execute_update(&self, statement: &str) {
        let conn: &mut PooledConn = &mut self.pool.get_conn().unwrap();
        if let Err(why) = conn.query_drop(statement) {
            println!("{}", why);
        }
    }

    pub async fn get_data(&self) -> Result<Vec<Data>, Box<dyn Error>> {
        let conn: &mut PooledConn = &mut self.pool.get_conn()?;

       Ok(conn
            .query_map(
                "SELECT date_time, count FROM `revo-data`.`graph-data",
                |(date_time, count)| {
                    Data {date_time, count}
                },
            )?)
    }
}