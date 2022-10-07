import { MigrationInterface, QueryRunner } from "typeorm";

export class EntitiesMigrations1664968183952 implements MigrationInterface {
    name = 'EntitiesMigrations1664968183952'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."token_purpose_enum" AS ENUM('app-user-signup', 'app-user-signin', 'app-user-reset-password', 'project-user-signup', 'project-user-signin', 'project-user-reset-password')`);
        await queryRunner.query(`CREATE TABLE "token" ("id" BIGSERIAL NOT NULL, "valueOfToken" character varying NOT NULL, "expiry" numeric NOT NULL, "purpose" "public"."token_purpose_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "projectUserId" bigint, "appUserId" bigint, CONSTRAINT "PK_82fae97f905930df5d62a702fc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_contact_address" ("id" BIGSERIAL NOT NULL, "type" character varying NOT NULL, "landmark" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" bigint NOT NULL, CONSTRAINT "PK_a453de2e48eb0176fa206b0cfcc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "country" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "phoneCode" character varying NOT NULL DEFAULT '', "currency" character varying NOT NULL DEFAULT '', "code" character varying NOT NULL DEFAULT '', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "street" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "cityId" bigint NOT NULL, CONSTRAINT "PK_5629a676c74c04f5845b964469c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "city" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "countryId" bigint NOT NULL, CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_countries_relationship_enum" AS ENUM('residence', 'birth')`);
        await queryRunner.query(`CREATE TABLE "users_countries" ("id" BIGSERIAL NOT NULL, "relationship" "public"."users_countries_relationship_enum" NOT NULL, "phoneNumber" jsonb, "userId" bigint NOT NULL, "countryId" bigint NOT NULL, "cityId" bigint, "streetId" bigint, CONSTRAINT "PK_027de1f48d0c9455c0d41a463b5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "location" ("lastLocation" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" bigint NOT NULL, CONSTRAINT "REL_bdef5f9d46ef330ddca009a859" UNIQUE ("userId"), CONSTRAINT "PK_bdef5f9d46ef330ddca009a8596" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" BIGSERIAL NOT NULL, "firstName" character varying NOT NULL DEFAULT '', "lastName" character varying NOT NULL DEFAULT '', "email" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "project_user" ("id" BIGSERIAL NOT NULL, "isCreator" boolean, "isAdmin" boolean NOT NULL, "password" character varying NOT NULL, "userId" bigint NOT NULL, "projectId" bigint NOT NULL, CONSTRAINT "PK_1cf56b10b23971cfd07e4fc6126" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "project" ("id" BIGSERIAL NOT NULL, "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "app_user" ("id" BIGSERIAL NOT NULL, "password" character varying NOT NULL, "appId" bigint NOT NULL, "userId" bigint NOT NULL, "projectId" bigint NOT NULL, CONSTRAINT "PK_22a5c4a3d9b2fb8e4e73fc4ada1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "app" ("id" BIGSERIAL NOT NULL, "name" character varying(255) NOT NULL, "requireIdentityValidation" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "tokenId" bigint NOT NULL, "projectId" bigint NOT NULL, CONSTRAINT "PK_9478629fc093d229df09e560aea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "file" ("id" BIGSERIAL NOT NULL, "forEntity" character varying, "entityRecordId" bigint, "addedByEntity" character varying, "addedByEntityId" bigint, "fileName" character varying NOT NULL, "fileExtension" character varying NOT NULL, "fileUniqueKey" character varying NOT NULL, "fileSize" numeric(10,2) NOT NULL, "filePurpose" character varying, "fileServerStatus" character varying, "serverGeneratedFileUploadId" character varying, "ownerProfileCollectionId" bigint, "otherFileDetails" json, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_36b46d232307066b3a2c9ea3a1" ON "file" ("id") `);
        await queryRunner.query(`CREATE INDEX "IDX_825a0ba5887198f9e109c51fa9" ON "file" ("forEntity") `);
        await queryRunner.query(`CREATE INDEX "IDX_8a28d95586203fde9abdc5ed98" ON "file" ("entityRecordId") `);
        await queryRunner.query(`CREATE INDEX "IDX_b4a20d7b9bb0ac33a813a4091b" ON "file" ("addedByEntity") `);
        await queryRunner.query(`CREATE INDEX "IDX_5f728571485f1c3242046033c4" ON "file" ("addedByEntityId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8b057c719c6bec9402895e992d" ON "file" ("fileUniqueKey") `);
        await queryRunner.query(`CREATE INDEX "IDX_13de5479837fc0f4ea1a5f23f2" ON "file" ("fileSize") `);
        await queryRunner.query(`CREATE INDEX "IDX_b99597d0502727168be8ee7a63" ON "file" ("filePurpose") `);
        await queryRunner.query(`CREATE INDEX "IDX_c40243b30b30087fc0cef9c236" ON "file" ("fileServerStatus") `);
        await queryRunner.query(`CREATE INDEX "IDX_bce35b64b7eab1247fecc1bc17" ON "file" ("serverGeneratedFileUploadId") `);
        await queryRunner.query(`CREATE INDEX "IDX_df4814322f07b73645ce047a92" ON "file" ("ownerProfileCollectionId") `);
        await queryRunner.query(`CREATE INDEX "IDX_18a0ad156828b598fcef570209" ON "file" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_d336bee718f4b96da84e8a2b1c" ON "file" ("updatedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_335685f380a445ccd86ca2c1d6" ON "file" ("deletedAt") `);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_96a7f95390cb776160dd97502c0" FOREIGN KEY ("appUserId") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "token" ADD CONSTRAINT "FK_d6b4fd637bdbc213ab5b2cd0d0a" FOREIGN KEY ("projectUserId") REFERENCES "project_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_contact_address" ADD CONSTRAINT "FK_c65ff20aa0e6b7989d06b6bb45e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "street" ADD CONSTRAINT "FK_63e77aa35e560f5b1615f149a7f" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "city" ADD CONSTRAINT "FK_990b8a57ab901cb812e2b52fcf0" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_countries" ADD CONSTRAINT "FK_6f7f76314485ebd1c0baed67364" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_countries" ADD CONSTRAINT "FK_ee34ff06f32c89bf173d617d2e2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_countries" ADD CONSTRAINT "FK_db0b948081ccea5422b50a053fa" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_countries" ADD CONSTRAINT "FK_b1c0138f0d2598269bdb3c02e93" FOREIGN KEY ("streetId") REFERENCES "street"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "location" ADD CONSTRAINT "FK_bdef5f9d46ef330ddca009a8596" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_user" ADD CONSTRAINT "FK_8d75193a81f827ba8d58575e637" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project_user" ADD CONSTRAINT "FK_be4e7ad73afd703f94b8866eb6b" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD CONSTRAINT "FK_ab2b6c1ca6939c84cedf0c83b8c" FOREIGN KEY ("appId") REFERENCES "app"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD CONSTRAINT "FK_6ea20ce66257c9bfb9f6690d8d1" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD CONSTRAINT "FK_2209b498f827327df14dca660e9" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TABLE "typeorm_cache_table" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_1f1c066da68820c20a4ff873df1" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "typeorm_cache_table"`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP CONSTRAINT "FK_2209b498f827327df14dca660e9"`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP CONSTRAINT "FK_6ea20ce66257c9bfb9f6690d8d1"`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP CONSTRAINT "FK_ab2b6c1ca6939c84cedf0c83b8c"`);
        await queryRunner.query(`ALTER TABLE "project_user" DROP CONSTRAINT "FK_be4e7ad73afd703f94b8866eb6b"`);
        await queryRunner.query(`ALTER TABLE "project_user" DROP CONSTRAINT "FK_8d75193a81f827ba8d58575e637"`);
        await queryRunner.query(`ALTER TABLE "location" DROP CONSTRAINT "FK_bdef5f9d46ef330ddca009a8596"`);
        await queryRunner.query(`ALTER TABLE "users_countries" DROP CONSTRAINT "FK_b1c0138f0d2598269bdb3c02e93"`);
        await queryRunner.query(`ALTER TABLE "users_countries" DROP CONSTRAINT "FK_db0b948081ccea5422b50a053fa"`);
        await queryRunner.query(`ALTER TABLE "users_countries" DROP CONSTRAINT "FK_ee34ff06f32c89bf173d617d2e2"`);
        await queryRunner.query(`ALTER TABLE "users_countries" DROP CONSTRAINT "FK_6f7f76314485ebd1c0baed67364"`);
        await queryRunner.query(`ALTER TABLE "city" DROP CONSTRAINT "FK_990b8a57ab901cb812e2b52fcf0"`);
        await queryRunner.query(`ALTER TABLE "street" DROP CONSTRAINT "FK_63e77aa35e560f5b1615f149a7f"`);
        await queryRunner.query(`ALTER TABLE "user_contact_address" DROP CONSTRAINT "FK_c65ff20aa0e6b7989d06b6bb45e"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_d6b4fd637bdbc213ab5b2cd0d0a"`);
        await queryRunner.query(`ALTER TABLE "token" DROP CONSTRAINT "FK_96a7f95390cb776160dd97502c0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_335685f380a445ccd86ca2c1d6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d336bee718f4b96da84e8a2b1c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_18a0ad156828b598fcef570209"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_df4814322f07b73645ce047a92"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bce35b64b7eab1247fecc1bc17"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c40243b30b30087fc0cef9c236"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b99597d0502727168be8ee7a63"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13de5479837fc0f4ea1a5f23f2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b057c719c6bec9402895e992d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5f728571485f1c3242046033c4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b4a20d7b9bb0ac33a813a4091b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8a28d95586203fde9abdc5ed98"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_825a0ba5887198f9e109c51fa9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_36b46d232307066b3a2c9ea3a1"`);
        await queryRunner.query(`DROP TABLE "file"`);
        await queryRunner.query(`DROP TABLE "app"`);
        await queryRunner.query(`DROP TABLE "app_user"`);
        await queryRunner.query(`DROP TABLE "project"`);
        await queryRunner.query(`DROP TABLE "project_user"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "location"`);
        await queryRunner.query(`DROP TABLE "users_countries"`);
        await queryRunner.query(`DROP TYPE "public"."users_countries_relationship_enum"`);
        await queryRunner.query(`DROP TABLE "city"`);
        await queryRunner.query(`DROP TABLE "street"`);
        await queryRunner.query(`DROP TABLE "country"`);
        await queryRunner.query(`DROP TABLE "user_contact_address"`);
        await queryRunner.query(`DROP TABLE "token"`);
        await queryRunner.query(`DROP TYPE "public"."token_purpose_enum"`);
    }

}
