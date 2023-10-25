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

interface TreeNode {
	id: string;
	label: string;
	children?: TreeNode[];
}

const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Password}@cluster0.guif9pr.mongodb.net/your-database-name?retryWrites=true&w=majority`;

async function run() {
	const client = new MongoClient(uri);

	try {
		const db = client.db();

		/* <------------------------------------------- Collections  -----------------------------------------> */
		const folderCollection = client.db("Global_server").collection("Folders");

		/* <------------------------------------------- Get Folder -----------------------------------------> */
		// Get all folders
		app.get("/folders", async (req: Request, res: Response) => {
			const query = {};
			const cursor = folderCollection.find(query);
			const result = await cursor.toArray();
			res.status(200).send(result);
		});

		// Catch folder by Id
		app.get("/folders/:id", async (req: Request, res: Response) => {
			const targetId = req.params.id;
			const query = await folderCollection.find().toArray();
			const cursor = findNodeById(query);

			function findNodeById(query: TreeNode[]): boolean | any {
				for (const e of query) {
					if (e.children && e.children.length > 0 && e.id != targetId) {
						findNodeById(e.children);
					} else if (e.id == targetId) {
						res.status(200).send(e);
						console.log(e);
						return;
					}
				}
			}
		});

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
