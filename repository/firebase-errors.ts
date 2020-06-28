import { TogowlError } from "~/domain/common/TogowlError";

export class LoginError extends TogowlError {
  code = "LOGIN";
  name = "Login error.";

  static of(args: { detail: string }): LoginError {
    return new LoginError(args.detail);
  }
}

export class LoadUserError extends TogowlError {
  code = "LOAD_USER";
  name = "Load user error.";

  static of(args: { detail: string }): LoadUserError {
    return new LoadUserError(args.detail);
  }
}

export class SaveSlackConfigError extends TogowlError {
  code = "SAVE_SLACK_CONFIG";
  name = "Save slack config error.";

  static of(args: { detail: string }): SaveSlackConfigError {
    return new SaveSlackConfigError(args.detail);
  }
}

export class LoadSlackConfigError extends TogowlError {
  code = "LoAD_SLACK_CONFIG";
  name = "Load slack config error.";

  static of(args: { detail: string }): LoadSlackConfigError {
    return new LoadSlackConfigError(args.detail);
  }
}

export class SaveRecentTaskError extends TogowlError {
  code = "SAVE_RECENT_TASK";
  name = "Save recent task error.";

  static of(args: { detail: string }): SaveRecentTaskError {
    return new SaveRecentTaskError(args.detail);
  }
}

export class SaveTimerConfigError extends TogowlError {
  code = "SAVE_TIMER_CONFIG";
  name = "Save timer config error.";

  static of(args: { detail: string }): SaveTimerConfigError {
    return new SaveTimerConfigError(args.detail);
  }
}

export class LoadTimerConfigError extends TogowlError {
  code = "LoAD_TIMER_CONFIG";
  name = "Load timer config error.";

  static of(args: { detail: string }): LoadTimerConfigError {
    return new LoadTimerConfigError(args.detail);
  }
}

export class SaveTaskConfigError extends TogowlError {
  code = "SAVE_TASK_CONFIG";
  name = "Save task config error.";

  static of(args: { detail: string }): SaveTaskConfigError {
    return new SaveTaskConfigError(args.detail);
  }
}

export class LoadTaskConfigError extends TogowlError {
  code = "LOAD_TASK_CONFIG";
  name = "Load task config error.";

  static of(args: { detail: string }): LoadTaskConfigError {
    return new LoadTaskConfigError(args.detail);
  }
}

export class SaveProjectConfigError extends TogowlError {
  code = "SAVE_PROJECT_CONFIG";
  name = "Save project config error.";

  static of(args: { detail: string }): SaveProjectConfigError {
    return new SaveProjectConfigError(args.detail);
  }
}

export class LoadProjectConfigError extends TogowlError {
  code = "LOAD_PROJECT_CONFIG";
  name = "Load project config error.";

  static of(args: { detail: string }): LoadProjectConfigError {
    return new LoadProjectConfigError(args.detail);
  }
}

export class SaveAppConfigError extends TogowlError {
  code = "SAVE_APP_CONFIG";
  name = "Save app config error.";

  static of(args: { detail: string }): SaveAppConfigError {
    return new SaveAppConfigError(args.detail);
  }
}

export class LoadAppConfigError extends TogowlError {
  code = "LOAD_APP_CONFIG";
  name = "Load app config error.";

  static of(args: { detail: string }): LoadAppConfigError {
    return new LoadAppConfigError(args.detail);
  }
}

export class SaveProjectCategoryConfigError extends TogowlError {
  code = "SAVE_PROJECT_CATEGORY_CONFIG";
  name = "Save project category config error.";

  static of(args: { detail: string }): SaveProjectCategoryConfigError {
    return new SaveProjectCategoryConfigError(args.detail);
  }
}

export class LoadProjectCategoryConfigError extends TogowlError {
  code = "LOAD_PROJECT_CATEGORY_CONFIG";
  name = "Load project category config error.";

  static of(args: { detail: string }): LoadProjectCategoryConfigError {
    return new LoadProjectCategoryConfigError(args.detail);
  }
}
