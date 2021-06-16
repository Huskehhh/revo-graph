extern crate mysql;
extern crate r2d2;
extern crate r2d2_mysql;

use failure::Error;

use mysql::{prelude::Queryable, Opts, OptsBuilder};
use r2d2_mysql::MysqlConnectionManager;
use serde::{Deserialize, Serialize};
use std::{env, sync::Arc};

pub struct MySQLConnection {
    pub pool: Arc<r2d2::Pool<MysqlConnectionManager>>,
}

#[derive(Serialize, Deserialize)]
pub struct Data {
    pub date_time: String,
    pub count: i32,
}

impl MySQLConnection {
    pub async fn execute_update(&self, statement: &str) {
        let conn = &mut self.pool.get().expect("Unable to get connection from pool");

        if let Err(why) = conn.query_drop(statement) {
            println!("{}", why);
        }
    }

    pub async fn get_data(&self) -> Result<Vec<Data>, Error> {
        let conn = &mut self.pool.get().expect("Unable to get connection from pool");

        Ok(conn
            .query_map(
                "SELECT `date_time`, `count` FROM `graph_data` WHERE `date_time` > date_sub(now(), interval 5 day);",
                |(date_time, count)| {
                    Data {date_time, count}
                },
            )?)
    }
}

impl Default for MySQLConnection {
    fn default() -> Self {
        let url = env::var("DATABASE_URL").expect("No 'DATABASE_URL' env var!");
        let opts = Opts::from_url(&url).unwrap();
        let builder = OptsBuilder::from_opts(opts);
        let manager = MysqlConnectionManager::new(builder);
        let pool = Arc::new(r2d2::Pool::builder().max_size(10).build(manager).unwrap());

        MySQLConnection { pool }
    }
}
