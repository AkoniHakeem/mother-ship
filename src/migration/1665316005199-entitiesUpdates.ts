import { MigrationInterface, QueryRunner } from "typeorm";

export class entitiesUpdates1665316005199 implements MigrationInterface {
    name = 'entitiesUpdates1665316005199'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "app_user_location" ("previousLocation" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "appUserId" bigint NOT NULL, "userId" bigint, CONSTRAINT "REL_db2f747e39f552dffa9a0e7780" UNIQUE ("userId"), CONSTRAINT "PK_015d7183e3153dac1858a90beec" PRIMARY KEY ("appUserId"))`);
        await queryRunner.query(`ALTER TABLE "user_contact_address" ADD "appUserId" bigint`);
        await queryRunner.query(`ALTER TABLE "users_countries" ADD "appUserId" bigint`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "app_user" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "token" ALTER COLUMN "expiry" DROP NOT NULL`);
        await queryRunner.query(`ALTER TYPE "public"."token_purpose_enum" RENAME TO "token_purpose_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."token_purpose_enum" AS ENUM('app-user-signup', 'app-user-signin', 'app-user-reset-password', 'app-access-token', 'project-user-signup', 'project-user-signin', 'project-user-reset-password')`);
        await queryRunner.query(`ALTER TABLE "token" ALTER COLUMN "purpose" TYPE "public"."token_purpose_enum" USING "purpose"::"text"::"public"."token_purpose_enum"`);
        await queryRunner.query(`DROP TYPE "public"."token_purpose_enum_old"`);
        await queryRunner.query(`ALTER TABLE "user_contact_address" DROP CONSTRAINT "FK_c65ff20aa0e6b7989d06b6bb45e"`);
        await queryRunner.query(`ALTER TABLE "user_contact_address" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users_countries" DROP CONSTRAINT "FK_ee34ff06f32c89bf173d617d2e2"`);
        await queryRunner.query(`ALTER TABLE "users_countries" ALTER COLUMN "userId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "app_user_location" ADD CONSTRAINT "FK_db2f747e39f552dffa9a0e7780c" FOREIGN KEY ("userId") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_contact_address" ADD CONSTRAINT "FK_c65ff20aa0e6b7989d06b6bb45e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_contact_address" ADD CONSTRAINT "FK_265987b4b4e621009e62e8334d5" FOREIGN KEY ("appUserId") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_countries" ADD CONSTRAINT "FK_ee34ff06f32c89bf173d617d2e2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_countries" ADD CONSTRAINT "FK_28b69b0690fb11e2f43eb5a3b2e" FOREIGN KEY ("appUserId") REFERENCES "app_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_countries" DROP CONSTRAINT "FK_28b69b0690fb11e2f43eb5a3b2e"`);
        await queryRunner.query(`ALTER TABLE "users_countries" DROP CONSTRAINT "FK_ee34ff06f32c89bf173d617d2e2"`);
        await queryRunner.query(`ALTER TABLE "user_contact_address" DROP CONSTRAINT "FK_265987b4b4e621009e62e8334d5"`);
        await queryRunner.query(`ALTER TABLE "user_contact_address" DROP CONSTRAINT "FK_c65ff20aa0e6b7989d06b6bb45e"`);
        await queryRunner.query(`ALTER TABLE "app_user_location" DROP CONSTRAINT "FK_db2f747e39f552dffa9a0e7780c"`);
        await queryRunner.query(`ALTER TABLE "users_countries" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users_countries" ADD CONSTRAINT "FK_ee34ff06f32c89bf173d617d2e2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_contact_address" ALTER COLUMN "userId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_contact_address" ADD CONSTRAINT "FK_c65ff20aa0e6b7989d06b6bb45e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE TYPE "public"."token_purpose_enum_old" AS ENUM('app-user-signup', 'app-user-signin', 'app-user-reset-password', 'project-user-signup', 'project-user-signin', 'project-user-reset-password')`);
        await queryRunner.query(`ALTER TABLE "token" ALTER COLUMN "purpose" TYPE "public"."token_purpose_enum_old" USING "purpose"::"text"::"public"."token_purpose_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."token_purpose_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."token_purpose_enum_old" RENAME TO "token_purpose_enum"`);
        await queryRunner.query(`ALTER TABLE "token" ALTER COLUMN "expiry" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "app_user" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "users_countries" DROP COLUMN "appUserId"`);
        await queryRunner.query(`ALTER TABLE "user_contact_address" DROP COLUMN "appUserId"`);
        await queryRunner.query(`DROP TABLE "app_user_location"`);
    }

}
