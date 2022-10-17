import { authenticate } from "../decorators/auth/authenticate.decorator";
import { Controller } from "../decorators/controller.decorator";
import { handleRequest } from "../decorators/handleRequest";
import { Routes } from "../decorators/routes.decorator";
import SigninDto from "../dtos/signinDto";
import SignupDto from "../dtos/signupDto";
import AppUser from "../entities/AppUser";
import User from "../entities/User";
import { HttpResponseHandler } from "../handlers/ResponseHandler";
import { API_PATH_V1 } from "../lib/projectConstants";
import { getExistingAppUser } from "../services/authService";
import { hashPassword, verifyPasswordHash } from "../services/cryptoServices";
import { db } from "../services/databaseServie";

@Controller(`${API_PATH_V1}/app`)
export default class AppController {
    @Routes('/auth/signup')
    @handleRequest({readBody: true})
    @authenticate()
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
        let userExistsOnAppUserTable: boolean = false;
        let userExistsOnUserTable = false;

        // TODO: update the variable above with implementations checking that user with that
            // never existed
        const existingUser = await getExistingAppUser(signupDto.email, appId);
        
        userExistsOnUserTable = existingUser ? true : false;
        userExistsOnAppUserTable = existingUser?.appUserId ? true : false;

        let newAppUser = new AppUser();
        let userData: {[key: string]: string} = {}
        switch (true) {
            case userExistsOnAppUserTable:
                res.sendClientErrors({ message: "User already exists"})
                break;
            case userExistsOnUserTable:
                
                newAppUser.userId = existingUser?.userId as string;
                newAppUser.firstName = signupDto.firstName;
                newAppUser.lastName = signupDto.lastName;

                // TODO: handle implementation for adding phone number. default country
                // should be handled with phone code specificication

                newAppUser.appId = appId;
                newAppUser.password = await hashPassword(signupDto.password);

                await db().transaction(async (trnx) => {
                    newAppUser = await trnx.save(newAppUser);
                    // TODO: could send succesful signup notification email | phone

                })

                userData = { id: existingUser?.userId as string, firstName: newAppUser.firstName, lastName: newAppUser.lastName, email: existingUser?.email as string }
                res.sendJson({userData});
                break;
            default:
                let user = new User();
                user.email = signupDto.email;

                newAppUser.firstName = signupDto.firstName;
                newAppUser.lastName = signupDto.lastName;

                // TODO: handle implementation for adding phone number. default country
                // should be handled with phone code specificication

                newAppUser.appId = appId;
                newAppUser.password = await hashPassword(signupDto.password);

                await db().transaction(async (trnx) => {
                    user = await trnx.save(user);

                    newAppUser.userId = user.id;
                    newAppUser = await trnx.save(newAppUser);
                    // TODO: could send successful signup notification email | phone
                })

                // existingUser.userId is the id from the User table
                userData = { id: existingUser?.userId as string, firstName: newAppUser.firstName, lastName: newAppUser.lastName, email: existingUser?.email as string }
                res.sendJson({userData});
                break;
        }

        // return not allowed response when user email 
        // or reference already exist on user or app - user
    }

    @Routes('/auth/signin')
    @handleRequest({ readBody: true })
    @authenticate()
    async signin(res: HttpResponseHandler): Promise<void> {
        const appId = res.get<string>('authTokenPayload', 'appData.id');
        const [signinDto, validationErrors] = await res.readValidatePostBody(SigninDto, res.body);

        if (validationErrors.length > 0) {
            res.handleValidationErrors(validationErrors);
            return;
        }

        // check that email exists on user table
        // check user exist in app user table
        const existingAppUser = await getExistingAppUser(signinDto.email, appId);
        if (!existingAppUser) {
            res.handleUnauthorizedAccess({ message: 'User details not found.'});
            return;
        }

        // check verify password
        const passwordIsValid = await verifyPasswordHash(signinDto.password, existingAppUser.passwordHash)
        if (!passwordIsValid) {
            res.handleUnauthorizedAccess({ message: 'Invalid password.'});
            return;
        }

        const appUser = await db().createQueryBuilder(AppUser, 'appUser')
        .select('user.id', 'id')
        .addSelect('user.email', 'userEmail')
        .addSelect('appUser.firstName', 'firstName')
        .addSelect('appUser.lastName', 'lastName')
        .innerJoin('appUser.user', 'user')
        .where('app.id = :appId', {appId})
        .groupBy('appUser.id')
        .addGroupBy('user.id')
        .getRawOne();

        res.sendJson({appUser});
    }
}