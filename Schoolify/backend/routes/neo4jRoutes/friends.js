import express from 'express';
import session from '../../db/neo4j.js';

const neo4jRouter = express.Router();

// Send friend request to a friend
neo4jRouter.post('/accept-friend-request', async (req, res) => {
    const { myUsername, friendUsername } = req.body;

    try {
        console.log('Accepting friend request:', myUsername, friendUsername);
        await session.run(
            `
            MERGE (a:User {username: $myUsername})
            MERGE (b:User {username: $friendUsername})
            MERGE (a)-[:FRIENDS_WITH]-(b)
            RETURN a, b
            `,
            { myUsername, friendUsername }
        );
        res.status(200).send({message: `Friend request accepted, now ${myUsername} and ${friendUsername} are friends` });
    } catch (err) {
        res.status(500).send({ message: 'Error accepting friend request', error: err.message });
    }
});

// Create a relationship between a user (student) and a teacher
neo4jRouter.post('/create-teacher-student', async (req, res) => {
    const { studentUsername, teacherUsername } = req.body;

    try {
        console.log('Creating student-teacher relationship:', studentUsername, teacherUsername);
        await session.run(
            `
            MERGE (a:User {username: $studentUsername})
            MERGE (b:User {username: $teacherUsername})
            MERGE (a)-[:IS_STUDENT]->(b)
            MERGE (b)-[:IS_TEACHER]->(a)
            RETURN a, b
            `,
            { studentUsername, teacherUsername }
        );
        res.status(200).send({message: `Created relationship student: ${studentUsername} and teacher: ${teacherUsername}` });
    } catch (err) {
        res.status(500).send({ message: 'Error creating relationship', error: err.message });
    }
});

neo4jRouter.get("/get-friends/:username", async (req, res) => {
    const { username } = req.params;
    console.log('Fetching friends for:', username);
    try {
        console.log('Fetching friends for:', username);
        const result = await session.run(
            `
            MATCH (a:User {username: $username})-[:FRIENDS_WITH]-(b:User)
            RETURN b.username AS friend
            `,
            { username }
        );

        const friends = result.records.map(record => record.get('friend'));
        res.status(200).send({ friends });
    } catch (err) {
        res.status(500).send({ message: 'Error fetching friends', error: err.message });
    }
});

neo4jRouter.get("/get-teachers", async (req, res) => {
    const { username } = req.body;

    try {
        console.log('Fetching teachers for:', username);
        const result = await session.run(
            `
            MATCH (a:User {username: $username})-[:IS_STUDENT]->(b:User)
            RETURN b.username AS teacher
            `,
            { username }
        );

        const teachers = result.records.map(record => record.get('teacher'));
        res.status(200).send({ teachers });
    } catch (err) {
        res.status(500).send({ message: 'Error fetching teachers', error: err.message });
    }
});

neo4jRouter.get("/get-students", async (req, res) => {
    const { username } = req.body;

    try {
        console.log('Fetching students for:', username);
        const result = await session.run(
            `
            MATCH (a:User {username: $username})-[:IS_TEACHER]->(b:User)
            RETURN b.username AS student
            `,
            { username }
        );

        const students = result.records.map(record => record.get('student'));
        res.status(200).send({ students });
    } catch (err) {
        res.status(500).send({ message: 'Error fetching students', error: err.message });
    }
});

// unfriend a friend
neo4jRouter.post('/unfriend', async (req, res) => {
    const { myUsername, friendUsername } = req.body;

    try {
        console.log('Unfriending:', myUsername, friendUsername);
        await session.run(
            `
            MATCH (a:User {username: $myUsername})-[r:FRIENDS_WITH]-(b:User {username: $friendUsername})
            DELETE r
            RETURN a, b
            `,
            { myUsername, friendUsername }
        );
        res.status(200).send({message: `Unfriended ${friendUsername}` });
    } catch (err) {
        res.status(500).send({ message: 'Error unfriending', error: err.message });
    }
});

export default neo4jRouter;