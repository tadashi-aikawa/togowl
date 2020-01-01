import { User } from '~/domain/authentication/vo/User';
import { LoginPayload } from '~/domain/authentication/vo/LoginPayload';
import { TogowlError } from '~/domain/common/TogowlError';
import { Either } from '~/node_modules/fp-ts/lib/Either';

interface CloudRepository {
  login(payload: LoginPayload): Promise<Either<TogowlError, User>>;
}

export default CloudRepository;
