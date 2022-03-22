const express   = require('express');
const pg        = require('pg');

// CORS settings
const apphost = process.env.FE_HOST;
const appport = process.env.FE_PORT;

// DB Config
const db_config = {
    host: process.env.PG_HOST,
    port: process.env.PG_PORT,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    ssl: false,
};

// DB Init
const pool = new pg.Pool(db_config);
pool.connect(function (err, client, done) {
    if (err) {
       console.log('Can not connect to the DB' + err);
       process.exit(1);
    }
    client.query(`CREATE TABLE IF NOT EXISTS dev_table(
            id SMALLINT PRIMARY KEY NOT NULL ,
            total BIGINT
        );
        INSERT INTO dev_table (id, total)
            VALUES(999,0)
            ON CONFLICT (id)
            DO NOTHING;`,
        function (err, result) {
            if (err) {
                console.log(err);
                process.exit(1);
            }
        }
    );
});

//Web APIs
const app = express();
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', `http://${apphost}:${appport}`);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.get('/get', (req, res) => {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Can not connect to the DB' + err);
        }
        client.query('SELECT total FROM dev_table WHERE id = 999;', function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            res.status(200).send(result.rows[0]);
        })
    })
});
app.get('/add', (req, res) => {
    pool.connect(function (err, client, done) {
        if (err) {
            console.log('Can not connect to the DB' + err);
        }
        client.query('UPDATE dev_table SET total = total + 1 WHERE id = 999;', function (err, result) {
            done();
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            res.status(200).send('Done\n');
        })
    })
});

//Web configs
const PORT = 8080;
app.listen(PORT);
console.log(`Running on port ${PORT}`);