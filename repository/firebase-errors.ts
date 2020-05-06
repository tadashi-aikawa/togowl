import { TogowlError } from "~/domain/common/TogowlError";

export class LoginError extends TogowlError {
  code = "LOGIN";
  name = "Login error.";

  static of(args: { detail: string; stack?: string }): LoginError {
    return new LoginError(args.detail, args.stack);
  }
}

export class LoadUserError extends TogowlError {
  code = "LOAD_USER";
  name = "Load user error.";

  static of(args: { detail: string; stack?: string }): LoadUserError {
    return new LoadUserError(args.detail, args.stack);
  }
}

export class SaveSlackConfigError extends TogowlError {
  code = "SAVE_SLACK_CONFIG";
  name = "Save slack config error.";

  static of(args: { detail: string; stack?: string }): SaveSlackConfigError {
    return new SaveSlackConfigError(args.detail, args.stack);
  }
}

export class LoadSlackConfigError extends TogowlError {
  code = "LoAD_SLACK_CONFIG";
  name = "Load slack config error.";

  static of(args: { detail: string; stack?: string }): LoadSlackConfigError {
    return new LoadSlackConfigError(args.detail, args.stack);
  }
}

export class SaveRecentTaskError extends TogowlError {
  code = "SAVE_RECENT_TASK";
  name = "Save recent task error.";

  static of(args: { detail: string; stack?: string }): SaveRecentTaskError {
    return new SaveRecentTaskError(args.detail, args.stack);
  }
}

export class SaveTimerConfigError extends TogowlError {
  code = "SAVE_TIMER_CONFIG";
  name = "Save timer config error.";

  static of(args: { detail: string; stack?: string }): SaveTimerConfigError {
    return new SaveTimerConfigError(args.detail, args.stack);
  }
}

export class LoadTimerConfigError extends TogowlError {
  code = "LoAD_TIMER_CONFIG";
  name = "Load timer config error.";

  static of(args: { detail: string; stack?: string }): LoadTimerConfigError {
    return new LoadTimerConfigError(args.detail, args.stack);
  }
}

export class SaveTaskConfigError extends TogowlError {
  code = "SAVE_TASK_CONFIG";
  name = "Save task config error.";

  static of(args: { detail: string; stack?: string }): SaveTaskConfigError {
    return new SaveTaskConfigError(args.detail, args.stack);
  }
}

export class LoadTaskConfigError extends TogowlError {
  code = "LOAD_TASK_CONFIG";
  name = "Load task config error.";

  static of(args: { detail: string; stack?: string }): LoadTaskConfigError {
    return new LoadTaskConfigError(args.detail, args.stack);
  }
}

export class SaveProjectConfigError extends TogowlError {
  code = "SAVE_PROJECT_CONFIG";
  name = "Save project config error.";

  static of(args: { detail: string; stack?: string }): SaveProjectConfigError {
    return new SaveProjectConfigError(args.detail, args.stack);
  }
}

export class LoadProjectConfigError extends TogowlError {
  code = "LOAD_PROJECT_CONFIG";
  name = "Load project config error.";

  static of(args: { detail: string; stack?: string }): LoadProjectConfigError {
    return new LoadProjectConfigError(args.detail, args.stack);
  }
}

export class SaveProjectCategoryConfigError extends TogowlError {
  code = "SAVE_PROJECT_CATEGORY_CONFIG";
  name = "Save project category config error.";

  static of(args: {
    detail: string;
    stack?: string;
  }): SaveProjectCategoryConfigError {
    return new SaveProjectCategoryConfigError(args.detail, args.stack);
  }
}

export class LoadProjectCategoryConfigError extends TogowlError {
  code = "LOAD_PROJECT_CATEGORY_CONFIG";
  name = "Load project category config error.";

  static of(args: {
    detail: string;
    stack?: string;
  }): LoadProjectCategoryConfigError {
    return new LoadProjectCategoryConfigError(args.detail, args.stack);
  }
}
