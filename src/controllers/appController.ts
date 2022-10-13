import { authenticate } from "../decorators/auth/authenticate.decorator";
import { Controller } from "../decorators/controller.decorator";
import { handleRequest } from "../decorators/handleRequest";
import { Routes } from "../decorators/routes.decorator";
import SignupDto from "../dtos/signupDto";
import AppUser from "../entities/AppUser";
import User from "../entities/User";
import { HttpResponseHandler } from "../handlers/ResponseHandler";
import { API_PATH_V1 } from "../lib/projectConstants";
import { signAuthPayload } from "../services/authService";
import { hashPassword } from "../services/cryptoServices";
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
        const existingUser = (await db().createQueryBuilder(User, 'user')
            .select('user.id', 'userId')
            .addSelect('appUser.id', 'appUserId')
            .addSelect('user.email', 'email')
            .innerJoin('user.userApps', 'appUser', 'user.id = appUser.userId and appUser.id = :appId')
            .where('user.email = :userEmail', { userEmail: signupDto.email, appId })
            .groupBy('user.id')
            .addGroupBy('appUser.id')
            .getRawOne()) as { userId: string; appUserId: string; email: string } | null;
        
        userExistsOnUserTable = existingUser ? true : false;
        userExistsOnAppUserTable = existingUser?.appUserId ? true : false;

        switch (true) {
            case userExistsOnAppUserTable:
                res.sendClientErrors({ message: "User already exists"})
                break;
            case userExistsOnUserTable:
                let newAppUser = new AppUser();
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

                const authToken = signAuthPayload({userData: { id: existingUser?.userId as string, firstName: newAppUser.firstName, lastName: newAppUser.lastName, email: existingUser?.email as string }})
                res.sendJson({token: authToken})
                break;
            default:
                // save user details when conditions above are not met
                break;
        }

        // return not allowed response when user email 
        // or reference already exist on user or app - user
    }

    @Routes('/auth/signin')
    @handleRequest({ readBody: true })
    async signin(res: HttpResponseHandler): Promise<void> {
        
    }
}