import { authenticate } from "../decorators/auth/authenticate.decorator";
import { Controller } from "../decorators/controller.decorator";
import { handleRequest } from "../decorators/handleRequest";
import { Routes } from "../decorators/routes.decorator";
import AddAppToProjectDto from "../dtos/addAppToProjectDto";
import SigninDto from "../dtos/signinDto";
import SignupDto from "../dtos/signupDto";
import App from "../entities/App";
import AppUser from "../entities/AppUser";
import ProjectUser from "../entities/ProjectUser";
import Token from "../entities/Token";
import User from "../entities/User";
import { HttpResponseHandler } from "../handlers/ResponseHandler";
import { TokenCreationPurpose } from "../lib/enums/tokenCreationPurpose";
import { AuthenticatedAppData } from "../lib/types";
import { signAuthPayload } from "../services/authService";
import { hashPassword } from "../services/cryptoServices";
import { db } from "../services/databaseServie";

@Controller('/users')
export default class ProjetController {
    @Routes('/projects/:projectId/add-app')
    @handleRequest({ readBody: true, params: ['projectId'] })
    @authenticate()
    async addAppToProject(res: HttpResponseHandler): Promise<void> {
        //
        const projectId = res.get<string>('params', 'projectId')
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
            app.projectId = projectId;
            
            app = await transactionManager.save(app);

            const appAccessTokenPayload: AuthenticatedAppData = {
                id: app.id,
                name: app.name,
                creatorUserId: userId,
            }
            appAccessToken = signAuthPayload({appData: appAccessTokenPayload}, '28d')

            let token = new Token();
            token.valueOfToken = appAccessToken;
            token.appId = appAccessToken;
            token.purpose = TokenCreationPurpose.APP_ACCESS_TOKEN;

            await transactionManager.save(token);
            // token.
        })

        res.sendJson({ appAccessToken });
    }

    @Routes('/signup')
    @handleRequest({ readBody: true})
    async signup(res: HttpResponseHandler): Promise<void> {
        // TODO: identity calling app using app access token
        const appId = res.get<string>('authTokenPayload', 'appData.id');
        const [signupDto, validationErrors] = await res.readValidatePostBody(SignupDto, res.body);

        if (validationErrors.length > 0) {
            res.handleValidationErrors(validationErrors);
            return;
        }

        // check user mail does not already on user table
        // reference if it exists
        // const existingAppUser
        let userExistsOnUserTable = false;

        // TODO: update the variable above with implementations checking that user with that
            // never existed
        const existingUser = await db().findOne(User, { where: { email: signupDto.email}})
        
        userExistsOnUserTable = existingUser ? true : false;

        if (userExistsOnUserTable) {
            res.sendClientErrors({ message: "User already exists" });
            return;
        }
        
        let user = new User();
        user.email = signupDto.email;
        user.firstName = signupDto.firstName;
        user.lastName = signupDto.lastName;
            // TODO: handle implementation for adding phone number. default country
            // should be handled with phone code specificication
        
        const projectUser = new ProjectUser();
        projectUser.isAdmin = true;
        projectUser.password = await hashPassword(signupDto.password);
        await db().transaction(async (trnx) => {
            user = await trnx.save(user);

            projectUser.userId = user.id;
            await trnx.save(projectUser);
        })
        // existingUser.userId is the id from the User table
        const userData = { id: user.id as string, firstName: user.firstName, lastName: user.lastName, email: user.email as string }
                    // TODO: could send successful signup notification email | phone
        const token = signAuthPayload({userData});
        res.sendJson({token});
    }

    @Routes('/signin')
    @handleRequest({ readBody: true})
    async signin(res: HttpResponseHandler): Promise<void> {
        const [signinDto, validationErrors] = await res.readValidatePostBody(SigninDto, res.body);
        if (validationErrors.length > 0) {
            res.handleValidationErrors(validationErrors);
        }

        // check email with user exists
    }
}