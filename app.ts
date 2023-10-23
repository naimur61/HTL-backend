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

		app.get("/folders", async (req: Request, res: Response) => {
			const query = {};
			const cursor = folderCollection.find(query);
			const result = await cursor.toArray();
			res.status(200).send(result);
		});

		// app.get("/folders/:id", async (req: Request, res: Response) => {
		// 	const targetId = req.params.id;
		// 	const query = await folderCollection.find().toArray();
		// 	const cursor = findNodeById(query);
		// 	console.log(cursor);

		// 	function findNodeById(query: TreeNode[]):boolean {
		// 		query.map((e: TreeNode) => {
		// 			if (e.id != targetId && e.children?.length !== 0) {
		// 				findNodeById(e.children);
		// 			} else {
		// 				return true;
		// 			}
		// 		});
		// 	}
		// });

		// Get Folder Collection

		// app.get("/folders/:id", async (req: Request, res: Response) => {
		// 	const targetId = req.params.id;
		// 	const query = await folderCollection.find().toArray();
		// 	const result = findNodeById(query);

		// 	console.log(result); // Log the result

		// 	function findNodeById(query: TreeNode[]): boolean {
		// 		for (const node of query) {
		// 			if (node.id !== targetId) {
		// 				return true;
		// 			}

		// 			if (node.children && node.children.length > 0) {
		// 				if (findNodeById(node.children)) {
		// 					return true;
		// 				}
		// 			}
		// 		}

		// 		return false; // Node not found in this branch
		// 	}
		// });

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
