import _ from 'lodash';
import { ValueObject } from '~/utils/vo';
import { ProjectId } from '~/domain/timer/vo/ProjectId';
import { ProjectCategoryId } from '~/domain/timer/vo/ProjectCategoryId';
import { Icon } from '~/domain/common/Icon';

interface Props {
  token?: string;
  workspaceId?: number;
  proxy?: string;
  iconByProject?: {
    [projectId: string]: Icon;
  };
  iconByProjectCategory?: {
    [projectCategoryId: string]: Icon;
  };
}

export class TimerConfig extends ValueObject<Props> {
  static create(
    token?: string,
    workspaceId?: number,
    proxy?: string,
    iconByProject?: { [projectId: string]: Icon },
    iconByProjectCategory?: { [projectCategoryId: string]: Icon },
  ): TimerConfig {
    return new TimerConfig({
      token,
      workspaceId,
      proxy,
      iconByProject,
      iconByProjectCategory,
    });
  }

  get token(): string | undefined {
    return this._value!.token;
  }

  get workspaceId(): number | undefined {
    return this._value!.workspaceId;
  }

  get proxy(): string | undefined {
    return this._value!.proxy;
  }

  get iconByProject():
    | {
        [projectId: string]: {
          url?: string;
          emoji?: string;
        };
      }
    | undefined {
    return _.mapValues(this._value!.iconByProject, icon => ({
      url: icon.url,
      emoji: icon.emoji,
    }));
  }

  get iconByProjectCategory():
    | {
        [projectCategoryId: string]: {
          url?: string;
          emoji?: string;
        };
      }
    | undefined {
    return _.mapValues(this._value!.iconByProjectCategory, icon => ({
      url: icon.url,
      emoji: icon.emoji,
    }));
  }

  getProjectIcon(id: ProjectId): Icon | undefined {
    return this._value!.iconByProject?.[id.value] ?? this._value!.iconByProject?.default;
  }

  getProjectCategoryIcon(id: ProjectCategoryId): Icon | undefined {
    return this._value!.iconByProjectCategory?.[id.value] ?? this._value!.iconByProjectCategory?.default;
  }
}
