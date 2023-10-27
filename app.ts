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

// Interface for type
interface TreeNode {
	id: string;
	label: string;
	children?: TreeNode[];
}

// function for generated Id
function generateUniqueId(): string {
	return new ObjectId().toHexString();
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

		// Create folder by Id
		app.post("/folders/:id", async (req: Request, res: Response) => {
			const targetId = req.params.id;

			const label = req.body.label;
			const childNode = {
				id: generateUniqueId(),
				label,
				children: [],
			};
			const query = await folderCollection.find().toArray();
			const oldData = query;
			const filter = findNodeById(query);

			async function findNodeById(query: TreeNode[]): Promise<boolean | any> {
				for (const e of query) {
					if (e.children && e.children.length > 0 && e.id != targetId) {
						findNodeById(e.children);
					} else if (e.id == targetId) {
						const cursor = await e.children?.push(childNode);
						const drop = await folderCollection.deleteOne({ label: "Root" });
						const result = await folderCollection.insertMany(oldData);
						res.status(200).send(result);
					}
				}
			}
		});

		// Delete Folder

		// app.delete("/delete/:id", async (req: Request, res: Response) => {
		// 	const targetId = req.params.id;
		// 	// console.log(targetId);
		// 	const query = await folderCollection.find().toArray();
		// 	const oldData = query;
		// 	findNodeById(query);

		// 	async function findNodeById(query: TreeNode[]): Promise<boolean | any> {
		// 		for (const e of query) {
		// 			if (e.children && e.children.length > 0 && e.id != targetId) {
		// 				findNodeById(e.children);
		// 			} else if (e.id == targetId) {
		// 				// const newData = query.filter((item) => item.id !== targetId);
		// 				query.updata( { $unset: { "e.id": 1 } } )

		// 				// console.log(oldData.children);
		// 				res.status(200).send(oldData);
		// 			}
		// 		}
		// 	}
		// });

		app.delete("/delete/:id", async (req: Request, res: Response) => {
			const targetId = req.params.id;

			const documentId = "65391202a13e02069487227e";

			const pipeline = [
				{
					$match: { id: documentId },
				},
				{
					$project: {
						tree: {
							$reduce: {
								input: "$tree",
								initialValue: [],
								in: {
									$concatArrays: [
										"$$value",
										{
											$cond: {
												if: { $eq: ["$$this.id", targetId] },
												then: [],
												else: ["$$this"],
											},
										},
									],
								},
							},
						},
					},
				},
			];

			const updatedTree = await folderCollection.aggregate(pipeline).toArray();

			if (updatedTree.length > 0) {
				const updatedDocument = updatedTree[0];
				await folderCollection.replaceOne({ _id: new ObjectId(documentId) }, updatedDocument);
				res.status(200).json({ message: "Object deleted successfully" });
			} else {
				res.status(404).json({ message: "Object not found" });
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
