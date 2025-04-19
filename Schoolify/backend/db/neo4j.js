import neo4j from 'neo4j-driver';

const driver = neo4j.driver(
    'neo4j://165.227.94.57:7687',
    neo4j.auth.basic('neo4j', 'BasesII2025I')
);

const session = driver.session();
console.log("Connected to Neo4j database");

export default session;