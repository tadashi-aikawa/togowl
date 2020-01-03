import { User } from '~/domain/authentication/vo/User';
import { LoginPayload } from '~/domain/authentication/vo/LoginPayload';
import { TogowlError } from '~/domain/common/TogowlError';
import { Either } from '~/node_modules/fp-ts/lib/Either';
import { SlackConfig } from '~/domain/notification/vo/SlackConfig';

interface CloudRepository {
  login(payload?: LoginPayload): Promise<Either<TogowlError, User>>;
  logout(): void;
  saveSlackConfig(config: SlackConfig): Promise<TogowlError | null>;
}

export default CloudRepository;
