import {
	WorkerEntrypoint,
	Workflow as WorkflowEntrypoint,
	WorkflowEvent,
	WorkflowStep,
} from "cloudflare:workers";
import type { WorkflowBinding } from "../internal/binding";

export { WorkflowBinding } from "../internal/binding";
export { Engine } from "../internal/engine";

type Env = {
	WORKFLOW: WorkflowBinding;
};
type Params = {
	name: string;
};
export class DemoUserWorkflow extends WorkerEntrypoint {
	async run(events: Array<WorkflowEvent<Params>>, step: WorkflowStep) {
		const { timestamp, payload } = events[0];
		const result = await step.do("First step", async function () {
			return {
				output: "First step result",
			};
		});

		await step.sleep("Wait", "3 seconds");

		const result2 = await step.do("Second step", async function () {
			return {
				output: "Second step result",
			};
		});

		const result3 = await Promise.all([
			step.do("Third step", async function () {
				// if (Math.random() < 0.5) {
				// 	throw new Error("Random error");
				// }

				return {
					output: "Third step result",
				};
			}),
			step.do("Fourth step", async function () {
				return {
					output: "Fourth step result",
				};
			}),
		]);

		// step.do("Unawaited step", async function () {
		// 	throw new Error("Always error");
		// });

		return {
			result,
			result2,
			result3,
			timestamp,
			payload,
		};
	}
}

export default class extends WorkerEntrypoint<Env> {
	async fetch(req: Request) {
		if (new URL(req.url).pathname !== "/") return Response.json({});
		const handle = await this.env.WORKFLOW.create(crypto.randomUUID(), {});
		console.log("before", await handle.status());
		await scheduler.wait(5_000);
		console.log("after", await handle.status());
		// await handle.pause();
		return new Response();
	}
}
