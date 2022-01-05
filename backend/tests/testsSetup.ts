import { Client } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config({
    path: __dirname.substring(0, __dirname.lastIndexOf('\\')) + '\\.test.env',
});

//clear db before test
module.exports = async () => {
    const client: Client = new Client({
        connectionString: `postgresql://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,
    });

    await client.connect();
    const result = await client.query(`DO $$ DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' RESTART IDENTITY CASCADE';
    END LOOP;
END $$;`);

    await client.end();

    return true;
};
