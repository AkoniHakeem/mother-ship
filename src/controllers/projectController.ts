import { authenticate } from "../decorators/auth/authenticate.decorator";
import { Controller } from "../decorators/controller.decorator";
import { handleRequest } from "../decorators/handleRequest";
import { Routes } from "../decorators/routes.decorator";
import AddAppToProjectDto from "../dtos/addAppToProjectDto";
import App from "../entities/App";
import AppUser from "../entities/AppUser";
import Token from "../entities/Token";
import { HttpResponseHandler } from "../handlers/ResponseHandler";
import { TokenCreationPurpose } from "../lib/enums/tokenCreationPurpose";
import { AuthenticatedAppData } from "../lib/types";
import { signAuthPayload } from "../services/authService";
import { db } from "../services/databaseServie";

@Controller('/projects')
export default class ProjetController {
    @Routes('/add-app')
    @handleRequest({ readBody: true })
    @authenticate()
    async addAppToProject(res: HttpResponseHandler): Promise<void> {
        //
        const authUserProjectId = res.get<string>('authTokenPayload', 'project.id')
        const userId = res.get<string>('authTokenPayload', 'userData.id')
        const [addAppToProjectDto, validationErrors] = await res.readValidatePostBody(AddAppToProjectDto, res.body);

        if (validationErrors.length > 0) {
            res.handleValidationErrors(validationErrors);
            return;
        }


        let appAccessToken = ''
        await db().transaction(async (transactionManager) => {
            let app = new App();
            app.name = addAppToProjectDto.appName;
            app.projectId = authUserProjectId;
            
            app = await transactionManager.save(app);

            const appAccessTokenPayload: AuthenticatedAppData = {
                id: app.id,
                name: app.name,
                creatorUserId: userId,
            }
            appAccessToken = signAuthPayload({appData: appAccessTokenPayload}, '28d')

            let token = new Token();
            token.valueOfToken = appAccessToken;
            token.purpose = TokenCreationPurpose.APP_ACCESS_TOKEN;

            await transactionManager.save(token);
            // token.
        })

        res.sendJson({ appAccessToken });
    }
}