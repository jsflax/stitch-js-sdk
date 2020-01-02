import { BaseStitchBrowserIntTestHarness } from "mongodb-stitch-browser-testutils";
import { AnonProviderConfig, MongoConfig, MongoDbRule, MongoDbService, Role, Schema, ServiceResource, Rule, UserpassProviderConfig, UserpassProvider, CustomUserConfigData, StitchFunction } from "mongodb-stitch-core-admin-client";
import { EJSON } from "bson";
import { UserPasswordCredential } from "mongodb-stitch-core-sdk";

const harness = new BaseStitchBrowserIntTestHarness();

beforeAll(() => harness.setup());
afterAll(() => harness.teardown());

describe("StitchAppClient", () => {
	
	it("should define custom data", async () => {
		const { app: appResponse, appResource: app } = await harness.createApp();
		await harness.addProvider(app, new AnonProviderConfig());
		const mongoConfg = new MongoConfig("mongodb://localhost:26000");
		const mongoService = new MongoDbService(mongoConfg);		
		const svc = await harness.addService(app, mongoService);
		
		await harness.addRule(svc[1] as ServiceResource<Rule, MongoDbService>, new MongoDbRule(
			"db1",
			"coll1",
			[new Role()],
			new Schema()
		));

		await harness.addProvider(app,
			new UserpassProvider(new UserpassProviderConfig(
			   "http://emailConfirmUrl.com",
			   "http://resetPasswordUrl.com",
			   "email subject",
			   "password subject")));
				
		await app.customUserData.create(new CustomUserConfigData(
			(svc[0] as MongoDbService).id,
			"db1",
			"coll1",
			"recoome",
			true
		));

		await app.functions.create(new StitchFunction(
			"addUserProfile",
			false,
			`
			exports = async function(color) {
				const coll = context.services.get("mongodb1")
				.db("db1").collection("coll1");
				await coll.insertOne({
					"recoome": context.user.id,
					"favoriteColor": "blue"
				});
				return true;
			}
			`,
			undefined));

		const client = harness.getAppClient(appResponse);
		await harness.registerAndLoginWithUserPass(app, client, "stitch@10gen.com", "stitchuser");
		expect(client.auth.user).toBeDefined();
		expect(client.auth.user!!.customData).toEqual({});

		await client.callFunction("addUserProfile", ["blue"]);

		await client.auth.refreshCustomData();

		expect(client.auth.user!!.customData["favoriteColor"]).toEqual("blue");

		await client.auth.logout();

		await client.auth.loginWithCredential(new UserPasswordCredential("stitch@10gen.com", "stitchuser"));

		expect(client.auth.user!!.customData["favoriteColor"]).toEqual("blue");
	});
});
