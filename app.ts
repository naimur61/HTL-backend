import { Request, Response } from "express";
import express, { Application } from "express";
const cors = require("cors");
const app: Application = express();
const port = process.env.PORT || 5000;

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

// Middle Ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@cluster0.guif9pr.mongodb.net/your-database-name?retryWrites=true&w=majority`;

async function run() {
	const client = new MongoClient(uri);

	try {
		const db = client.db();

		/* <------------------------------------------- Collections  -----------------------------------------> */
		const folderCollection = client.db("Global_server").collection("Folders");

		/* <------------------------------------------- Get Folder -----------------------------------------> */

		app.get("/cars", async (req: Request, res: Response) => {
			const query = {};
			const result = folderCollection.find(query);
			const projects = await result.toArray();
			res.status(200).send(projects);
		});

		// Get Folder Collection

		/* <-------------------------------------------  X  -----------------------------------------> */
		app.get("/", (req: Request, res: Response) => {
			res.send("Global Server");
		});
	} finally {
	}
}
run().catch(console.dir);

app.listen(port, () => {
	console.log(`node is running in ${port}`);
});
